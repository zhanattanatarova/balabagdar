ALTER TABLE public.phone_verifications ADD COLUMN code_hash text, ADD COLUMN purpose text NOT NULL DEFAULT 'register', ADD COLUMN attempts integer NOT NULL DEFAULT 0, ADD COLUMN consumed_at timestamptz;
ALTER TABLE public.phone_verifications ALTER COLUMN code SET DEFAULT '';
COMMENT ON COLUMN public.phone_verifications.code IS 'DEPRECATED: always empty; code_hash stores server-peppered SHA-256 only';
CREATE TABLE public.telegram_phone_links (phone text PRIMARY KEY, telegram_chat_id text NOT NULL, updated_at timestamptz NOT NULL DEFAULT now());
GRANT ALL ON public.telegram_phone_links TO service_role;
ALTER TABLE public.telegram_phone_links ENABLE ROW LEVEL SECURITY;
INSERT INTO public.telegram_phone_links(phone,telegram_chat_id) SELECT DISTINCT ON (phone) phone,telegram_chat_id FROM public.phone_verifications WHERE telegram_chat_id IS NOT NULL ORDER BY phone,created_at DESC;
UPDATE public.phone_verifications SET code='', code_hash=NULL, consumed_at=now(), verified=true;
REVOKE ALL ON public.phone_verifications FROM anon, authenticated;
GRANT ALL ON public.phone_verifications TO service_role;
ALTER TABLE public.phone_verifications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "No client access to phone_verifications" ON public.phone_verifications;
DROP POLICY IF EXISTS "Deny all client access (restrictive)" ON public.phone_verifications;
CREATE INDEX phone_verifications_phone_created_idx ON public.phone_verifications(phone,created_at DESC);
CREATE OR REPLACE FUNCTION public.otp_issue(_phone text,_purpose text,_hash text) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE new_id uuid;
BEGIN
 IF _phone !~ '^7[0-9]{10}$' OR _purpose NOT IN ('register','reset') OR _hash !~ '^[0-9a-f]{64}$' THEN RAISE EXCEPTION 'Invalid input'; END IF;
 PERFORM pg_advisory_xact_lock(hashtextextended('otp:'||_phone,0));
 UPDATE public.phone_verifications SET consumed_at=now(),verified=true WHERE phone=_phone AND consumed_at IS NULL;
 INSERT INTO public.phone_verifications(phone,code,code_hash,purpose,expires_at,telegram_chat_id) VALUES (_phone,'',_hash,_purpose,now()+interval '5 minutes',(SELECT telegram_chat_id FROM public.telegram_phone_links WHERE phone=_phone)) RETURNING id INTO new_id;
 RETURN new_id;
END $$;
REVOKE ALL ON FUNCTION public.otp_issue(text,text,text) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.otp_issue(text,text,text) TO service_role;
CREATE OR REPLACE FUNCTION public.otp_verify(_phone text,_purpose text,_hash text) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE v public.phone_verifications%ROWTYPE; difference integer:=0; i integer;
BEGIN
 IF _phone !~ '^7[0-9]{10}$' OR _purpose NOT IN ('register','reset') OR _hash !~ '^[0-9a-f]{64}$' THEN RETURN jsonb_build_object('success',false,'remaining_attempts',0); END IF;
 PERFORM pg_advisory_xact_lock(hashtextextended('otp:'||_phone,0));
 UPDATE public.phone_verifications SET attempts=attempts+1 WHERE id=(SELECT id FROM public.phone_verifications WHERE phone=_phone AND purpose=_purpose ORDER BY created_at DESC LIMIT 1) AND consumed_at IS NULL AND NOT verified AND expires_at>now() AND attempts<5 AND code_hash IS NOT NULL RETURNING * INTO v;
 IF NOT FOUND THEN RETURN jsonb_build_object('success',false,'remaining_attempts',0); END IF;
 FOR i IN 1..64 LOOP difference:=difference | (ascii(substr(v.code_hash,i,1)) # ascii(substr(_hash,i,1))); END LOOP;
 IF difference=0 THEN
  UPDATE public.phone_verifications SET consumed_at=now(),verified=true WHERE id=v.id;
  IF _purpose='reset' THEN UPDATE public.phone_verifications SET consumed_at=now(),verified=true WHERE phone=_phone AND consumed_at IS NULL; END IF;
  RETURN jsonb_build_object('success',true,'verification_id',v.id,'telegram_chat_id',v.telegram_chat_id,'remaining_attempts',5-v.attempts);
 END IF;
 IF v.attempts>=5 THEN UPDATE public.phone_verifications SET consumed_at=now(),verified=true WHERE id=v.id; END IF;
 RETURN jsonb_build_object('success',false,'remaining_attempts',5-v.attempts);
END $$;
REVOKE ALL ON FUNCTION public.otp_verify(text,text,text) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.otp_verify(text,text,text) TO service_role;
CREATE OR REPLACE FUNCTION public.otp_invalidate(_phone text) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$ BEGIN
 PERFORM pg_advisory_xact_lock(hashtextextended('otp:'||_phone,0));
 UPDATE public.phone_verifications SET consumed_at=now(),verified=true WHERE phone=_phone AND consumed_at IS NULL;
END $$;
REVOKE ALL ON FUNCTION public.otp_invalidate(text) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.otp_invalidate(text) TO service_role;