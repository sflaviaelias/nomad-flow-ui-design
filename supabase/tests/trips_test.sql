begin;
create extension if not exists pgtap with schema extensions;
set local search_path = public, extensions;
select no_plan();

insert into auth.users (id, email) values
('20000000-0000-0000-0000-000000000001', 'viajante-a@example.test'),
('20000000-0000-0000-0000-000000000002', 'viajante-b@example.test');

set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"20000000-0000-0000-0000-000000000001","role":"authenticated"}', true);
select lives_ok($$insert into public.trips (id, user_id, destination, start_date, end_date, budget, currency, checklist)
  values ('21000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001',
          'Porto, Portugal', '2027-05-01', '2027-05-15', 2500.50, 'BRL', '["Passaporte"]')$$,
  'Usuário salva sua própria viagem');
select is((select budget from public.trips where id = '21000000-0000-0000-0000-000000000001'),
          2500.50::numeric, 'Orçamento recuperado sem alteração');
select is((select checklist from public.trips where id = '21000000-0000-0000-0000-000000000001'),
          '["Passaporte"]'::jsonb, 'Checklist recuperado');
select lives_ok($$update public.trips set budget = 2600 where id = '21000000-0000-0000-0000-000000000001'$$,
  'Usuário atualiza sua própria viagem');
select throws_ok($$update public.trips set user_id = '20000000-0000-0000-0000-000000000002'
  where id = '21000000-0000-0000-0000-000000000001'$$, '42501', null, 'Não transfere viagem para outra conta');
select throws_ok($$insert into public.trips (user_id, destination, start_date, end_date)
  values ('20000000-0000-0000-0000-000000000002', 'Porto', '2027-05-01', '2027-05-15')$$,
  '42501', null, 'Não cria viagem para outra conta');
select throws_ok($$insert into public.trips (user_id, destination, start_date, end_date)
  values ('20000000-0000-0000-0000-000000000001', E' \t\n', '2027-05-01', '2027-05-15')$$,
  '23514', null, 'Destino em branco é rejeitado');
select throws_ok($$insert into public.trips (user_id, destination, start_date, end_date)
  values ('20000000-0000-0000-0000-000000000001', 'Porto', '2027-05-15', '2027-05-01')$$,
  '23514', null, 'Datas invertidas são rejeitadas');
select throws_ok($$update public.trips set budget = -1 where id = '21000000-0000-0000-0000-000000000001'$$,
  '23514', null, 'Orçamento negativo é rejeitado');
select throws_ok($$update public.trips set budget = 'NaN'::numeric where id = '21000000-0000-0000-0000-000000000001'$$,
  '23514', null, 'NaN é rejeitado');
select throws_ok($$update public.trips set budget = 'Infinity'::numeric where id = '21000000-0000-0000-0000-000000000001'$$,
  '23514', null, 'Orçamento infinito é rejeitado');
select throws_ok($$update public.trips set start_date = '-infinity'::date where id = '21000000-0000-0000-0000-000000000001'$$,
  '23514', null, 'Data infinita é rejeitada');
select lives_ok($$insert into public.trips (id, user_id, destination, start_date, end_date, budget)
  values ('21000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000001',
          'Lisboa', '2027-06-01', '2027-06-01', 0)$$,
  'Viagem de um dia e orçamento zero são permitidos');
select lives_ok($$update public.trips set budget = null where id = '21000000-0000-0000-0000-000000000003'$$,
  'Orçamento ainda não informado é permitido');
select lives_ok($$insert into public.expenses (id, trip_id, title, amount)
  values ('22000000-0000-0000-0000-000000000001', '21000000-0000-0000-0000-000000000001', 'Café', 5)$$,
  'Usuário cria despesa em sua viagem');
select is((select amount from public.expenses where id = '22000000-0000-0000-0000-000000000001'),
          5::numeric, 'Usuário lê sua própria despesa');
select lives_ok($$update public.expenses set amount = 6 where id = '22000000-0000-0000-0000-000000000001'$$,
  'Usuário atualiza sua própria despesa');
select is((select amount from public.expenses where id = '22000000-0000-0000-0000-000000000001'),
          6::numeric, 'Atualização da despesa persistida');

-- Simula saída no nível de banco: visitante não tem acesso privado.
reset role;
set local role anon;
select set_config('request.jwt.claims', '{"role":"anon"}', true);
select throws_ok($$select * from public.trips$$, '42501', null, 'Sem sessão não consulta viagens');
select throws_ok($$select * from public.expenses$$, '42501', null, 'Sem sessão não consulta despesas');

reset role;
set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"20000000-0000-0000-0000-000000000002","role":"authenticated"}', true);
select is((select count(*) from public.trips), 0::bigint, 'Outra conta não lê viagens alheias');
select is((select count(*) from public.expenses), 0::bigint, 'Outra conta não lê despesas alheias');
with changed as (update public.trips set destination = 'Invadido'
  where id = '21000000-0000-0000-0000-000000000001' returning id)
select is((select count(*) from changed),
  0::bigint, 'Outra conta não altera viagem');
with removed as (delete from public.trips
  where id = '21000000-0000-0000-0000-000000000001' returning id)
select is((select count(*) from removed),
  0::bigint, 'Outra conta não exclui viagem');
with changed as (update public.expenses set amount = 999
  where id = '22000000-0000-0000-0000-000000000001' returning id)
select is((select count(*) from changed),
  0::bigint, 'Outra conta não altera despesa');
with removed as (delete from public.expenses
  where id = '22000000-0000-0000-0000-000000000001' returning id)
select is((select count(*) from removed),
  0::bigint, 'Outra conta não exclui despesa');
select throws_ok($$insert into public.expenses (trip_id, title, amount)
  values ('21000000-0000-0000-0000-000000000001', 'Invadida', 1)$$,
  '42501', null, 'Outra conta não insere despesa na viagem alheia');
insert into public.trips (id, user_id, destination, start_date, end_date)
  values ('21000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000002',
          'Recife', '2027-05-01', '2027-05-02');

-- Volta à conta original: dados continuam no banco após troca de identidade.
reset role;
set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"20000000-0000-0000-0000-000000000001","role":"authenticated"}', true);
select is((select destination from public.trips where id = '21000000-0000-0000-0000-000000000001'),
          'Porto, Portugal', 'Conta original recupera a viagem salva');
select throws_ok($$update public.expenses set trip_id = '21000000-0000-0000-0000-000000000002'
  where id = '22000000-0000-0000-0000-000000000001'$$,
  '42501', null, 'Não transfere despesa para viagem alheia');
select throws_ok($$delete from public.profiles where id = '20000000-0000-0000-0000-000000000001'$$,
  '42501', null, 'Exclusão de perfil não pode apagar a viagem por cascata');
select is((select count(*) from public.trips where id = '21000000-0000-0000-0000-000000000001'),
          1::bigint, 'Viagem continua presente após exclusão negada');
select lives_ok($$delete from public.trips where id = '21000000-0000-0000-0000-000000000003'$$,
  'Usuário ainda pode excluir sua viagem explicitamente');

reset role;
select throws_ok($$insert into public.trips (destination, start_date, end_date)
  values ('Sem dono', '2027-05-01', '2027-05-02')$$,
  '23502', null, 'Mesmo operação privilegiada não cria viagem sem dono');
select throws_ok($$insert into public.expenses (title, amount) values ('Sem viagem', 1)$$,
  '23502', null, 'Despesa requer viagem');
select * from finish();
rollback;
