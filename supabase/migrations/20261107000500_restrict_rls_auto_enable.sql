-- A função pertence à configuração da plataforma e pode não existir localmente.
-- Não recriar seu corpo, alterar SECURITY DEFINER/search_path ou seu event trigger.
do $$
declare
  target oid := pg_catalog.to_regprocedure('public.rls_auto_enable()');
begin
  if target is not null then
    if (select prorettype from pg_catalog.pg_proc where oid = target)
       <> 'pg_catalog.event_trigger'::regtype then
      raise exception 'rls_auto_enable possui assinatura inesperada; revisar antes de alterar permissões';
    end if;
    revoke execute on function public.rls_auto_enable() from public, anon, authenticated;
  end if;
end;
$$;
