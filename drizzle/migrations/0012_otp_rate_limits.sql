CREATE TABLE public.otp_rate_events (id bigserial PRIMARY KEY, subject text NOT NULL, kind text NOT NULL, created_at timestamptz NOT NULL DEFAULT now());
GRANT ALL ON public.otp_rate_events TO service_role;
GRANT USAGE, SELECT ON SEQUENCE public.otp_rate_events_id_seq TO service_role;
ALTER TABLE public.otp_rate_events ENABLE ROW LEVEL SECURITY;
CREATE INDEX otp_rate_events_lookup ON public.otp_rate_events(subject,kind,created_at DESC);
CREATE OR REPLACE FUNCTION public.otp_send_allowed(_phone text) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE last_at timestamptz; hour_count int; fail_count int; last_fail timestamptz;
BEGIN
 PERFORM pg_advisory_xact_lock(hashtextextended('otp:'||_phone,0));
 SELECT count(*), max(created_at) INTO fail_count,last_fail FROM otp_rate_events WHERE subject='phone:'||_phone AND kind='fail' AND created_at>now()-interval '1 hour';
 IF fail_count>=10 AND last_fail>now()-interval '30 minutes' THEN RETURN jsonb_build_object('allowed',false,'retry_after',ceil(extract(epoch FROM last_fail+interval '30 minutes'-now()))); END IF;
 SELECT max(created_at), count(*) INTO last_at,hour_count FROM otp_rate_events WHERE subject='phone:'||_phone AND kind='send' AND created_at>now()-interval '1 hour';
 IF last_at>now()-interval '60 seconds' THEN RETURN jsonb_build_object('allowed',false,'retry_after',ceil(extract(epoch FROM last_at+interval '60 seconds'-now()))); END IF;
 IF hour_count>=5 THEN RETURN jsonb_build_object('allowed',false,'retry_after',ceil(extract(epoch FROM (SELECT min(created_at) FROM otp_rate_events WHERE subject='phone:'||_phone AND kind='send' AND created_at>now()-interval '1 hour')+interval '1 hour'-now()))); END IF;
 INSERT INTO otp_rate_events(subject,kind) VALUES ('phone:'||_phone,'send');
 RETURN jsonb_build_object('allowed',true,'retry_after',60);
END $$;
CREATE OR REPLACE FUNCTION public.otp_verify_allowed(_phone text,_ip text) RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE fail_count int; last_fail timestamptz;
BEGIN
 PERFORM pg_advisory_xact_lock(hashtextextended('otp-ip:'||_ip,0));
 IF (SELECT count(*) FROM otp_rate_events WHERE subject='ip:'||_ip AND kind='verify' AND created_at>now()-interval '1 hour')>=30 THEN RETURN false; END IF;
 INSERT INTO otp_rate_events(subject,kind) VALUES ('ip:'||_ip,'verify');
 SELECT count(*),max(created_at) INTO fail_count,last_fail FROM otp_rate_events WHERE subject='phone:'||_phone AND kind='fail' AND created_at>now()-interval '1 hour';
 RETURN NOT (fail_count>=10 AND last_fail>now()-interval '30 minutes');
END $$;
CREATE OR REPLACE FUNCTION public.otp_record_failure(_phone text) RETURNS void LANGUAGE sql SECURITY DEFINER SET search_path=public AS $$ INSERT INTO otp_rate_events(subject,kind) VALUES ('phone:'||_phone,'fail') $$;
REVOKE ALL ON FUNCTION public.otp_send_allowed(text),public.otp_verify_allowed(text,text),public.otp_record_failure(text) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.otp_send_allowed(text),public.otp_verify_allowed(text,text),public.otp_record_failure(text) TO service_role;