
-- Restrict anon direct read on announcements (hides phone from guests).
-- Guests will only read via the security-definer view announcements_public.
DROP POLICY IF EXISTS "Guests can view active public announcements" ON public.announcements;

-- Recreate view as security definer (default) so anon can read it without table access.
DROP VIEW IF EXISTS public.announcements_public;
CREATE VIEW public.announcements_public AS
SELECT id, user_id, category, title, body, name, city, event_date, image_url, expires_at, created_at, updated_at
FROM public.announcements
WHERE expires_at > now();

GRANT SELECT ON public.announcements_public TO anon, authenticated;
GRANT ALL ON public.announcements_public TO service_role;
