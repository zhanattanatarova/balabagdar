ALTER TABLE public.announcements
  ADD COLUMN IF NOT EXISTS season text,
  ADD COLUMN IF NOT EXISTS deal_until date,
  ADD COLUMN IF NOT EXISTS discount_text text,
  ADD COLUMN IF NOT EXISTS is_promoted boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_approved boolean NOT NULL DEFAULT true;
ALTER TABLE public.announcements ADD CONSTRAINT announcements_season_check CHECK (season IS NULL OR season IN ('winter','spring','summer'));

CREATE OR REPLACE FUNCTION public.protect_announcement_moderation() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE admin boolean := auth.uid() IS NOT NULL AND EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin');
BEGIN
  IF admin OR auth.uid() IS NULL THEN RETURN NEW; END IF;
  IF TG_OP = 'INSERT' THEN
    NEW.is_promoted := false;
    NEW.is_approved := NEW.category NOT IN ('promo','trial');
  ELSE
    NEW.is_promoted := OLD.is_promoted;
    NEW.is_approved := CASE WHEN NEW.category IN ('promo','trial') THEN false ELSE OLD.is_approved END;
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER announcements_protect_moderation BEFORE INSERT OR UPDATE ON public.announcements FOR EACH ROW EXECUTE FUNCTION public.protect_announcement_moderation();

DROP POLICY IF EXISTS "Anyone can view active announcements" ON public.announcements;
CREATE POLICY "Anyone can view active announcements" ON public.announcements FOR SELECT TO anon, authenticated
  USING (is_approved AND expires_at > now() AND created_at > now() - interval '30 days');
GRANT SELECT (season, deal_until, discount_text, is_promoted, is_approved) ON public.announcements TO anon;

CREATE OR REPLACE VIEW public.announcements_public WITH (security_invoker=true) AS SELECT id,user_id,category,title,body,name,city,event_date,image_url,expires_at,created_at,source_label,source_url,club_id,event_end_date,age_min,age_max,is_free,price_from,event_kind,public_phone,season,deal_until,discount_text,is_promoted FROM public.announcements WHERE is_approved AND expires_at>now() AND created_at>now()-interval '30 days';
GRANT SELECT ON public.announcements_public TO anon,authenticated;

CREATE TABLE public.collections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  title_ru text NOT NULL,
  title_kz text,
  title_en text,
  description_ru text,
  description_kz text,
  description_en text,
  cover_emoji text,
  rule_json jsonb,
  club_ids uuid[] NOT NULL DEFAULT '{}',
  event_ids uuid[] NOT NULL DEFAULT '{}',
  sort integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.collections TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.collections TO authenticated;
GRANT ALL ON public.collections TO service_role;
ALTER TABLE public.collections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Active collections are public" ON public.collections FOR SELECT TO anon, authenticated USING (is_active OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage collections" ON public.collections FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER collections_updated_at BEFORE UPDATE ON public.collections FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.articles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  excerpt text,
  body text NOT NULL DEFAULT '',
  cover_url text,
  tags text[] NOT NULL DEFAULT '{}',
  published_at timestamptz,
  is_published boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.articles TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.articles TO authenticated;
GRANT ALL ON public.articles TO service_role;
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Published articles are public" ON public.articles FOR SELECT TO anon, authenticated USING ((is_published AND published_at <= now()) OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage articles" ON public.articles FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER articles_updated_at BEFORE UPDATE ON public.articles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();