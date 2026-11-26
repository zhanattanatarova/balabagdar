CREATE OR REPLACE FUNCTION public.protect_review_moderation_fields() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $function$
BEGIN
  IF NEW.is_hidden IS DISTINCT FROM OLD.is_hidden
     OR NEW.reports_count IS DISTINCT FROM OLD.reports_count THEN
    -- The report-counting trigger may only add one report and never change visibility.
    IF pg_trigger_depth() > 1 AND NEW.is_hidden IS NOT DISTINCT FROM OLD.is_hidden AND NEW.reports_count = OLD.reports_count + 1 THEN
      RETURN NEW;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'::public.app_role) THEN
      RAISE EXCEPTION 'Not allowed to modify moderation fields (is_hidden, reports_count)';
    END IF;
  END IF;
  RETURN NEW;
END;
$function$;