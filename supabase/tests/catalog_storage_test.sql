begin;
create extension if not exists pgtap with schema extensions;
set local search_path = public, extensions;
-- Permite testar DELETE de metadados quando a versão de Storage exige esta flag.
set local storage.allow_delete_query = 'true';
select no_plan();

insert into auth.users (id, email) values
('30000000-0000-0000-0000-000000000001', 'avatar-a@example.test'),
('30000000-0000-0000-0000-000000000002', 'avatar-b@example.test');
insert into public.places (id, name, category)
values ('31000000-0000-0000-0000-000000000001', 'Catálogo de teste', 'cafe');
insert into storage.objects (bucket_id, name)
values ('avatars', '30000000-0000-0000-0000-000000000002.png');

select is((select count(*) from pg_catalog.pg_policies where schemaname = 'storage'
  and tablename = 'objects' and policyname in (
    'Authenticated users can upload avatars', 'Authenticated users can delete their own avatar',
    'Users can update their own avatars', 'Users can delete their own avatars')),
  0::bigint, 'Políticas antigas permissivas foram removidas, inclusive exclusão legada');

set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"30000000-0000-0000-0000-000000000001","role":"authenticated"}', true);
select is((select count(*) from public.places where id = '31000000-0000-0000-0000-000000000001'),
          1::bigint, 'Usuário lê catálogo compartilhado');
select throws_ok($$insert into public.places (name, category) values ('Indevido', 'cafe')$$,
  '42501', null, 'Usuário comum não insere locais');
select throws_ok($$update public.places set name = 'Indevido' where id = '31000000-0000-0000-0000-000000000001'$$,
  '42501', null, 'Usuário comum não altera locais');
select throws_ok($$delete from public.places where id = '31000000-0000-0000-0000-000000000001'$$,
  '42501', null, 'Usuário comum não exclui locais');
select throws_ok($$truncate public.places$$, '42501', null, 'Usuário comum não limpa catálogo por TRUNCATE');
select lives_ok($$insert into storage.objects (bucket_id, name)
  values ('avatars', '30000000-0000-0000-0000-000000000001.PNG')$$,
  'Usuário cria metadados do próprio avatar, inclusive extensão maiúscula');
select lives_ok($$update storage.objects set name = '30000000-0000-0000-0000-000000000001.jpg'
  where bucket_id = 'avatars' and name = '30000000-0000-0000-0000-000000000001.PNG'$$,
  'Usuário atualiza seu próprio avatar');
select is((select count(*) from storage.objects where bucket_id = 'avatars'
  and name = '30000000-0000-0000-0000-000000000001.jpg'),
  1::bigint, 'Atualização do avatar realmente alterou um registro');
select throws_ok($$insert into storage.objects (bucket_id, name)
  values ('avatars', '30000000-0000-0000-0000-000000000002.jpeg')$$,
  '42501', null, 'Não cria avatar no caminho de outra pessoa');
select throws_ok($$insert into storage.objects (bucket_id, name)
  values ('avatars', 'subpasta/30000000-0000-0000-0000-000000000001.png')$$,
  '42501', null, 'Não contorna regra com subpastas');
select throws_ok($$update storage.objects set name = '30000000-0000-0000-0000-000000000002.jpeg'
  where bucket_id = 'avatars' and name = '30000000-0000-0000-0000-000000000001.jpg'$$,
  '42501', null, 'Não renomeia avatar próprio para caminho alheio');
with changed as (update storage.objects set name = '30000000-0000-0000-0000-000000000001.jpeg'
  where bucket_id = 'avatars' and name = '30000000-0000-0000-0000-000000000002.png' returning id)
select is((select count(*) from changed), 0::bigint, 'Não altera avatar de outra pessoa');
with removed as (delete from storage.objects
  where bucket_id = 'avatars' and name = '30000000-0000-0000-0000-000000000002.png' returning id)
select is((select count(*) from removed), 0::bigint, 'Não exclui avatar de outra pessoa');
select is((select count(*) from storage.objects where bucket_id = 'avatars'
  and name = '30000000-0000-0000-0000-000000000002.png'),
  1::bigint, 'Leitura pública de avatares continua permitida por decisão de produto');
with removed as (delete from storage.objects
  where bucket_id = 'avatars' and name = '30000000-0000-0000-0000-000000000001.jpg' returning id)
select is((select count(*) from removed), 1::bigint, 'Usuário exclui seu próprio avatar');

reset role;
set local role anon;
select set_config('request.jwt.claims', '{"role":"anon"}', true);
select is((select count(*) from storage.objects where bucket_id = 'avatars'
  and name = '30000000-0000-0000-0000-000000000002.png'),
  1::bigint, 'Visitante lê metadados de avatar público');
select throws_ok($$insert into storage.objects (bucket_id, name)
  values ('avatars', '30000000-0000-0000-0000-000000000001.png')$$,
  '42501', null, 'Visitante não envia avatar');
with removed as (delete from storage.objects where bucket_id = 'avatars'
  and name = '30000000-0000-0000-0000-000000000002.png' returning id)
select is((select count(*) from removed),
  0::bigint, 'Visitante não exclui avatar');

reset role;
select * from finish();
rollback;
