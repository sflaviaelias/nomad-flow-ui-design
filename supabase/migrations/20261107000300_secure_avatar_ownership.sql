begin;

drop policy if exists "Public read access to avatars" on storage.objects;
drop policy if exists "Authenticated users can upload avatars" on storage.objects;
drop policy if exists "Authenticated users can delete their own avatar" on storage.objects;
drop policy if exists "Users can update their own avatars" on storage.objects;
drop policy if exists "Users can delete their own avatars" on storage.objects;

-- Mantém o formato já usado no frontend: <auth.uid()>.jpg, .jpeg ou .png.
-- O caminho completo deve corresponder; subpastas e nomes de terceiros são negados.
create policy avatars_public_read on storage.objects
for select to anon, authenticated using (bucket_id = 'avatars');

create policy avatars_insert_own on storage.objects
for insert to authenticated with check (
  bucket_id = 'avatars' and lower(name) in (
    (select auth.uid())::text || '.jpg',
    (select auth.uid())::text || '.jpeg',
    (select auth.uid())::text || '.png'
  )
);

create policy avatars_update_own on storage.objects
for update to authenticated using (
  bucket_id = 'avatars' and lower(name) in (
    (select auth.uid())::text || '.jpg',
    (select auth.uid())::text || '.jpeg',
    (select auth.uid())::text || '.png'
  )
) with check (
  bucket_id = 'avatars' and lower(name) in (
    (select auth.uid())::text || '.jpg',
    (select auth.uid())::text || '.jpeg',
    (select auth.uid())::text || '.png'
  )
);

create policy avatars_delete_own on storage.objects
for delete to authenticated using (
  bucket_id = 'avatars' and lower(name) in (
    (select auth.uid())::text || '.jpg',
    (select auth.uid())::text || '.jpeg',
    (select auth.uid())::text || '.png'
  )
);

commit;
