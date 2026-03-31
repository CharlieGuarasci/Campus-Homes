-- Create the listing-images storage bucket for local dev.
-- In production this was created manually via the Supabase dashboard.
insert into storage.buckets (id, name, public)
values ('listing-images', 'listing-images', true)
on conflict (id) do nothing;

create policy "listing_images_public_read" on storage.objects
  for select using (bucket_id = 'listing-images');

create policy "listing_images_auth_upload" on storage.objects
  for insert with check (bucket_id = 'listing-images' and auth.role() = 'authenticated');

create policy "listing_images_owner_delete" on storage.objects
  for delete using (bucket_id = 'listing-images' and auth.uid()::text = (storage.foldername(name))[1]);
