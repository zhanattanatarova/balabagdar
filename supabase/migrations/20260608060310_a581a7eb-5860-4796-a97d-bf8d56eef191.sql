REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM anon, authenticated;

DROP POLICY IF EXISTS "Club owners and admins can upload club media" ON storage.objects;
DROP POLICY IF EXISTS "Club owners and admins can update own club media" ON storage.objects;
DROP POLICY IF EXISTS "Club owners and admins can delete own club media" ON storage.objects;

CREATE POLICY "Club owners and admins can upload club media"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'club-media'
  AND (storage.foldername(name))[1] = (auth.uid())::text
  AND (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin'::public.app_role, 'club_owner'::public.app_role))
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
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin'::public.app_role, 'club_owner'::public.app_role))
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
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin'::public.app_role, 'club_owner'::public.app_role))
    OR EXISTS (SELECT 1 FROM public.clubs WHERE user_id = auth.uid())
  )
);