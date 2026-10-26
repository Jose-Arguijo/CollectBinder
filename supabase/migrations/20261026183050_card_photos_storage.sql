/*
# Card photos storage bucket

1. New Storage Bucket
- `card-photos`: public bucket for storing card images uploaded by users.

2. Security
- Public read: anyone can view card photos (they're displayed in the app).
- Authenticated + anon write: the app has no sign-in, so both anon and authenticated roles can upload.
- Policies on storage.objects scoped to the card-photos bucket.

3. Notes
- Bucket is public so images can be displayed via public URLs without signed URL overhead.
*/

INSERT INTO storage.buckets (id, name, public)
VALUES ('card-photos', 'card-photos', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "public_read_card_photos" ON storage.objects;
CREATE POLICY "public_read_card_photos"
ON storage.objects FOR SELECT
TO anon, authenticated
USING (bucket_id = 'card-photos');

DROP POLICY IF EXISTS "anon_upload_card_photos" ON storage.objects;
CREATE POLICY "anon_upload_card_photos"
ON storage.objects FOR INSERT
TO anon, authenticated
WITH CHECK (bucket_id = 'card-photos');

DROP POLICY IF EXISTS "anon_update_card_photos" ON storage.objects;
CREATE POLICY "anon_update_card_photos"
ON storage.objects FOR UPDATE
TO anon, authenticated
USING (bucket_id = 'card-photos')
WITH CHECK (bucket_id = 'card-photos');

DROP POLICY IF EXISTS "anon_delete_card_photos" ON storage.objects;
CREATE POLICY "anon_delete_card_photos"
ON storage.objects FOR DELETE
TO anon, authenticated
USING (bucket_id = 'card-photos');
