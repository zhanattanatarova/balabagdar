ALTER TABLE public.announcements ADD COLUMN IF NOT EXISTS event_end_date date;
GRANT SELECT (event_end_date) ON public.announcements TO anon;
CREATE OR REPLACE VIEW public.announcements_public WITH (security_invoker=true) AS SELECT id,user_id,category,title,body,name,city,event_date,image_url,expires_at,created_at,source_label,source_url,club_id,event_end_date FROM public.announcements WHERE expires_at>now() AND created_at>now()-interval '30 days';
GRANT SELECT ON public.announcements_public TO anon,authenticated;