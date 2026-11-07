begin;
create extension if not exists pgtap with schema extensions;
set local search_path = public, extensions;
select plan(8);

-- Fixture apenas quando a plataforma local não fornece a função. A migration
-- real é incluída abaixo; não há cópia da lógica de REVOKE no teste.
do $fixture$
begin
  if to_regprocedure('public.rls_auto_enable()') is null then
    execute $definition$
      create function public.rls_auto_enable() returns event_trigger
      language plpgsql security definer set search_path = pg_catalog as $body$
      declare cmd record;
      begin
        for cmd in select * from pg_event_trigger_ddl_commands()
          where command_tag in ('CREATE TABLE','CREATE TABLE AS','SELECT INTO')
            and object_type in ('table','partitioned table')
        loop
          if cmd.schema_name = 'public' then
            execute format('alter table %s enable row level security', cmd.object_identity);
          end if;
        end loop;
      end;
      $body$;
    $definition$;
  end if;
  if not exists (select 1 from pg_event_trigger where evtfoid = 'public.rls_auto_enable()'::regprocedure and evtenabled = 'O') then
    create event trigger go_nomad_rls_fixture on ddl_command_end
      when tag in ('CREATE TABLE','CREATE TABLE AS','SELECT INTO')
      execute function public.rls_auto_enable();
  end if;
end;
$fixture$;

create temporary table rls_function_before as
select pg_get_functiondef(p.oid) as definition, p.proconfig, p.prosecdef
from pg_proc p where p.oid = 'public.rls_auto_enable()'::regprocedure;
create temporary table rls_triggers_before as
select oid, evtenabled, evtfoid, evtevent, evttags from pg_event_trigger
where evtfoid = 'public.rls_auto_enable()'::regprocedure;

-- O roteiro copia somente esta migration como .inc junto aos testes no container.
\ir rls_auto_enable_migration.inc

select ok(not has_function_privilege('anon', 'public.rls_auto_enable()', 'execute'), 'anon não executa a função privilegiada');
select ok(not has_function_privilege('authenticated', 'public.rls_auto_enable()', 'execute'), 'authenticated não executa a função privilegiada');
select ok(not exists (
  select 1 from pg_proc p, lateral aclexplode(coalesce(p.proacl, acldefault('f',p.proowner))) a
  where p.oid = 'public.rls_auto_enable()'::regprocedure and a.grantee = 0 and a.privilege_type = 'EXECUTE'
), 'PUBLIC não possui EXECUTE');
select is(pg_get_functiondef('public.rls_auto_enable()'::regprocedure),
  (select definition from rls_function_before), 'Corpo e configuração da função preservados');
select ok((select prosecdef from pg_proc where oid = 'public.rls_auto_enable()'::regprocedure), 'SECURITY DEFINER preservado');
select is((select count(*) from rls_triggers_before b join pg_event_trigger e using (oid)
  where b.evtenabled = e.evtenabled and b.evtfoid = e.evtfoid and b.evtevent = e.evtevent and b.evttags is not distinct from e.evttags),
  (select count(*) from rls_triggers_before), 'Vínculos, eventos e status dos event triggers preservados');
create table public.go_nomad_rls_probe (id integer);
select ok((select relrowsecurity from pg_class where oid = 'public.go_nomad_rls_probe'::regclass),
  'Novo CREATE TABLE continua recebendo RLS automaticamente');
select lives_ok('create table public.go_nomad_rls_probe_2 (id integer)', 'DDL administrativo continua funcionando após REVOKE');
select * from finish();
rollback;
