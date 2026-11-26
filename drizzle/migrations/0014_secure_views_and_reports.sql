CREATE TABLE public.club_view_marks (club_id uuid NOT NULL, visitor_hash text NOT NULL, day date NOT NULL DEFAULT (now() AT TIME ZONE 'Asia/Aqtau')::date, PRIMARY KEY (club_id, visitor_hash, day));
GRANT ALL ON public.club_view_marks TO service_role;
ALTER TABLE public.club_view_marks ENABLE ROW LEVEL SECURITY;
CREATE OR REPLACE FUNCTION public.record_club_view(_club_id uuid,_visitor_hash text) RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
BEGIN
 IF _visitor_hash !~ '^[0-9a-f]{64}$' THEN RETURN false; END IF;
 IF NOT EXISTS (SELECT 1 FROM clubs WHERE id=_club_id AND is_active=true) THEN RETURN false; END IF;
 INSERT INTO club_view_marks(club_id,visitor_hash) VALUES (_club_id,_visitor_hash) ON CONFLICT DO NOTHING;
 IF NOT FOUND THEN RETURN false; END IF;
 UPDATE clubs SET views_count=views_count+1 WHERE id=_club_id;
 INSERT INTO club_events(club_id,event_type) VALUES (_club_id,'view');
 RETURN true;
END $$;
REVOKE ALL ON FUNCTION public.record_club_view(uuid,text) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.record_club_view(uuid,text) TO service_role;
REVOKE EXECUTE ON FUNCTION public.increment_club_views(uuid) FROM PUBLIC,anon,authenticated;
CREATE OR REPLACE FUNCTION public.handle_review_report() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
BEGIN
  UPDATE public.reviews SET reports_count = reports_count + 1 WHERE id = NEW.review_id;
  RETURN NEW;
END $$;