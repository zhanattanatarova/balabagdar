
ALTER VIEW public.announcements_public SET (security_invoker = on);

-- Allow anonymous users to read non-expired announcements at the row level
DROP POLICY IF EXISTS "Anon can view active announcements" ON public.announcements;
CREATE POLICY "Anon can view active announcements"
ON public.announcements
FOR SELECT
TO anon
USING (expires_at > now());

-- Column-level grants: expose everything except phone to anon
REVOKE ALL ON public.announcements FROM anon;
GRANT SELECT (id, user_id, category, title, body, name, city, event_date, image_url, expires_at, created_at)
ON public.announcements TO anon;
