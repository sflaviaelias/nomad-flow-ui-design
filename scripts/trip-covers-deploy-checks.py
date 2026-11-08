"""Inspeção de catálogo somente leitura, exclusiva do delta 17."""
import re

# Não lê destinos, fotos, contas nem linhas privadas da tabela.
STATE_SQL = """
with target as (select to_regclass('public.trip_covers') as oid)
select json_build_object(
  'exists', target.oid is not null,
  'rls', coalesce((select c.relrowsecurity and c.relkind = 'r' from pg_class c where c.oid = target.oid), false),
  'public_privileges', (select count(*) from pg_class c,
    lateral aclexplode(coalesce(c.relacl, acldefault('r', c.relowner))) a
    where c.oid = target.oid and a.grantee = 0),
  'policies', coalesce((select json_agg(json_build_object(
    'name', p.polname, 'command', p.polcmd, 'permissive', p.polpermissive,
    'roles', (select json_agg(pg_get_userbyid(role_oid) order by role_oid) from unnest(p.polroles) role_oid),
    'using', pg_get_expr(p.polqual, p.polrelid), 'check', pg_get_expr(p.polwithcheck, p.polrelid)
  )) from pg_policy p where p.polrelid = target.oid), '[]'::json),
  'privileges', (select json_object_agg(r.name, json_build_object(
    'select', has_table_privilege(r.name, target.oid, 'SELECT'),
    'insert', has_table_privilege(r.name, target.oid, 'INSERT'),
    'update', has_table_privilege(r.name, target.oid, 'UPDATE'),
    'delete', has_table_privilege(r.name, target.oid, 'DELETE'),
    'truncate', has_table_privilege(r.name, target.oid, 'TRUNCATE'),
    'references', has_table_privilege(r.name, target.oid, 'REFERENCES'),
    'trigger', has_table_privilege(r.name, target.oid, 'TRIGGER'),
    'column_select', has_any_column_privilege(r.name, target.oid, 'SELECT'),
    'column_write', has_any_column_privilege(r.name, target.oid, 'INSERT,UPDATE,REFERENCES')
  )) from (values ('anon'::text), ('authenticated'::text), ('service_role'::text)) r(name))
) from target
"""


def validate_security(state):
    if state.get('exists') is not True or state.get('rls') is not True:
        raise RuntimeError('trip_covers ausente, não é tabela regular ou RLS desabilitado.')
    if state.get('public_privileges') != 0:
        raise RuntimeError('PUBLIC possui privilégios inesperados em trip_covers.')
    privileges = state.get('privileges', {})
    for role in ('anon', 'authenticated'):
        expected = {name: False for name in ('select', 'insert', 'update', 'delete', 'truncate', 'references', 'trigger', 'column_select', 'column_write')}
        if role == 'authenticated':
            expected.update(select=True, column_select=True)
        if privileges.get(role) != expected:
            raise RuntimeError(f'Permissões inesperadas para {role} em trip_covers.')
    service = privileges.get('service_role', {})
    if any(service.get(name) is not True for name in ('select', 'insert', 'update', 'delete')):
        raise RuntimeError('service_role sem as permissões previstas no cache.')
    policies = state.get('policies', [])
    if len(policies) != 1:
        raise RuntimeError('Conjunto inesperado de políticas de trip_covers.')
    policy = policies[0]
    if (policy.get('name') != 'trip_covers_owner_read' or policy.get('command') != 'r'
            or policy.get('roles') != ['authenticated'] or policy.get('permissive') is not True
            or policy.get('check') is not None):
        raise RuntimeError('Política de leitura diferente da prevista na migration 17.')
    # Aceitar apenas a expressão aprovada; não basta encontrar auth.uid() num OR permissivo.
    expression = re.sub(r'[\s()"]', '', str(policy.get('using', ''))).lower().replace('public.', '')
    expected = 'existsselect1fromtripstwhere' + 't.id=trip_covers.trip_idandt.user_id=selectauth.uidasuid'
    if expression != expected:
        raise RuntimeError('Expressão de propriedade de trip_covers divergente; revisar sem alterar políticas automaticamente.')
