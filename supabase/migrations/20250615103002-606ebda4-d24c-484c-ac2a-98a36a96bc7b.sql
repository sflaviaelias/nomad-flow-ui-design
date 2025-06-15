
-- Adiciona o campo de data de nascimento ao perfil do usuário
ALTER TABLE public.profiles
ADD COLUMN birth_date DATE NULL;
