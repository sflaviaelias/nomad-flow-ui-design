begin;
create extension if not exists pgtap with schema extensions;
set local search_path = public, extensions;
select no_plan();

insert into auth.users (id, email, raw_user_meta_data) values
('10000000-0000-0000-0000-000000000001', 'ana@example.test',
 '{"name":"Ana","birthdate":"1990-05-20","country":"Brasil","travel_profiles":["Remoto"]}'),
('10000000-0000-0000-0000-000000000002', 'bia@example.test', '{}'),
('10000000-0000-0000-0000-000000000003', 'caio@example.test',
 '{"name":" ","birthdate":"invalida","travel_profiles":"invalido"}');

select is((select count(*) from public.profiles where id::text like '10000000-%'),
          3::bigint, 'Cada conta de teste recebe um perfil automaticamente');
select is((select name from public.profiles where email = 'ana@example.test'), 'Ana', 'Nome preservado');
select is((select birth_date from public.profiles where email = 'ana@example.test'),
          '1990-05-20'::date, 'Nascimento mapeado');
select is((select preferences->>'nationality' from public.profiles where email = 'ana@example.test'),
          'Brasil', 'Nacionalidade não é confundida com residência');
select is((select preferences->'travel_profiles' from public.profiles where email = 'ana@example.test'),
          '["Remoto"]'::jsonb, 'Preferências de viagem preservadas');
select is((select name from public.profiles where email = 'bia@example.test'), 'bia', 'Nome ausente tem fallback');
select is((select birth_date from public.profiles where email = 'caio@example.test'), null::date,
          'Nascimento inválido não bloqueia criação da conta');
select is((select preferences->'travel_profiles' from public.profiles where email = 'caio@example.test'),
          '[]'::jsonb, 'Metadados de tipo inesperado têm fallback');
select is((select count(*) from pg_catalog.pg_trigger where tgname = 'check_duplicate_email'),
          0::bigint, 'Trigger antigo de e-mail removido');
select ok(not has_function_privilege('authenticated', 'public.handle_auth_user_profile()', 'EXECUTE'),
          'Cliente não pode executar função privilegiada diretamente');
select throws_ok($$insert into auth.users (id, email)
  values ('10000000-0000-0000-0000-000000000004', 'ana@example.test')$$,
  '23505', null, 'Conflito de perfil aborta também o cadastro da conta');
select is((select count(*) from auth.users where id = '10000000-0000-0000-0000-000000000004'),
          0::bigint, 'Falha não deixa conta sem perfil');

set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"10000000-0000-0000-0000-000000000001","role":"authenticated"}', true);
select is((select count(*) from public.profiles), 1::bigint, 'Ana só lê seu perfil, sem filtro no cliente');
select lives_ok($$insert into public.profiles (id, name, email, preferences)
  values ('10000000-0000-0000-0000-000000000001', 'Ana atualizada', 'ana@example.test', '{"language":"pt-BR"}')
  on conflict (id) do update set name = excluded.name, preferences = excluded.preferences$$,
  'Upsert do próprio perfil não falha por e-mail duplicado');
select is((select name from public.profiles), 'Ana atualizada', 'Atualização persistida');
select lives_ok($$update public.profiles set email = 'bia@example.test'
  where id = '10000000-0000-0000-0000-000000000001'$$,
  'Tentativa de trocar e-mail no perfil é normalizada por Auth');
select is((select email from public.profiles), 'ana@example.test', 'Não é possível reservar e-mail de outra conta pelo perfil');
with changed as (update public.profiles set name = 'Invadido'
  where id = '10000000-0000-0000-0000-000000000002' returning id)
select is((select count(*) from changed),
  0::bigint, 'Não atualiza perfil alheio');
select throws_ok($$insert into public.profiles (id, name, email)
  values ('10000000-0000-0000-0000-000000000002', 'Invadido', 'bia@example.test')$$,
  '42501', null, 'Não insere perfil em nome de outra conta');
select throws_ok($$delete from public.profiles where id = '10000000-0000-0000-0000-000000000001'$$,
  '42501', null, 'Cliente não pode excluir o próprio perfil');
select throws_ok($$truncate public.profiles cascade$$, '42501', null, 'Cliente não pode usar TRUNCATE');

reset role;
update auth.users set email = 'ana-novo@example.test' where id = '10000000-0000-0000-0000-000000000001';
select is((select email from public.profiles where id = '10000000-0000-0000-0000-000000000001'),
          'ana-novo@example.test', 'Alteração de e-mail em Auth sincroniza perfil');
select is((select preferences->>'language' from public.profiles where id = '10000000-0000-0000-0000-000000000001'),
          'pt-BR', 'Sincronizar e-mail não apaga preferências');

set local role anon;
select set_config('request.jwt.claims', '{"role":"anon"}', true);
select throws_ok($$select * from public.profiles$$, '42501', null, 'Visitante não lê perfis privados');
reset role;
select * from finish();
rollback;
