
// This file contains SQL migrations that need to be run manually in the Supabase SQL Editor

/*
-- Add 'city' column to stadiums table if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_name = 'stadiums' AND column_name = 'city'
  ) THEN
    ALTER TABLE public.stadiums ADD COLUMN city VARCHAR;
  END IF;
END $$;

-- Add seating_capacity to sections table if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_name = 'sections' AND column_name = 'seating_capacity'
  ) THEN
    ALTER TABLE public.sections ADD COLUMN seating_capacity INTEGER DEFAULT 0;
  END IF;
END $$;

-- Add category_id to sections table if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_name = 'sections' AND column_name = 'category_id'
  ) THEN
    ALTER TABLE public.sections ADD COLUMN category_id UUID REFERENCES seat_categories(id) NULL;
  END IF;
END $$;

-- Ensure match_id is set up correctly in matches table
DO $$
BEGIN
  IF EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_name = 'matches' AND column_name = 'match_id' AND is_nullable = 'NO'
  ) THEN
    -- Change match_id to be nullable if it's not already
    ALTER TABLE public.matches ALTER COLUMN match_id DROP NOT NULL;
  END IF;
END $$;

-- Proper way to set up RLS for matches table
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;

-- Create policies without IF NOT EXISTS (manually check if they exist first)
DROP POLICY IF EXISTS "Allow public read access to matches" ON public.matches;
CREATE POLICY "Allow public read access to matches" 
ON public.matches FOR SELECT 
USING (true);

DROP POLICY IF EXISTS "Allow authenticated users to modify matches" ON public.matches;
CREATE POLICY "Allow authenticated users to modify matches" 
ON public.matches FOR ALL 
USING (true)
WITH CHECK (true);

-- Enable RLS for teams table
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;

-- Create policies for teams
DROP POLICY IF EXISTS "Allow public read access to teams" ON public.teams;
CREATE POLICY "Allow public read access to teams" 
ON public.teams FOR SELECT 
USING (true);

DROP POLICY IF EXISTS "Allow authenticated users to modify teams" ON public.teams;
CREATE POLICY "Allow authenticated users to modify teams" 
ON public.teams FOR ALL 
USING (true)
WITH CHECK (true);

-- Enable RLS for stadiums table
ALTER TABLE public.stadiums ENABLE ROW LEVEL SECURITY;

-- Create policies for stadiums
DROP POLICY IF EXISTS "Allow public read access to stadiums" ON public.stadiums;
CREATE POLICY "Allow public read access to stadiums" 
ON public.stadiums FOR SELECT 
USING (true);

DROP POLICY IF EXISTS "Allow authenticated users to modify stadiums" ON public.stadiums;
CREATE POLICY "Allow authenticated users to modify stadiums" 
ON public.stadiums FOR ALL 
USING (true)
WITH CHECK (true);

-- Enable RLS for sections table
ALTER TABLE public.sections ENABLE ROW LEVEL SECURITY;

-- Create policies for sections
DROP POLICY IF EXISTS "Allow public read access to sections" ON public.sections;
CREATE POLICY "Allow public read access to sections" 
ON public.sections FOR SELECT 
USING (true);

DROP POLICY IF EXISTS "Allow authenticated users to modify sections" ON public.sections;
CREATE POLICY "Allow authenticated users to modify sections" 
ON public.sections FOR ALL 
USING (true)
WITH CHECK (true);

-- Enable RLS for seat_categories table
ALTER TABLE public.seat_categories ENABLE ROW LEVEL SECURITY;

-- Create policies for match_prices
DROP POLICY IF EXISTS "Allow public read access to seat_categories" ON public.seat_categories;
CREATE POLICY "Allow public read access to seat_categories" 
ON public.seat_categories FOR SELECT 
USING (true);

DROP POLICY IF EXISTS "Allow authenticated users to modify seat_categories" ON public.seat_categories;
CREATE POLICY "Allow authenticated users to modify seat_categories" 
ON public.seat_categories FOR ALL 
USING (true)
WITH CHECK (true);
*/

