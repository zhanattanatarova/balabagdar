-- Create reviews table
CREATE TABLE public.reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  club_id UUID NOT NULL REFERENCES public.clubs(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT NOT NULL DEFAULT '',
  author_name TEXT DEFAULT '',
  is_hidden BOOLEAN NOT NULL DEFAULT false,
  reports_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (club_id, user_id)
);

CREATE INDEX idx_reviews_club_id ON public.reviews(club_id);

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view non-hidden reviews"
  ON public.reviews FOR SELECT
  USING (is_hidden = false);

CREATE POLICY "Authenticated users can create reviews"
  ON public.reviews FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reviews"
  ON public.reviews FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own reviews"
  ON public.reviews FOR DELETE
  USING (auth.uid() = user_id);

CREATE TRIGGER update_reviews_updated_at
  BEFORE UPDATE ON public.reviews
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Review reports table
CREATE TABLE public.review_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  review_id UUID NOT NULL REFERENCES public.reviews(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  reason TEXT DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (review_id, user_id)
);

ALTER TABLE public.review_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own reports"
  ON public.review_reports FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can create reports"
  ON public.review_reports FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Function to recalculate rating on club
CREATE OR REPLACE FUNCTION public.recalc_club_rating()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  target_club UUID;
BEGIN
  IF (TG_OP = 'DELETE') THEN
    target_club := OLD.club_id;
  ELSE
    target_club := NEW.club_id;
  END IF;

  UPDATE public.clubs
  SET
    rating = COALESCE((SELECT ROUND(AVG(rating)::numeric, 1) FROM public.reviews WHERE club_id = target_club AND is_hidden = false), 0),
    reviews_count = COALESCE((SELECT COUNT(*) FROM public.reviews WHERE club_id = target_club AND is_hidden = false), 0)
  WHERE id = target_club;

  IF (TG_OP = 'DELETE') THEN
    RETURN OLD;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER reviews_recalc_rating
  AFTER INSERT OR UPDATE OR DELETE ON public.reviews
  FOR EACH ROW
  EXECUTE FUNCTION public.recalc_club_rating();

-- Auto-hide review after 3 reports
CREATE OR REPLACE FUNCTION public.handle_review_report()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  UPDATE public.reviews
  SET reports_count = reports_count + 1,
      is_hidden = CASE WHEN reports_count + 1 >= 3 THEN true ELSE is_hidden END
  WHERE id = NEW.review_id;
  RETURN NEW;
END;
$$;

CREATE TRIGGER review_reports_increment
  AFTER INSERT ON public.review_reports
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_review_report();