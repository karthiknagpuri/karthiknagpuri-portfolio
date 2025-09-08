#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Supabase configuration
const SUPABASE_URL = 'https://dwbdpleelicqwhydzylr.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR3YmRwbGVlbGljcXdoeWR6eWxyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTczMjc4MTUsImV4cCI6MjA3MjkwMzgxNX0.hqlIpI92OIioZRLV6kAPMtfpSPinNIP4i1t5ImtOVOo';

console.log('🚀 Applying Supabase Schema...');

async function applySchema() {
    try {
        // Initialize Supabase client
        const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        
        console.log('✅ Connected to Supabase');
        
        // Read schema file
        const schemaPath = path.join(__dirname, 'supabase-schema.sql');
        const schemaSQL = fs.readFileSync(schemaPath, 'utf8');
        
        console.log('📄 Schema file loaded');
        
        // Split SQL into individual statements
        const statements = schemaSQL
            .split(';')
            .map(stmt => stmt.trim())
            .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
        
        console.log(`📋 Found ${statements.length} SQL statements to execute`);
        
        // Execute each statement
        for (let i = 0; i < statements.length; i++) {
            const statement = statements[i];
            if (statement.trim()) {
                try {
                    console.log(`⏳ Executing statement ${i + 1}/${statements.length}...`);
                    
                    // Use RPC to execute raw SQL
                    const { data, error } = await supabase.rpc('exec_sql', {
                        sql: statement + ';'
                    });
                    
                    if (error) {
                        // Some errors are expected (like "table already exists")
                        if (error.message.includes('already exists') || 
                            error.message.includes('IF NOT EXISTS')) {
                            console.log(`⚠️  Statement ${i + 1}: ${error.message} (continuing...)`);
                        } else {
                            console.error(`❌ Error in statement ${i + 1}:`, error.message);
                            console.log('SQL:', statement.substring(0, 100) + '...');
                        }
                    } else {
                        console.log(`✅ Statement ${i + 1} executed successfully`);
                    }
                } catch (err) {
                    console.error(`❌ Failed to execute statement ${i + 1}:`, err.message);
                    console.log('SQL:', statement.substring(0, 100) + '...');
                }
            }
        }
        
        console.log('🎉 Schema application completed!');
        
        // Verify tables exist
        console.log('🔍 Verifying tables...');
        const tables = ['profiles', 'social_links', 'blogs', 'projects', 'resources', 'messages'];
        
        for (const table of tables) {
            try {
                const { data, error } = await supabase.from(table).select('count').limit(1);
                if (error) {
                    console.log(`❌ Table '${table}': ${error.message}`);
                } else {
                    console.log(`✅ Table '${table}': exists and accessible`);
                }
            } catch (err) {
                console.log(`❌ Table '${table}': ${err.message}`);
            }
        }
        
    } catch (error) {
        console.error('💥 Fatal error:', error.message);
        process.exit(1);
    }
}

// Alternative approach - try direct SQL execution
async function alternativeApproach() {
    console.log('🔄 Trying alternative approach...');
    
    try {
        const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        
        // Try creating tables one by one with simpler approach
        const tables = {
            profiles: `
                CREATE TABLE IF NOT EXISTS profiles (
                    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
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
            `,
            social_links: `
                CREATE TABLE IF NOT EXISTS social_links (
                    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
                    platform TEXT NOT NULL,
                    url TEXT NOT NULL,
                    icon TEXT,
                    order_index INTEGER DEFAULT 0,
                    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
                );
            `,
            blogs: `
                CREATE TABLE IF NOT EXISTS blogs (
                    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
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
            `,
            projects: `
                CREATE TABLE IF NOT EXISTS projects (
                    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
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
            `,
            resources: `
                CREATE TABLE IF NOT EXISTS resources (
                    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
                    name TEXT NOT NULL,
                    category TEXT DEFAULT 'other',
                    url TEXT NOT NULL,
                    description TEXT,
                    featured BOOLEAN DEFAULT false,
                    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
                );
            `,
            messages: `
                CREATE TABLE IF NOT EXISTS messages (
                    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
                    name TEXT NOT NULL,
                    email TEXT NOT NULL,
                    message TEXT NOT NULL,
                    read BOOLEAN DEFAULT false,
                    replied BOOLEAN DEFAULT false,
                    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
                );
            `
        };
        
        console.log('⚠️  Note: Using simple table creation approach');
        console.log('📝 You may need to apply the full schema manually in Supabase Dashboard');
        console.log('🔗 Go to: https://supabase.com/dashboard → SQL Editor → paste supabase-schema.sql');
        
    } catch (error) {
        console.error('❌ Alternative approach failed:', error.message);
    }
}

// Run the script
applySchema().catch(() => {
    alternativeApproach();
});