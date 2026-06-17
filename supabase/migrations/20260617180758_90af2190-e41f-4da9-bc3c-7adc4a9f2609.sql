ALTER TABLE public.announcements ADD COLUMN IF NOT EXISTS event_date timestamptz;

DROP VIEW IF EXISTS public.announcements_public;
CREATE VIEW public.announcements_public
WITH (security_invoker=on) AS
SELECT id, user_id, category, title, body, name, city, event_date, expires_at, created_at, updated_at
FROM public.announcements
WHERE expires_at > now();

GRANT SELECT ON public.announcements_public TO anon, authenticated;