-- Drop permissive policy and replace with no public access
DROP POLICY "Service role full access" ON public.phone_verifications;

-- No public policies - only service role (edge functions) can access
-- RLS is enabled but no policies = no client access, service role bypasses RLS