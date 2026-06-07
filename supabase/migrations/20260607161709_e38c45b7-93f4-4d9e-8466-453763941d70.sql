
-- 1. Bookings: prevent club owners from changing user_id/club_id on update
CREATE OR REPLACE FUNCTION public.protect_booking_immutable_fields()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.user_id IS DISTINCT FROM OLD.user_id
     OR NEW.club_id IS DISTINCT FROM OLD.club_id THEN
    -- allow service_role / admins to do anything
    IF NOT EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role = 'admin'::public.app_role
    ) THEN
      RAISE EXCEPTION 'Cannot modify user_id or club_id on bookings';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS protect_booking_immutable_fields ON public.bookings;
CREATE TRIGGER protect_booking_immutable_fields
  BEFORE UPDATE ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION public.protect_booking_immutable_fields();

-- 2. Reviews: prevent users from changing moderation flags (is_hidden, reports_count)
CREATE OR REPLACE FUNCTION public.protect_review_moderation_fields()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.is_hidden IS DISTINCT FROM OLD.is_hidden
     OR NEW.reports_count IS DISTINCT FROM OLD.reports_count THEN
    IF NOT EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role = 'admin'::public.app_role
    ) THEN
      NEW.is_hidden := OLD.is_hidden;
      NEW.reports_count := OLD.reports_count;
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS protect_review_moderation_fields ON public.reviews;
CREATE TRIGGER protect_review_moderation_fields
  BEFORE UPDATE ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION public.protect_review_moderation_fields();

-- 3. user_roles: allow admins to delete role assignments
DROP POLICY IF EXISTS "Admins can delete roles" ON public.user_roles;
CREATE POLICY "Admins can delete roles"
ON public.user_roles
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid() AND ur.role = 'admin'::public.app_role
  )
);

-- 4. Phone auth: secure random passwords stored server-side only
CREATE TABLE IF NOT EXISTS public.phone_auth_secrets (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  password text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT ALL ON public.phone_auth_secrets TO service_role;
ALTER TABLE public.phone_auth_secrets ENABLE ROW LEVEL SECURITY;
-- no policies: only service_role (which bypasses RLS) may access
