
-- 1. Perfis de Usuário
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  avatar_url TEXT,
  country TEXT,
  preferences JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Viagens (cada viagem pertence ao usuário)
CREATE TABLE public.trips (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  destination TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  budget NUMERIC,
  currency TEXT DEFAULT 'BRL',
  itinerary JSONB,
  notes TEXT,
  checklist JSONB,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Despesas (cada despesa pertence a uma viagem)
CREATE TABLE public.expenses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id uuid REFERENCES public.trips(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  date DATE DEFAULT now(),
  category TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Locais (para descoberta local e feedback)
CREATE TABLE public.places (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category TEXT NOT NULL, -- mercado, café, coworking etc
  address TEXT,
  city TEXT,
  country TEXT,
  description TEXT,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Comunidade (posts, grupos, eventos)
CREATE TABLE public.community_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  type TEXT NOT NULL, -- grupo, evento, notícia
  title TEXT NOT NULL,
  content TEXT,
  media_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 6. Habilitar Row Level Security nas tabelas sensíveis
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;

-- 7. Políticas básicas RLS: Cada usuário acessa só seus dados
CREATE POLICY "Self profile only"
  ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Manage own trips"
  ON public.trips
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Manage own expenses"
  ON public.expenses
  FOR ALL USING (
    trip_id IN (SELECT id FROM public.trips WHERE user_id = auth.uid())
  ) WITH CHECK (
    trip_id IN (SELECT id FROM public.trips WHERE user_id = auth.uid())
  );

CREATE POLICY "Manage own posts"
  ON public.community_posts
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

