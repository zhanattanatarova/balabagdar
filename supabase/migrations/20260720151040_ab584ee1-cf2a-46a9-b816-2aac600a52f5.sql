
-- Fix 1: announcements phone exposure via base table
-- The base announcements table has no anon GRANT, but the leftover anon SELECT
-- policy is confusing and could become exploitable if grants change later.
-- Guests should always go through public.announcements_public (which excludes phone).
DROP POLICY IF EXISTS "Anon can view active announcements" ON public.announcements;

-- Explicitly revoke to make intent unambiguous for future scanners.
REVOKE ALL ON public.announcements FROM anon;

-- Fix 2: reviews moderation field protection
-- Replace the self-referencing subquery in the WITH CHECK clause with a simple
-- ownership check. Moderation fields (is_hidden, reports_count) are already
-- protected by the BEFORE UPDATE trigger `protect_review_moderation_fields`,
-- which raises an exception when a non-admin tries to modify them.
DROP POLICY IF EXISTS "Users can update own reviews" ON public.reviews;

CREATE POLICY "Users can update own reviews"
ON public.reviews
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
