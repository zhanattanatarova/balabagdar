-- Add image column
ALTER TABLE public.announcements ADD COLUMN IF NOT EXISTS image_url text;

DROP VIEW IF EXISTS public.announcements_public;
CREATE VIEW public.announcements_public
WITH (security_invoker=on) AS
SELECT id, user_id, category, title, body, name, city, event_date, image_url, expires_at, created_at, updated_at
FROM public.announcements
WHERE expires_at > now();

GRANT SELECT ON public.announcements_public TO anon, authenticated;

-- Storage policies: any authenticated user can manage their own files under announcements/<auth.uid()>/...
CREATE POLICY "Authenticated can upload own announcement media"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'club-media'
    AND (storage.foldername(name))[1] = 'announcements'
    AND (storage.foldername(name))[2] = (auth.uid())::text
  );

CREATE POLICY "Authenticated can update own announcement media"
  ON storage.objects FOR UPDATE TO authenticated
  USING (
    bucket_id = 'club-media'
    AND (storage.foldername(name))[1] = 'announcements'
    AND (storage.foldername(name))[2] = (auth.uid())::text
  );

CREATE POLICY "Authenticated can delete own announcement media"
  ON storage.objects FOR DELETE TO authenticated
  USING (
    bucket_id = 'club-media'
    AND (storage.foldername(name))[1] = 'announcements'
    AND (storage.foldername(name))[2] = (auth.uid())::text
  );