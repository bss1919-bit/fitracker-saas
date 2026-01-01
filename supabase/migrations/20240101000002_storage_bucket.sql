-- Create a bucket for coach assets if it doesn't exist
-- Note: inserting into storage.buckets needs specific permissions usually handled by migration or manually.
-- For local development, we can try to insert if not exists.
insert into storage.buckets (id, name, public)
values ('coach-assets', 'coach-assets', true)
on conflict (id) do nothing;

-- Policy: Coaches can upload their own assets
-- We need to enable RLS on storage.objects

create policy "Coaches can upload their own logo"
on storage.objects for insert
with check (
  bucket_id = 'coach-assets' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

create policy "Coaches can update their own logo"
on storage.objects for update
using (
  bucket_id = 'coach-assets' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

create policy "Anyone can view logos"
on storage.objects for select
using ( bucket_id = 'coach-assets' );
