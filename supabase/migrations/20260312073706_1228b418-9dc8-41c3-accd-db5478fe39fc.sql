
-- User roles enum and table
CREATE TYPE public.app_role AS ENUM ('parent', 'club_owner');

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role
  )
$$;

CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own role" ON public.user_roles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Clubs table
CREATE TABLE public.clubs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name_ru TEXT NOT NULL DEFAULT '',
  name_kz TEXT DEFAULT '',
  name_en TEXT DEFAULT '',
  description_ru TEXT DEFAULT '',
  description_kz TEXT DEFAULT '',
  description_en TEXT DEFAULT '',
  category TEXT NOT NULL DEFAULT 'other',
  city TEXT NOT NULL DEFAULT '',
  address TEXT DEFAULT '',
  phone TEXT DEFAULT '',
  whatsapp TEXT DEFAULT '',
  telegram TEXT DEFAULT '',
  age_min INT DEFAULT 3,
  age_max INT DEFAULT 18,
  price_from INT DEFAULT 0,
  price_currency TEXT DEFAULT '₸',
  avatar_url TEXT DEFAULT '',
  gallery TEXT[] DEFAULT '{}',
  rating NUMERIC(2,1) DEFAULT 0,
  reviews_count INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.clubs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active clubs" ON public.clubs FOR SELECT USING (is_active = true);
CREATE POLICY "Club owners can insert own club" ON public.clubs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Club owners can update own club" ON public.clubs FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Club owners can delete own club" ON public.clubs FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER update_clubs_updated_at BEFORE UPDATE ON public.clubs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Club schedules
CREATE TABLE public.club_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  club_id UUID REFERENCES public.clubs(id) ON DELETE CASCADE NOT NULL,
  day_of_week INT NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  max_slots INT DEFAULT 10,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.club_schedules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view schedules" ON public.club_schedules FOR SELECT USING (true);
CREATE POLICY "Club owners manage schedules" ON public.club_schedules FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.clubs WHERE id = club_id AND user_id = auth.uid())
);
CREATE POLICY "Club owners update schedules" ON public.club_schedules FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.clubs WHERE id = club_id AND user_id = auth.uid())
);
CREATE POLICY "Club owners delete schedules" ON public.club_schedules FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.clubs WHERE id = club_id AND user_id = auth.uid())
);

-- Bookings
CREATE TABLE public.bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  club_id UUID REFERENCES public.clubs(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  schedule_id UUID REFERENCES public.club_schedules(id) ON DELETE SET NULL,
  booking_date DATE NOT NULL,
  child_name TEXT DEFAULT '',
  child_age INT,
  phone TEXT DEFAULT '',
  status TEXT NOT NULL DEFAULT 'pending',
  message TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own bookings" ON public.bookings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Club owners can view club bookings" ON public.bookings FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.clubs WHERE id = club_id AND user_id = auth.uid())
);
CREATE POLICY "Users can create bookings" ON public.bookings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Club owners can update booking status" ON public.bookings FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.clubs WHERE id = club_id AND user_id = auth.uid())
);

CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
