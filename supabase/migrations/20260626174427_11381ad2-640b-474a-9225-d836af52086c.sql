
-- Recreate announcements_public WITHOUT security_invoker so anon can read through it
-- without needing privileges on the base table (which exposes phone).
DROP VIEW IF EXISTS public.announcements_public;

CREATE VIEW public.announcements_public
WITH (security_invoker = off) AS
SELECT
  id, user_id, category, title, body, name, city,
  event_date, image_url, expires_at, created_at
FROM public.announcements
WHERE expires_at > now();

GRANT SELECT ON public.announcements_public TO anon, authenticated;
