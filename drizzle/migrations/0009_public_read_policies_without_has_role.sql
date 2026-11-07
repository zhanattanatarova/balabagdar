DROP POLICY IF EXISTS "Active collections are public" ON public.collections;
CREATE POLICY "Active collections are public" ON public.collections FOR SELECT TO anon, authenticated USING (is_active);
DROP POLICY IF EXISTS "Published articles are public" ON public.articles;
CREATE POLICY "Published articles are public" ON public.articles FOR SELECT TO anon, authenticated USING (is_published AND published_at <= now());