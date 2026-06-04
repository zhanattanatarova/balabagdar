
-- 1) Restrict announcements SELECT to authenticated users (hides phone numbers from anon scrapers)
DROP POLICY IF EXISTS "Anyone can view active announcements" ON public.announcements;
CREATE POLICY "Authenticated can view active announcements"
ON public.announcements FOR SELECT
TO authenticated
USING (expires_at > now());

REVOKE SELECT ON public.announcements FROM anon;

-- 2) Prevent privilege escalation: users can only self-assign non-admin roles
DROP POLICY IF EXISTS "Users can insert own role" ON public.user_roles;
CREATE POLICY "Users can insert own non-admin role"
ON public.user_roles FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id
  AND role IN ('parent'::app_role, 'club_owner'::app_role)
);

-- 3) Lock down phone_verifications: explicit deny for clients (service_role bypasses RLS)
REVOKE ALL ON public.phone_verifications FROM anon, authenticated;
CREATE POLICY "No client access to phone_verifications"
ON public.phone_verifications FOR ALL
TO anon, authenticated
USING (false) WITH CHECK (false);

-- 4) Storage: require uploads into user's own folder in club-media
DROP POLICY IF EXISTS "Authenticated users can upload club media" ON storage.objects;
CREATE POLICY "Users can upload club media to own folder"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'club-media'
  AND (storage.foldername(name))[1] = (auth.uid())::text
);

-- 5) Revoke EXECUTE on SECURITY DEFINER helpers from clients.
--    Trigger functions don't need client EXECUTE; has_role is called inside RLS using
--    the function owner's rights, so revoking client EXECUTE doesn't break policies.
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.recalc_club_rating() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.handle_review_report() FROM anon, authenticated, public;
