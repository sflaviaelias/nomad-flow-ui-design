
-- Ativar RLS para community_posts (já está mas reafirmando)
ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;

-- Permite apenas donos consultarem seus próprios posts
DROP POLICY IF EXISTS "Manage own posts" ON public.community_posts;

CREATE POLICY "Read own posts"
  ON public.community_posts
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Insert own posts"
  ON public.community_posts
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Update own posts"
  ON public.community_posts
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Delete own posts"
  ON public.community_posts
  FOR DELETE
  USING (auth.uid() = user_id);
