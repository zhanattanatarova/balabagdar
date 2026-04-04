
INSERT INTO storage.buckets (id, name, public) VALUES ('club-media', 'club-media', true);

CREATE POLICY "Anyone can view club media"
ON storage.objects FOR SELECT
USING (bucket_id = 'club-media');

CREATE POLICY "Authenticated users can upload club media"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'club-media');

CREATE POLICY "Users can update own club media"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'club-media' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can delete own club media"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'club-media' AND (storage.foldername(name))[1] = auth.uid()::text);
