-- SUPABASE SQL SCHEMA FOR MATH ARENA MVP DEMO
-- ⚠️ IMPORTANT: THIS IS A DEMO SCHEMA ONLY. NOT FOR PRODUCTION.
-- Do not use real student data with this schema.

-- 1. Create sessions table
CREATE TABLE public.sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL CHECK (status IN ('waiting', 'active', 'ended')),
  started_at TIMESTAMPTZ,
  duration_minutes INTEGER NOT NULL DEFAULT 8,
  host_token TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create participants table
CREATE TABLE public.participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES public.sessions(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  student_code TEXT NOT NULL,
  grade INTEGER NOT NULL,
  score INTEGER DEFAULT 0,
  raw_score INTEGER DEFAULT 0,
  hints_used INTEGER DEFAULT 0,
  answers JSONB DEFAULT '[]'::jsonb,
  status TEXT NOT NULL DEFAULT 'joined' CHECK (status IN ('joined', 'playing', 'completed', 'stuck')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Enable row level security (RLS)
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.participants ENABLE ROW LEVEL SECURITY;

-- 4. Create RLS Policies
-- For demo purposes, we will allow fully open access to these tables (anonymous read/write).
-- In a production scenario, you would lock this down via Supabase Auth and strict policies.
CREATE POLICY "Enable read access for all users" ON public.sessions FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON public.sessions FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON public.sessions FOR UPDATE USING (true);

CREATE POLICY "Enable read access for all users" ON public.participants FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON public.participants FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON public.participants FOR UPDATE USING (true);

-- 5. Enable Supabase Realtime for these tables
-- Run this in the SQL Editor to allow clients to listen to changes on these tables
begin;
  -- remove the supabase_realtime publication
  drop publication if exists supabase_realtime;
  -- re-create the publication and add tables
  create publication supabase_realtime;
  alter publication supabase_realtime add table public.sessions;
  alter publication supabase_realtime add table public.participants;
commit;

-- Setup Complete.
