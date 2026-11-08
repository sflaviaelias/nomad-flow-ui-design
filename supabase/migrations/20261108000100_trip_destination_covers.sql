begin;
-- Cache opcional, independente do INSERT de viagens. Nenhum trigger altera trips.
create table public.trip_covers (
  trip_id uuid primary key references public.trips(id) on delete cascade,
  destination text not null,
  status text not null check (status in ('pending', 'ready', 'unavailable')),
  photo jsonb,
  request_key uuid not null,
  retry_after timestamptz not null,
  constraint trip_cover_photo_state check (
    (status = 'ready' and photo is not null and jsonb_typeof(photo) = 'object')
    or (status <> 'ready' and photo is null)
  )
);
alter table public.trip_covers enable row level security;
-- Remover inclusive permissões concedidas automaticamente por default privileges.
revoke all on public.trip_covers from public, anon, authenticated;
grant select on public.trip_covers to authenticated;
grant select, insert, update, delete on public.trip_covers to service_role;
create policy trip_covers_owner_read on public.trip_covers
  for select to authenticated using (
    exists (select 1 from public.trips t where t.id = trip_id and t.user_id = (select auth.uid()))
  );
comment on table public.trip_covers is 'Capa selecionada pelo backend; API cliente somente lê a capa da própria viagem.';
commit;
