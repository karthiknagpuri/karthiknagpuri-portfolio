-- Supabase Database Schema for Karthik Nagapuri Portfolio

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table (single row for profile data)
CREATE TABLE IF NOT EXISTS profiles (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL DEFAULT 'Karthik Nagapuri',
    title TEXT DEFAULT 'AI Engineer | Founder | Ecosystem Builder',
    email TEXT DEFAULT 'karthik@evolvex.in',
    phone TEXT DEFAULT '+91 98765 43210',
    location TEXT DEFAULT 'Hyderabad, India',
    bio TEXT,
    about TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default profile if not exists
INSERT INTO profiles (name, title, email, phone, location, bio, about)
VALUES (
    'Karthik Nagapuri',
    'AI Engineer | Founder | Ecosystem Builder',
    'karthik@evolvex.in',
    '+91 98765 43210',
    'Hyderabad, India',
    'From a rural farming family to building founder-first ecosystems across Bharat. Founded 4 startups, mentored MSMEs, hosted 100+ events.',
    E'I''m Zero [ Karthik Nagapuri ] — an AI engineer, founder, and ecosystem builder. From a rural farming family to building founder-first ecosystems across Bharat.\n\nFounded 4 startups, mentored MSMEs, hosted 100+ events. Pioneering AI solutions at EvolveX while creating Founder Quest — a 48-state journey documenting India''s entrepreneurial spirit.\n\nCurrent: Building 21st-century digital infrastructure. Passionate about AI democratization, rural entrepreneurship, and creating the future.'
)
ON CONFLICT DO NOTHING;

-- Social links table
CREATE TABLE IF NOT EXISTS social_links (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    platform TEXT NOT NULL,
    url TEXT NOT NULL,
    icon TEXT,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default social links
INSERT INTO social_links (platform, url, order_index) VALUES
    ('GitHub', 'https://github.com/karthiknagapuri', 1),
    ('LinkedIn', 'https://linkedin.com/in/karthiknagpuri', 2),
    ('Twitter', 'https://twitter.com/karthiknagpuri', 3),
    ('Medium', 'https://medium.com/@Karthiknagapuri', 4)
ON CONFLICT DO NOTHING;

-- Blogs table
CREATE TABLE IF NOT EXISTS blogs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    excerpt TEXT,
    content TEXT NOT NULL,
    tags TEXT[],
    read_time INTEGER DEFAULT 5,
    published BOOLEAN DEFAULT false,
    featured BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Projects table
CREATE TABLE IF NOT EXISTS projects (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    tech_stack TEXT[],
    url TEXT,
    github_url TEXT,
    image_url TEXT,
    status TEXT DEFAULT 'active',
    featured BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Resources table
CREATE TABLE IF NOT EXISTS resources (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT DEFAULT 'other',
    url TEXT NOT NULL,
    description TEXT,
    featured BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Messages table (contact form submissions)
CREATE TABLE IF NOT EXISTS messages (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    message TEXT NOT NULL,
    read BOOLEAN DEFAULT false,
    replied BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Games table
CREATE TABLE IF NOT EXISTS games (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    url TEXT,
    thumbnail TEXT,
    category TEXT DEFAULT 'puzzle',
    play_count INTEGER DEFAULT 0,
    featured BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
DROP TRIGGER IF EXISTS update_social_links_updated_at ON social_links;
DROP TRIGGER IF EXISTS update_blogs_updated_at ON blogs;
DROP TRIGGER IF EXISTS update_projects_updated_at ON projects;
DROP TRIGGER IF EXISTS update_resources_updated_at ON resources;
DROP TRIGGER IF EXISTS update_games_updated_at ON games;

-- Add triggers for updated_at columns
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_social_links_updated_at BEFORE UPDATE ON social_links
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_blogs_updated_at BEFORE UPDATE ON blogs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_resources_updated_at BEFORE UPDATE ON resources
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_games_updated_at BEFORE UPDATE ON games
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for better performance (safe to re-run)
CREATE INDEX IF NOT EXISTS idx_blogs_slug ON blogs(slug);
CREATE INDEX IF NOT EXISTS idx_blogs_published ON blogs(published);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_resources_category ON resources(category);
CREATE INDEX IF NOT EXISTS idx_messages_read ON messages(read);

-- Enable Row Level Security (RLS) - safe to re-run
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE blogs ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE games ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (safe to re-run)
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "Social links are viewable by everyone" ON social_links;
DROP POLICY IF EXISTS "Published blogs are viewable by everyone" ON blogs;
DROP POLICY IF EXISTS "Active projects are viewable by everyone" ON projects;
DROP POLICY IF EXISTS "Resources are viewable by everyone" ON resources;
DROP POLICY IF EXISTS "Games are viewable by everyone" ON games;
DROP POLICY IF EXISTS "Authenticated users can update profiles" ON profiles;
DROP POLICY IF EXISTS "Authenticated users can manage social links" ON social_links;
DROP POLICY IF EXISTS "Authenticated users can manage blogs" ON blogs;
DROP POLICY IF EXISTS "Authenticated users can manage projects" ON projects;
DROP POLICY IF EXISTS "Authenticated users can manage resources" ON resources;
DROP POLICY IF EXISTS "Authenticated users can manage messages" ON messages;
DROP POLICY IF EXISTS "Anyone can send messages" ON messages;
DROP POLICY IF EXISTS "Authenticated users can manage games" ON games;

-- Create policies for public read access
CREATE POLICY "Public profiles are viewable by everyone" ON profiles
    FOR SELECT USING (true);

CREATE POLICY "Social links are viewable by everyone" ON social_links
    FOR SELECT USING (true);

CREATE POLICY "Published blogs are viewable by everyone" ON blogs
    FOR SELECT USING (published = true);

CREATE POLICY "Active projects are viewable by everyone" ON projects
    FOR SELECT USING (status = 'active');

CREATE POLICY "Resources are viewable by everyone" ON resources
    FOR SELECT USING (true);

CREATE POLICY "Games are viewable by everyone" ON games
    FOR SELECT USING (true);

-- Create policies for authenticated write access
CREATE POLICY "Authenticated users can update profiles" ON profiles
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can manage social links" ON social_links
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can manage blogs" ON blogs
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can manage projects" ON projects
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can manage resources" ON resources
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can manage messages" ON messages
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Anyone can send messages" ON messages
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Authenticated users can manage games" ON games
    FOR ALL USING (auth.role() = 'authenticated');