-- Migration to fix resources table structure
-- Run this in Supabase SQL Editor if you want to add metadata support

-- Check if metadata column exists, add it if it doesn't
DO $$ 
BEGIN 
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'resources' AND column_name = 'metadata'
    ) THEN
        ALTER TABLE resources ADD COLUMN metadata JSONB;
        COMMENT ON COLUMN resources.metadata IS 'Additional resource metadata (ratings, recommendations, etc.)';
    END IF;
END $$;

-- Verify the current resources table structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'resources' 
ORDER BY ordinal_position;

-- Show sample resources data structure
SELECT 
    id,
    name,
    url,
    category,
    description,
    featured,
    created_at
FROM resources 
LIMIT 3;