
-- Strengthen RLS: enforce club_owner role on club/schedule/booking-owner actions and lock down review updates

DROP POLICY IF EXISTS "Club owners can update own club" ON public.clubs;
CREATE POLICY "Club owners can update own club" ON public.clubs
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id AND (public.has_role(auth.uid(), 'club_owner'::public.app_role) OR public.has_role(auth.uid(), 'admin'::public.app_role)))
  WITH CHECK (auth.uid() = user_id AND (public.has_role(auth.uid(), 'club_owner'::public.app_role) OR public.has_role(auth.uid(), 'admin'::public.app_role)));

DROP POLICY IF EXISTS "Club owners can delete own club" ON public.clubs;
CREATE POLICY "Club owners can delete own club" ON public.clubs
  FOR DELETE TO authenticated
  USING (auth.uid() = user_id AND (public.has_role(auth.uid(), 'club_owner'::public.app_role) OR public.has_role(auth.uid(), 'admin'::public.app_role)));

DROP POLICY IF EXISTS "Club owners manage schedules" ON public.club_schedules;
CREATE POLICY "Club owners manage schedules" ON public.club_schedules
  FOR INSERT TO authenticated
  WITH CHECK (
    (public.has_role(auth.uid(), 'club_owner'::public.app_role) OR public.has_role(auth.uid(), 'admin'::public.app_role))
    AND EXISTS (SELECT 1 FROM public.clubs WHERE clubs.id = club_schedules.club_id AND clubs.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "Club owners update schedules" ON public.club_schedules;
CREATE POLICY "Club owners update schedules" ON public.club_schedules
  FOR UPDATE TO authenticated
  USING (
    (public.has_role(auth.uid(), 'club_owner'::public.app_role) OR public.has_role(auth.uid(), 'admin'::public.app_role))
    AND EXISTS (SELECT 1 FROM public.clubs WHERE clubs.id = club_schedules.club_id AND clubs.user_id = auth.uid())
  )
  WITH CHECK (
    (public.has_role(auth.uid(), 'club_owner'::public.app_role) OR public.has_role(auth.uid(), 'admin'::public.app_role))
    AND EXISTS (SELECT 1 FROM public.clubs WHERE clubs.id = club_schedules.club_id AND clubs.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "Club owners delete schedules" ON public.club_schedules;
CREATE POLICY "Club owners delete schedules" ON public.club_schedules
  FOR DELETE TO authenticated
  USING (
    (public.has_role(auth.uid(), 'club_owner'::public.app_role) OR public.has_role(auth.uid(), 'admin'::public.app_role))
    AND EXISTS (SELECT 1 FROM public.clubs WHERE clubs.id = club_schedules.club_id AND clubs.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "Club owners can update booking status" ON public.bookings;
CREATE POLICY "Club owners can update booking status" ON public.bookings
  FOR UPDATE TO authenticated
  USING (
    (public.has_role(auth.uid(), 'club_owner'::public.app_role) OR public.has_role(auth.uid(), 'admin'::public.app_role))
    AND EXISTS (SELECT 1 FROM public.clubs WHERE clubs.id = bookings.club_id AND clubs.user_id = auth.uid())
  )
  WITH CHECK (
    (public.has_role(auth.uid(), 'club_owner'::public.app_role) OR public.has_role(auth.uid(), 'admin'::public.app_role))
    AND EXISTS (SELECT 1 FROM public.clubs WHERE clubs.id = bookings.club_id AND clubs.user_id = auth.uid())
  );

-- Add WITH CHECK to review updates; trigger protect_review_moderation_fields already guards is_hidden/reports_count
DROP POLICY IF EXISTS "Users can update own reviews" ON public.reviews;
CREATE POLICY "Users can update own reviews" ON public.reviews
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Lock down SECURITY DEFINER trigger functions: revoke EXECUTE from PUBLIC (triggers run as table owner regardless)
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.protect_booking_immutable_fields() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.recalc_club_rating() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.protect_review_moderation_fields() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_review_report() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.protect_booking_owner_fields() FROM PUBLIC, anon, authenticated;

-- has_role is referenced by RLS policies for authenticated users; revoke only from anon/public
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;
