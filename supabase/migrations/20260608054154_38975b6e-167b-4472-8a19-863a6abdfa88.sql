DROP POLICY IF EXISTS "Users can upload club media to own folder" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own club media" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own club media" ON storage.objects;

CREATE POLICY "Club owners and admins can upload club media"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'club-media'
  AND (storage.foldername(name))[1] = (auth.uid())::text
  AND (
    public.has_role(auth.uid(), 'admin'::public.app_role)
    OR public.has_role(auth.uid(), 'club_owner'::public.app_role)
    OR EXISTS (SELECT 1 FROM public.clubs WHERE user_id = auth.uid())
  )
);

CREATE POLICY "Club owners and admins can update own club media"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'club-media'
  AND (storage.foldername(name))[1] = (auth.uid())::text
  AND (
    public.has_role(auth.uid(), 'admin'::public.app_role)
    OR public.has_role(auth.uid(), 'club_owner'::public.app_role)
    OR EXISTS (SELECT 1 FROM public.clubs WHERE user_id = auth.uid())
  )
);

CREATE POLICY "Club owners and admins can delete own club media"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'club-media'
  AND (storage.foldername(name))[1] = (auth.uid())::text
  AND (
    public.has_role(auth.uid(), 'admin'::public.app_role)
    OR public.has_role(auth.uid(), 'club_owner'::public.app_role)
    OR EXISTS (SELECT 1 FROM public.clubs WHERE user_id = auth.uid())
  )
);