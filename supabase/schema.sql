-- ==========================================
-- Wordle Farsi (واژل) - Supabase Database Schema
-- Run this script in the Supabase SQL Editor
-- ==========================================

-- 1. Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  display_name TEXT,
  games_played INT DEFAULT 0,
  games_won INT DEFAULT 0,
  current_streak INT DEFAULT 0,
  max_streak INT DEFAULT 0,
  guess_distribution JSONB DEFAULT '{"1":0,"2":0,"3":0,"4":0,"5":0,"6":0}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create leaderboard table
CREATE TABLE IF NOT EXISTS public.leaderboard (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  player_name TEXT NOT NULL,
  email_masked TEXT NOT NULL,
  guesses_count INT NOT NULL CHECK (guesses_count BETWEEN 1 AND 6),
  won BOOLEAN NOT NULL DEFAULT true,
  word TEXT NOT NULL,
  time_spent_seconds INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Indexes for leaderboard performance
CREATE INDEX IF NOT EXISTS idx_leaderboard_ranking ON public.leaderboard (won, guesses_count ASC, time_spent_seconds ASC);
CREATE INDEX IF NOT EXISTS idx_leaderboard_created_at ON public.leaderboard (created_at DESC);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leaderboard ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies for Profiles
CREATE POLICY "Public profiles are readable by everyone"
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- 6. RLS Policies for Leaderboard
CREATE POLICY "Leaderboard entries are readable by everyone"
  ON public.leaderboard FOR SELECT
  USING (true);

CREATE POLICY "Anyone or authenticated user can insert game record"
  ON public.leaderboard FOR INSERT
  WITH CHECK (true);

-- 7. Trigger to automatically create profile on Auth signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1))
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
