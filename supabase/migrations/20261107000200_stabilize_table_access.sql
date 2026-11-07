begin;

-- Substitui integralmente políticas destas quatro tabelas, inclusive defaults
-- automáticos. Uma política permissiva antiga não pode reabrir o acesso por OU.
do $$
declare
  existing_policy record;
begin
  for existing_policy in
    select tablename, policyname from pg_catalog.pg_policies
    where schemaname = 'public'
      and tablename in ('profiles', 'trips', 'expenses', 'places')
  loop
    execute pg_catalog.format('drop policy %I on public.%I',
                              existing_policy.policyname, existing_policy.tablename);
  end loop;
end;
$$;

alter table public.profiles enable row level security;
alter table public.trips enable row level security;
alter table public.expenses enable row level security;
alter table public.places enable row level security;

revoke all privileges on table public.profiles, public.trips, public.expenses, public.places
  from public, anon, authenticated;
grant usage on schema public to authenticated;
-- INSERT preserva compatibilidade com o upsert atual; o trigger controla e-mail.
grant select, insert, update on public.profiles to authenticated;
grant select, insert, update, delete on public.trips, public.expenses to authenticated;
grant select on public.places to authenticated;
grant select, insert, update, delete on public.profiles, public.trips, public.expenses, public.places
  to service_role;

create policy profiles_select_own on public.profiles
for select to authenticated using (id = (select auth.uid()));
create policy profiles_insert_own on public.profiles
for insert to authenticated with check (id = (select auth.uid()));
create policy profiles_update_own on public.profiles
for update to authenticated using (id = (select auth.uid()))
with check (id = (select auth.uid()));
-- Sem DELETE/TRUNCATE para clientes: excluir perfil não pode apagar viagens.

create policy trips_manage_own on public.trips
for all to authenticated using (user_id = (select auth.uid()))
with check (user_id = (select auth.uid()));

create policy expenses_manage_own on public.expenses
for all to authenticated
using (exists (
  select 1 from public.trips t
  where t.id = expenses.trip_id and t.user_id = (select auth.uid())
))
with check (exists (
  select 1 from public.trips t
  where t.id = expenses.trip_id and t.user_id = (select auth.uid())
));

create policy places_read_authenticated on public.places
for select to authenticated using (true);

commit;
