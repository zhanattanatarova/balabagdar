
-- 1. Remove plaintext password storage entirely
DROP TABLE IF EXISTS public.phone_auth_secrets CASCADE;

-- 2. Defense-in-depth: revoke column-level UPDATE on moderation fields from regular users
REVOKE UPDATE (is_hidden, reports_count) ON public.reviews FROM anon, authenticated, PUBLIC;
GRANT  UPDATE (is_hidden, reports_count) ON public.reviews TO service_role;
