CREATE OR REPLACE FUNCTION public.protect_club_twogis_fields()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Server-side jobs (no signed-in user) and admins may change 2GIS data; everyone else keeps old values.
  IF auth.uid() IS NULL OR public.has_role(auth.uid(), 'admin'::app_role) THEN
    RETURN NEW;
  END IF;
  IF TG_OP = 'INSERT' THEN
    NEW.twogis_rating := NULL;
    NEW.twogis_reviews_count := NULL;
    NEW.twogis_checked_at := NULL;
  ELSE
    NEW.twogis_rating := OLD.twogis_rating;
    NEW.twogis_reviews_count := OLD.twogis_reviews_count;
    NEW.twogis_checked_at := OLD.twogis_checked_at;
  END IF;
  RETURN NEW;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.protect_club_twogis_fields() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS protect_club_twogis_fields ON public.clubs;
CREATE TRIGGER protect_club_twogis_fields
BEFORE INSERT OR UPDATE ON public.clubs
FOR EACH ROW EXECUTE FUNCTION public.protect_club_twogis_fields();