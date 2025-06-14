
-- Impede criar dois perfis com o mesmo email. Como já há UNIQUE, reforçamos no trigger para UX melhor:
CREATE OR REPLACE FUNCTION public.prevent_duplicate_email()
RETURNS trigger AS $$
BEGIN
  IF (SELECT COUNT(*) FROM public.profiles WHERE email = NEW.email) > 0 THEN
    RAISE EXCEPTION 'Já existe um perfil cadastrado com este e-mail.';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Garante que o trigger só atua em INSERT, validando duplicidade:
DROP TRIGGER IF EXISTS check_duplicate_email ON public.profiles;
CREATE TRIGGER check_duplicate_email
BEFORE INSERT ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.prevent_duplicate_email();
