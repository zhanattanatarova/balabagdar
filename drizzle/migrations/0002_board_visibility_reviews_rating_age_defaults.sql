-- 1. Announcements: explicit read grants + single public SELECT policy (active, <= 30 days old)
GRANT SELECT ON public.announcements TO authenticated;
GRANT SELECT (id, user_id, category, title, body, name, city, expires_at, created_at, updated_at, event_date, image_url) ON public.announcements TO anon;
GRANT ALL ON public.announcements TO service_role;

DROP POLICY IF EXISTS "Anon can view active announcements" ON public.announcements;
DROP POLICY IF EXISTS "Authenticated can view active announcements" ON public.announcements;
CREATE POLICY "Anyone can view active announcements" ON public.announcements
  FOR SELECT TO anon, authenticated
  USING (expires_at > now() AND created_at > now() - interval '30 days');
CREATE POLICY "Authors and admins can view own announcements" ON public.announcements
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "Admins can update announcements" ON public.announcements
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

-- 2. Reviews -> clubs.rating / reviews_count (runs as owner so reviewers can update the club aggregate)
CREATE OR REPLACE FUNCTION public.recalc_club_rating()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  ids uuid[];
BEGIN
  IF TG_OP = 'DELETE' THEN
    ids := ARRAY[OLD.club_id];
  ELSIF TG_OP = 'UPDATE' AND OLD.club_id IS DISTINCT FROM NEW.club_id THEN
    ids := ARRAY[OLD.club_id, NEW.club_id];
  ELSE
    ids := ARRAY[NEW.club_id];
  END IF;

  UPDATE public.clubs c
  SET
    rating = COALESCE((SELECT ROUND(AVG(r.rating)::numeric, 1) FROM public.reviews r WHERE r.club_id = c.id AND r.is_hidden = false), 0),
    reviews_count = (SELECT COUNT(*) FROM public.reviews r WHERE r.club_id = c.id AND r.is_hidden = false)
  WHERE c.id = ANY(ids);

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  END IF;
  RETURN NEW;
END;
$function$;

REVOKE EXECUTE ON FUNCTION public.recalc_club_rating() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS reviews_recalc_rating ON public.reviews;
DROP TRIGGER IF EXISTS recalc_club_rating_trigger ON public.reviews;
CREATE TRIGGER recalc_club_rating_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION public.recalc_club_rating();

-- 5. No fake age defaults for new clubs
ALTER TABLE public.clubs ALTER COLUMN age_min DROP DEFAULT;
ALTER TABLE public.clubs ALTER COLUMN age_max DROP DEFAULT;