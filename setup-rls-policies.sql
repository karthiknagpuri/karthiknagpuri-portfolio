-- SQL Script to Handle Row-Level Security for Data Population
-- Run this in your Supabase SQL Editor to allow data insertion

-- Option 1: Temporarily disable RLS on all tables (for data population only)
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE social_links DISABLE ROW LEVEL SECURITY;
ALTER TABLE blogs DISABLE ROW LEVEL SECURITY;
ALTER TABLE projects DISABLE ROW LEVEL SECURITY;
ALTER TABLE resources DISABLE ROW LEVEL SECURITY;
ALTER TABLE messages DISABLE ROW LEVEL SECURITY;

-- After running your population script, you can re-enable RLS with:
-- ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE social_links ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE blogs ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE resources ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Option 2: Add INSERT policies that allow anonymous users (less secure)
-- CREATE POLICY "Allow anonymous insert" ON profiles FOR INSERT TO anon WITH CHECK (true);
-- CREATE POLICY "Allow anonymous insert" ON social_links FOR INSERT TO anon WITH CHECK (true);
-- CREATE POLICY "Allow anonymous insert" ON blogs FOR INSERT TO anon WITH CHECK (true);
-- CREATE POLICY "Allow anonymous insert" ON projects FOR INSERT TO anon WITH CHECK (true);
-- CREATE POLICY "Allow anonymous insert" ON resources FOR INSERT TO anon WITH CHECK (true);

-- Option 3: Add policies for authenticated users only
-- CREATE POLICY "Allow authenticated insert" ON profiles FOR INSERT TO authenticated WITH CHECK (true);
-- CREATE POLICY "Allow authenticated insert" ON social_links FOR INSERT TO authenticated WITH CHECK (true);
-- CREATE POLICY "Allow authenticated insert" ON blogs FOR INSERT TO authenticated WITH CHECK (true);
-- CREATE POLICY "Allow authenticated insert" ON projects FOR INSERT TO authenticated WITH CHECK (true);
-- CREATE POLICY "Allow authenticated insert" ON resources FOR INSERT TO authenticated WITH CHECK (true);