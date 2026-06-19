
-- Make view security_invoker so it doesn't bypass RLS
DROP VIEW IF EXISTS public.announcements_public;
CREATE VIEW public.announcements_public
WITH (security_invoker = on) AS
SELECT id, user_id, category, title, body, name, city, event_date, image_url, expires_at, created_at, updated_at
FROM public.announcements
WHERE expires_at > now();

GRANT SELECT ON public.announcements_public TO anon, authenticated;
GRANT ALL ON public.announcements_public TO service_role;

-- Restore guest SELECT policy on the base table
DROP POLICY IF EXISTS "Guests can view active public announcements" ON public.announcements;
CREATE POLICY "Guests can view active public announcements"
ON public.announcements
FOR SELECT
TO anon
USING (expires_at > now());

-- Column-level: anon may NOT read phone
REVOKE SELECT ON public.announcements FROM anon;
GRANT SELECT (id, user_id, category, title, body, name, city, event_date, image_url, expires_at, created_at, updated_at)
  ON public.announcements TO anon;
