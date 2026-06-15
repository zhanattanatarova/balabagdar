
-- 1) Announcements: stop anonymous exposure of phone numbers
DROP POLICY IF EXISTS "Anon can view active announcements" ON public.announcements;

CREATE OR REPLACE VIEW public.announcements_public
WITH (security_invoker = on) AS
SELECT id, user_id, category, title, body, name, city,
       expires_at, created_at, updated_at
FROM public.announcements
WHERE expires_at > now();

GRANT SELECT ON public.announcements_public TO anon, authenticated;

-- 2) Reviews: block authors (and any non-service role) from changing moderation columns
REVOKE UPDATE (is_hidden, reports_count) ON public.reviews FROM anon, authenticated, PUBLIC;
GRANT  UPDATE (is_hidden, reports_count) ON public.reviews TO service_role;

-- 3) Bookings: allow admins to view all bookings
CREATE POLICY "Admins can view all bookings"
ON public.bookings
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::public.app_role));
