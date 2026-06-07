
-- 1. Convert phone_auth_secrets deny policy to RESTRICTIVE
DROP POLICY IF EXISTS "Deny all client access to phone_auth_secrets" ON public.phone_auth_secrets;
DROP POLICY IF EXISTS "Deny all access" ON public.phone_auth_secrets;
DROP POLICY IF EXISTS "deny_all" ON public.phone_auth_secrets;

CREATE POLICY "Deny all client access (restrictive)"
ON public.phone_auth_secrets
AS RESTRICTIVE
FOR ALL
TO public
USING (false)
WITH CHECK (false);

-- 2. Convert phone_verifications deny policy to RESTRICTIVE
DROP POLICY IF EXISTS "Deny all client access to phone_verifications" ON public.phone_verifications;
DROP POLICY IF EXISTS "Deny all access" ON public.phone_verifications;
DROP POLICY IF EXISTS "deny_all" ON public.phone_verifications;

CREATE POLICY "Deny all client access (restrictive)"
ON public.phone_verifications
AS RESTRICTIVE
FOR ALL
TO public
USING (false)
WITH CHECK (false);

-- 3. Attach the existing protect_review_moderation_fields trigger to the reviews table
DROP TRIGGER IF EXISTS protect_review_moderation_fields_trigger ON public.reviews;
CREATE TRIGGER protect_review_moderation_fields_trigger
BEFORE UPDATE ON public.reviews
FOR EACH ROW
EXECUTE FUNCTION public.protect_review_moderation_fields();

-- Also attach other defined-but-not-attached triggers while we're here
DROP TRIGGER IF EXISTS protect_booking_immutable_fields_trigger ON public.bookings;
CREATE TRIGGER protect_booking_immutable_fields_trigger
BEFORE UPDATE ON public.bookings
FOR EACH ROW
EXECUTE FUNCTION public.protect_booking_immutable_fields();

DROP TRIGGER IF EXISTS recalc_club_rating_trigger ON public.reviews;
CREATE TRIGGER recalc_club_rating_trigger
AFTER INSERT OR UPDATE OR DELETE ON public.reviews
FOR EACH ROW
EXECUTE FUNCTION public.recalc_club_rating();

DROP TRIGGER IF EXISTS handle_review_report_trigger ON public.review_reports;
CREATE TRIGGER handle_review_report_trigger
AFTER INSERT ON public.review_reports
FOR EACH ROW
EXECUTE FUNCTION public.handle_review_report();
