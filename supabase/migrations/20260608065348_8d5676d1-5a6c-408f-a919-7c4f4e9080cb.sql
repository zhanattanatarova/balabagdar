
-- 1) Restrict club INSERT to club_owner or admin
DROP POLICY IF EXISTS "Club owners can insert own club" ON public.clubs;
CREATE POLICY "Club owners can insert own club"
ON public.clubs
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id
  AND (
    public.has_role(auth.uid(), 'club_owner'::public.app_role)
    OR public.has_role(auth.uid(), 'admin'::public.app_role)
  )
);

-- 2) Allow anon to read non-expired announcements
DROP POLICY IF EXISTS "Anon can view active announcements" ON public.announcements;
CREATE POLICY "Anon can view active announcements"
ON public.announcements
FOR SELECT
TO anon
USING (expires_at > now());
GRANT SELECT ON public.announcements TO anon;

-- 3) Restrict club owner booking updates to status only
CREATE OR REPLACE FUNCTION public.protect_booking_owner_fields()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Admins and the booking author can change anything else allowed by RLS
  IF public.has_role(auth.uid(), 'admin'::public.app_role)
     OR auth.uid() = OLD.user_id THEN
    RETURN NEW;
  END IF;

  -- For everyone else (club owners): only `status` may change
  IF NEW.child_name   IS DISTINCT FROM OLD.child_name
     OR NEW.child_age IS DISTINCT FROM OLD.child_age
     OR NEW.phone     IS DISTINCT FROM OLD.phone
     OR NEW.message   IS DISTINCT FROM OLD.message
     OR NEW.booking_date IS DISTINCT FROM OLD.booking_date
     OR NEW.schedule_id  IS DISTINCT FROM OLD.schedule_id THEN
    RAISE EXCEPTION 'Club owners can only update booking status';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS protect_booking_owner_fields_trg ON public.bookings;
CREATE TRIGGER protect_booking_owner_fields_trg
BEFORE UPDATE ON public.bookings
FOR EACH ROW
EXECUTE FUNCTION public.protect_booking_owner_fields();
