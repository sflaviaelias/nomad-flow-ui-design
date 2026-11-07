begin;

alter table public.trips alter column user_id set not null;
alter table public.expenses alter column trip_id set not null;

alter table public.trips
  add constraint trips_destination_not_blank check (destination ~ '[^[:space:]]'),
  add constraint trips_dates_valid check (
    isfinite(start_date) and isfinite(end_date) and end_date >= start_date
  ),
  add constraint trips_budget_valid check (
    budget is null or (budget >= 0 and budget < 'Infinity'::numeric)
  );
-- NULL significa orçamento ainda não informado; zero é permitido.
-- A comparação também rejeita Infinity e NaN do tipo numeric.

create index trips_user_id_idx on public.trips (user_id);
create index expenses_trip_id_idx on public.expenses (trip_id);

commit;
