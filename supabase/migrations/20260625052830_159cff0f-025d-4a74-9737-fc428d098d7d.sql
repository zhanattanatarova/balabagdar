
-- 1) Enforce pending status on booking insert for non-admins
CREATE OR REPLACE FUNCTION public.enforce_booking_pending_status()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin'::public.app_role) THEN
    NEW.status := 'pending';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS enforce_booking_pending_on_insert ON public.bookings;
CREATE TRIGGER enforce_booking_pending_on_insert
  BEFORE INSERT ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION public.enforce_booking_pending_status();

-- 2) Block anon from reading the announcements base table (phone exposure risk).
--    Guests must use the public.announcements_public view which strips phone.
DROP POLICY IF EXISTS "Guests can view active public announcements" ON public.announcements;

REVOKE SELECT ON public.announcements FROM anon;

-- Ensure the public view is readable by guests (it already excludes phone)
GRANT SELECT ON public.announcements_public TO anon, authenticated;
