-- Keep the base announcements table private by default for guests,
-- then grant only the non-sensitive columns required by the public view.
REVOKE ALL ON public.announcements FROM anon;
REVOKE SELECT (phone) ON public.announcements FROM anon;

GRANT SELECT (
  id,
  user_id,
  category,
  title,
  body,
  name,
  city,
  event_date,
  image_url,
  expires_at,
  created_at
) ON public.announcements TO anon;

GRANT SELECT ON public.announcements_public TO anon;
GRANT SELECT ON public.announcements_public TO authenticated;
GRANT ALL ON public.announcements_public TO service_role;

DROP POLICY IF EXISTS "Anon can view active announcements" ON public.announcements;
CREATE POLICY "Anon can view active announcements"
ON public.announcements
FOR SELECT
TO anon
USING (expires_at > now());