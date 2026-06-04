INSERT INTO public.user_roles (user_id, role)
VALUES ('e94fa5d9-c7c2-4104-b2cb-e24df6e5563c', 'admin'::app_role)
ON CONFLICT (user_id, role) DO NOTHING;