ALTER TABLE public.announcements
  ADD COLUMN IF NOT EXISTS age_min integer,
  ADD COLUMN IF NOT EXISTS age_max integer,
  ADD COLUMN IF NOT EXISTS is_free boolean,
  ADD COLUMN IF NOT EXISTS price_from integer,
  ADD COLUMN IF NOT EXISTS event_kind text,
  ADD COLUMN IF NOT EXISTS public_phone text;
ALTER TABLE public.announcements ADD CONSTRAINT announcements_event_kind_check CHECK (event_kind IS NULL OR event_kind IN ('masterclass','holiday','show','competition','exhibition','other'));
CREATE OR REPLACE FUNCTION public.set_announcement_public_phone() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  NEW.public_phone := CASE WHEN NEW.source_url IS NOT NULL AND NEW.source_url <> '' AND NEW.user_id IS NOT NULL
    AND EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = NEW.user_id AND role = 'admin')
    THEN NULLIF(NEW.phone, '') END;
  RETURN NEW;
END $$;
CREATE TRIGGER announcements_public_phone BEFORE INSERT OR UPDATE ON public.announcements FOR EACH ROW EXECUTE FUNCTION public.set_announcement_public_phone();
UPDATE public.announcements a SET public_phone = CASE WHEN a.source_url IS NOT NULL AND a.source_url <> '' AND EXISTS (SELECT 1 FROM public.user_roles r WHERE r.user_id = a.user_id AND r.role = 'admin') THEN NULLIF(a.phone,'') END;
GRANT SELECT (age_min, age_max, is_free, price_from, event_kind, public_phone) ON public.announcements TO anon;
CREATE OR REPLACE VIEW public.announcements_public WITH (security_invoker=true) AS SELECT id,user_id,category,title,body,name,city,event_date,image_url,expires_at,created_at,source_label,source_url,club_id,event_end_date,age_min,age_max,is_free,price_from,event_kind,public_phone FROM public.announcements WHERE expires_at>now() AND created_at>now()-interval '30 days';
GRANT SELECT ON public.announcements_public TO anon,authenticated;