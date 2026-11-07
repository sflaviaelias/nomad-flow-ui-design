-- Conta e perfil são criados na mesma transação; não depende do navegador.
begin;

drop trigger if exists check_duplicate_email on public.profiles;
drop function if exists public.prevent_duplicate_email();

-- O e-mail do perfil acompanha Auth, sem permitir reserva de e-mail alheio.
create function public.sync_profile_email()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  select u.email into new.email from auth.users u where u.id = new.id;
  if new.email is null then
    raise exception 'O perfil requer uma conta de autenticação com e-mail.'
      using errcode = '23514';
  end if;
  return new;
end;
$$;

create trigger sync_profile_email_before_write
before insert or update on public.profiles
for each row execute function public.sync_profile_email();

create function public.handle_auth_user_profile()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  profile_birth_date date;
begin
  -- O aplicativo atual usa cadastro por e-mail. Contas sem e-mail não recebem
  -- um endereço fictício; suporte a outros métodos requer decisão própria.
  if new.email is null then
    return new;
  end if;

  if tg_op = 'UPDATE' then
    update public.profiles set email = new.email where id = new.id;
    return new;
  end if;

  -- Metadados são controlados pelo usuário; nascimento inválido não bloqueia Auth.
  begin
    profile_birth_date := nullif(new.raw_user_meta_data ->> 'birthdate', '')::date;
    if not pg_catalog.isfinite(profile_birth_date)
       or profile_birth_date > current_date then
      profile_birth_date := null;
    end if;
  exception when invalid_datetime_format or datetime_field_overflow then
    profile_birth_date := null;
  end;

  insert into public.profiles (id, name, email, birth_date, preferences)
  values (
    new.id,
    coalesce(nullif(btrim(new.raw_user_meta_data ->> 'name'), ''),
             split_part(new.email, '@', 1)),
    new.email,
    profile_birth_date,
    pg_catalog.jsonb_build_object(
      'nationality', new.raw_user_meta_data ->> 'country',
      'travel_profiles', case
        when pg_catalog.jsonb_typeof(new.raw_user_meta_data -> 'travel_profiles') = 'array'
          then new.raw_user_meta_data -> 'travel_profiles'
        else '[]'::jsonb
      end
    )
  ) on conflict (id) do nothing;
  return new;
end;
$$;

create trigger create_profile_after_signup
after insert on auth.users
for each row execute function public.handle_auth_user_profile();

create trigger sync_profile_after_auth_email_change
after update of email on auth.users
for each row execute function public.handle_auth_user_profile();

-- Recupera somente perfis ausentes; nunca substitui preferências já editadas.
-- Em um banco existente, conflitos de e-mail abortam a migration para revisão.
insert into public.profiles (id, name, email, preferences)
select u.id,
       coalesce(nullif(btrim(u.raw_user_meta_data ->> 'name'), ''), split_part(u.email, '@', 1)),
       u.email,
       pg_catalog.jsonb_build_object(
         'nationality', u.raw_user_meta_data ->> 'country',
         'travel_profiles', case
           when pg_catalog.jsonb_typeof(u.raw_user_meta_data -> 'travel_profiles') = 'array'
             then u.raw_user_meta_data -> 'travel_profiles'
           else '[]'::jsonb
         end)
from auth.users u
where u.email is not null
on conflict (id) do nothing;

revoke all on function public.sync_profile_email() from public, anon, authenticated;
revoke all on function public.handle_auth_user_profile() from public, anon, authenticated;

commit;
