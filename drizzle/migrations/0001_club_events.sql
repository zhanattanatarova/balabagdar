CREATE TABLE public.club_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  club_id uuid NOT NULL REFERENCES public.clubs(id) ON DELETE CASCADE,
  event_type text NOT NULL CHECK (event_type IN ('view','whatsapp_click','call_click','instagram_click')),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX club_events_club_created_idx ON public.club_events(club_id, created_at);
GRANT SELECT ON public.club_events TO authenticated;
GRANT ALL ON public.club_events TO service_role;
ALTER TABLE public.club_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins view club events" ON public.club_events FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "Owners view own club events" ON public.club_events FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.clubs c WHERE c.id = club_events.club_id AND c.user_id = auth.uid()));

CREATE OR REPLACE FUNCTION public.log_club_event(_club_id uuid, _event_type text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF _event_type NOT IN ('view','whatsapp_click','call_click','instagram_click') THEN RETURN; END IF;
  INSERT INTO public.club_events(club_id, event_type)
  SELECT id, _event_type FROM public.clubs WHERE id = _club_id AND is_active = true;
END; $$;
GRANT EXECUTE ON FUNCTION public.log_club_event(uuid, text) TO anon, authenticated, service_role;

CREATE OR REPLACE FUNCTION public.club_event_stats(_from timestamptz, _to timestamptz)
RETURNS TABLE(club_id uuid, views bigint, whatsapp bigint, calls bigint, instagram bigint)
LANGUAGE sql STABLE SECURITY INVOKER SET search_path = public AS $$
  SELECT e.club_id,
    count(*) FILTER (WHERE event_type='view'),
    count(*) FILTER (WHERE event_type='whatsapp_click'),
    count(*) FILTER (WHERE event_type='call_click'),
    count(*) FILTER (WHERE event_type='instagram_click')
  FROM public.club_events e
  WHERE e.created_at >= _from AND e.created_at < _to
  GROUP BY e.club_id
$$;
GRANT EXECUTE ON FUNCTION public.club_event_stats(timestamptz, timestamptz) TO authenticated, service_role;