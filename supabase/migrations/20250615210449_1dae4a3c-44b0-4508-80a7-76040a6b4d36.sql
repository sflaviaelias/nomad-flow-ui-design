
-- Permite leitura (download) de todos no bucket "avatars"
create policy "Public read access to avatars"
on storage.objects
for select
using (
  bucket_id = 'avatars'
);

-- Permite que usuários autenticados possam inserir no bucket "avatars"
create policy "Authenticated users can upload avatars"
on storage.objects
for insert
with check (
  bucket_id = 'avatars' AND auth.uid() IS NOT NULL
);

-- Permite que usuários autenticados removam seus próprios arquivos
create policy "Authenticated users can delete their own avatar"
on storage.objects
for delete
using (
  bucket_id = 'avatars' AND auth.uid() IS NOT NULL
);
