begin;
create extension if not exists pgtap with schema extensions;
set local search_path = public, extensions;
select no_plan();
insert into auth.users (id, email) values
('40000000-0000-0000-0000-000000000001', 'delete-a@example.test'),
('40000000-0000-0000-0000-000000000002', 'delete-b@example.test');
insert into public.trips (id, user_id, destination, start_date, end_date) values
('41000000-0000-0000-0000-000000000001', '40000000-0000-0000-0000-000000000001', 'Albania', '2030-01-01', '2030-01-02'),
('41000000-0000-0000-0000-000000000002', '40000000-0000-0000-0000-000000000002', 'Portugal', '2030-01-01', '2030-01-02');
insert into public.expenses (trip_id, title, amount) values
('41000000-0000-0000-0000-000000000001', 'Trip A expense', 10),
('41000000-0000-0000-0000-000000000002', 'Trip B expense', 20);
insert into public.trip_covers (trip_id, destination, status, request_key, retry_after) values
('41000000-0000-0000-0000-000000000001', 'Albania', 'pending', gen_random_uuid(), now()),
('41000000-0000-0000-0000-000000000002', 'Portugal', 'pending', gen_random_uuid(), now());
insert into public.places (id, name, category) values
('42000000-0000-0000-0000-000000000001', 'Independent catalog place', 'cafe');
set local role anon;
select throws_ok($$delete from public.trips where id = '41000000-0000-0000-0000-000000000001'$$,
  '42501', null, 'Unauthenticated clients cannot delete trips');
reset role;
set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"40000000-0000-0000-0000-000000000002","role":"authenticated"}', true);
with deleted as (delete from public.trips where id = '41000000-0000-0000-0000-000000000001' returning id)
select is((select count(*) from deleted), 0::bigint, 'Another account cannot delete the trip even without an owner filter');
select set_config('request.jwt.claims', '{"sub":"40000000-0000-0000-0000-000000000001","role":"authenticated"}', true);
select is((select count(*) from public.trips where id = '41000000-0000-0000-0000-000000000001'), 1::bigint, 'Rejected deletion preserves the trip');
with deleted as (delete from public.trips where id = '41000000-0000-0000-0000-000000000001'
  and user_id = '40000000-0000-0000-0000-000000000001' returning id)
select is((select count(*) from deleted), 1::bigint, 'Authenticated owner deletes exactly the selected trip');
reset role;
-- Check as the database owner: RLS must not hide orphaned records from these assertions.
select is((select count(*) from public.trips where id = '41000000-0000-0000-0000-000000000001'), 0::bigint, 'Trip is physically removed');
select is((select count(*) from public.trip_covers where trip_id = '41000000-0000-0000-0000-000000000001'), 0::bigint, 'Cover cascades without an orphan');
select is((select count(*) from public.expenses where trip_id = '41000000-0000-0000-0000-000000000001'), 0::bigint, 'Only linked expenses cascade');
select is((select count(*) from public.trips where id = '41000000-0000-0000-0000-000000000002'), 1::bigint, 'Unrelated trip remains');
select is((select count(*) from public.expenses where trip_id = '41000000-0000-0000-0000-000000000002'), 1::bigint, 'Unrelated expense remains');
select is((select count(*) from public.trip_covers where trip_id = '41000000-0000-0000-0000-000000000002'), 1::bigint, 'Unrelated cover remains');
select is((select count(*) from public.places where id = '42000000-0000-0000-0000-000000000001'), 1::bigint, 'Independent places catalog remains');
select is((select count(*) from public.profiles where id = '40000000-0000-0000-0000-000000000001'), 1::bigint, 'Owner profile remains');
select * from finish();
rollback;
