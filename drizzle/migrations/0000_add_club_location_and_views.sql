ALTER TABLE public.clubs
  ADD COLUMN IF NOT EXISTS latitude double precision,
  ADD COLUMN IF NOT EXISTS longitude double precision,
  ADD COLUMN IF NOT EXISTS views_count integer NOT NULL DEFAULT 0;

CREATE OR REPLACE FUNCTION public.increment_club_views(_club_id uuid)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE public.clubs
  SET views_count = views_count + 1
  WHERE id = _club_id
    AND is_active = true;
$$;

REVOKE ALL ON FUNCTION public.increment_club_views(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.increment_club_views(uuid) TO anon, authenticated, service_role;