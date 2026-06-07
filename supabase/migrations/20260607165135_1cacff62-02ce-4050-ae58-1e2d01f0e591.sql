ALTER TABLE public.clubs ADD COLUMN IF NOT EXISTS categories text[] NOT NULL DEFAULT '{}';
CREATE INDEX IF NOT EXISTS clubs_categories_gin_idx ON public.clubs USING GIN (categories);
UPDATE public.clubs SET categories = ARRAY[category] WHERE (categories IS NULL OR array_length(categories,1) IS NULL) AND category IS NOT NULL;