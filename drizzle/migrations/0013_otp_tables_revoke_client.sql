REVOKE ALL ON public.telegram_phone_links, public.otp_rate_events FROM anon, authenticated;
REVOKE ALL ON SEQUENCE public.otp_rate_events_id_seq FROM anon, authenticated;