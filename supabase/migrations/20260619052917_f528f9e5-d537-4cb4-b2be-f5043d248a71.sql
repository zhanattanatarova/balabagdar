GRANT SELECT ON public.announcements_public TO anon, authenticated;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.announcements TO authenticated;
GRANT ALL ON public.announcements TO service_role;