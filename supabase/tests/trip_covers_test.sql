begin;
create extension if not exists pgtap with schema extensions;
set local search_path = public, extensions;
select plan(10);
insert into auth.users (id,email) values
('30000000-0000-0000-0000-000000000001','cover-a@example.test'),
('30000000-0000-0000-0000-000000000002','cover-b@example.test');
insert into public.trips (id,user_id,destination,start_date,end_date) values
('31000000-0000-0000-0000-000000000001','30000000-0000-0000-0000-000000000001','Albânia','2030-01-01','2030-01-02'),
('31000000-0000-0000-0000-000000000002','30000000-0000-0000-0000-000000000002','Portugal','2030-01-01','2030-01-02');
insert into public.trip_covers(trip_id,destination,status,request_key,retry_after) values
('31000000-0000-0000-0000-000000000001','Albânia','pending',gen_random_uuid(),now()),
('31000000-0000-0000-0000-000000000002','Portugal','pending',gen_random_uuid(),now());
select ok((select relrowsecurity from pg_class where oid='public.trip_covers'::regclass),'RLS habilitado no cache');
set local role authenticated;
select set_config('request.jwt.claims','{"sub":"30000000-0000-0000-0000-000000000001","role":"authenticated"}',true);
select is((select count(*) from public.trip_covers),1::bigint,'A lê somente sua capa');
select is((select count(*) from public.trip_covers where trip_id='31000000-0000-0000-0000-000000000002'),0::bigint,'A não lê capa de B');
select throws_ok($$insert into public.trip_covers(trip_id,destination,status,request_key,retry_after) values(gen_random_uuid(),'Injetado','pending',gen_random_uuid(),now())$$,'42501',null,'Cliente não insere fotos');
select throws_ok($$update public.trip_covers set destination='Injetado'$$,'42501',null,'Cliente não modifica fotos');
select throws_ok($$delete from public.trip_covers$$,'42501',null,'Cliente não exclui cache');
select set_config('request.jwt.claims','{"sub":"30000000-0000-0000-0000-000000000002","role":"authenticated"}',true);
select is((select count(*) from public.trip_covers where trip_id='31000000-0000-0000-0000-000000000001'),0::bigint,'B não lê capa de A');
reset role;
set local role anon;
select throws_ok($$select * from public.trip_covers$$,'42501',null,'Visitante não lê capas privadas');
reset role;
select throws_ok($$update public.trip_covers set status='ready',photo=null$$,'23514',null,'Foto ausente não pode estar pronta');
delete from public.trips where id='31000000-0000-0000-0000-000000000001';
select is((select count(*) from public.trip_covers where trip_id='31000000-0000-0000-0000-000000000001'),0::bigint,'Excluir viagem remove cache associado');
select * from finish();
rollback;
