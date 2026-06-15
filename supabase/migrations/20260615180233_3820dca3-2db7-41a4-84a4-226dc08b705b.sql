CREATE POLICY "Users can insert own club_owner role"
ON public.user_roles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id AND role = 'club_owner'::public.app_role);