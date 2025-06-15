
-- Ativar o RLS na tabela places
ALTER TABLE public.places ENABLE ROW LEVEL SECURITY;

-- Política para permitir SELECT a usuários autenticados
CREATE POLICY "Permitir SELECT em places para autenticados"
  ON public.places
  FOR SELECT
  TO authenticated
  USING (true);

-- Política para permitir INSERT a usuários autenticados
CREATE POLICY "Permitir INSERT em places para autenticados"
  ON public.places
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Política para permitir UPDATE a usuários autenticados
CREATE POLICY "Permitir UPDATE em places para autenticados"
  ON public.places
  FOR UPDATE
  TO authenticated
  USING (true);

-- Política para permitir DELETE a usuários autenticados
CREATE POLICY "Permitir DELETE em places para autenticados"
  ON public.places
  FOR DELETE
  TO authenticated
  USING (true);
