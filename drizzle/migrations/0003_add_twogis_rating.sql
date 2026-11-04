ALTER TABLE public.clubs
  ADD COLUMN IF NOT EXISTS twogis_rating numeric(2,1) NULL,
  ADD COLUMN IF NOT EXISTS twogis_reviews_count integer NULL,
  ADD COLUMN IF NOT EXISTS twogis_checked_at timestamptz NULL;