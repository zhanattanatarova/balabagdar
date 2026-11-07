ALTER TABLE public.announcements ADD COLUMN IF NOT EXISTS source_label text, ADD COLUMN IF NOT EXISTS source_url text, ADD COLUMN IF NOT EXISTS club_id uuid REFERENCES public.clubs(id) ON DELETE SET NULL;
GRANT SELECT (source_label, source_url, club_id) ON public.announcements TO anon;
GRANT SELECT, INSERT, UPDATE ON public.announcements TO authenticated;
CREATE OR REPLACE VIEW public.announcements_public WITH (security_invoker = true) AS SELECT id,user_id,category,title,body,name,city,event_date,image_url,expires_at,created_at,source_label,source_url,club_id FROM public.announcements WHERE expires_at > now() AND created_at > now() - interval '30 days';
GRANT SELECT ON public.announcements_public TO anon, authenticated;
COMMENT ON COLUMN public.announcements.club_id IS 'Optional matching club for this publication; NULL when no club exists.';