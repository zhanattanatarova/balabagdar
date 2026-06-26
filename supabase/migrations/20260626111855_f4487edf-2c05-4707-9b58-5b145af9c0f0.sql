CREATE OR REPLACE FUNCTION public.protect_review_moderation_fields()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  IF NEW.is_hidden IS DISTINCT FROM OLD.is_hidden
     OR NEW.reports_count IS DISTINCT FROM OLD.reports_count THEN
    IF NOT EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role = 'admin'::public.app_role
    ) THEN
      RAISE EXCEPTION 'Not allowed to modify moderation fields (is_hidden, reports_count)';
    END IF;
  END IF;
  RETURN NEW;
END;
$function$;

DROP POLICY IF EXISTS "Users can update own reviews" ON public.reviews;
CREATE POLICY "Users can update own reviews"
ON public.reviews
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (
  auth.uid() = user_id
  AND is_hidden = (SELECT r.is_hidden FROM public.reviews r WHERE r.id = reviews.id)
  AND reports_count = (SELECT r.reports_count FROM public.reviews r WHERE r.id = reviews.id)
);