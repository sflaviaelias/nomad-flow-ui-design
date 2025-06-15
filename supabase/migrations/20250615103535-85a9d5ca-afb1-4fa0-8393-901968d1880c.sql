
-- Permite INSERT/UPDATE/DELETE apenas do próprio perfil

-- Policy para UPDATE (atualizar o próprio perfil)
CREATE POLICY "Update own profile"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id);

-- Policy para INSERT (permitir criar perfil só para o próprio id)
CREATE POLICY "Insert own profile"
  ON public.profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Policy para DELETE (opcional, para deletar o próprio perfil)
CREATE POLICY "Delete own profile"
  ON public.profiles
  FOR DELETE
  USING (auth.uid() = id);
