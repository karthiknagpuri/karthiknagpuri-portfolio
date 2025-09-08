#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Supabase configuration
const SUPABASE_URL = 'https://dwbdpleelicqwhydzylr.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR3YmRwbGVlbGljcXdoeWR6eWxyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTczMjc4MTUsImV4cCI6MjA3MjkwMzgxNX0.hqlIpI92OIioZRLV6kAPMtfpSPinNIP4i1t5ImtOVOo';

// For RLS bypass during population, we'll try different approaches
console.log('💡 Note: If you encounter RLS policy violations, consider:');
console.log('   1. Temporarily disabling RLS policies in Supabase dashboard');
console.log('   2. Using service_role key instead of anon key');
console.log('   3. Adding INSERT policies for authenticated users');

console.log('🚀 Populating Supabase Backend with Sample Data...');

async function populateBackend() {
    try {
        // Initialize Supabase client
        const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        console.log('✅ Connected to Supabase');
        
        // Load sample data
        const dataPath = path.join(__dirname, 'sample-data.json');
        const sampleData = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
        console.log('📄 Sample data loaded');
        
        let totalInserted = 0;
        let totalErrors = 0;
        
        // 1. Insert Profile Data (Clear existing first)
        console.log('\\n👤 Inserting Profile...');
        try {
            // First, try to clear existing data
            console.log('   Clearing existing profiles...');
            await supabase.from('profiles').delete().neq('id', '00000000-0000-0000-0000-000000000000');
            
            // Then insert new profile
            console.log('   Inserting new profile...');
            const { data, error } = await supabase
                .from('profiles')
                .insert(sampleData.profile)
                .select();
            
            if (error) {
                console.error('❌ Profile error:', error.message);
                if (error.message.includes('row-level security policy')) {
                    console.log('💡 RLS Policy Issue: Try disabling RLS on profiles table or use service_role key');
                }
                totalErrors++;
            } else {
                console.log(`✅ Profile inserted: ${data?.length || 1} record`);
                totalInserted++;
            }
        } catch (err) {
            console.error('❌ Profile failed:', err.message);
            totalErrors++;
        }
        
        // 2. Insert Social Links
        console.log('\\n🔗 Inserting Social Links...');
        try {
            // Delete existing social links first
            await supabase.from('social_links').delete().neq('id', '00000000-0000-0000-0000-000000000000');
            
            const { data, error } = await supabase
                .from('social_links')
                .insert(sampleData.social_links)
                .select();
            
            if (error) {
                console.error('❌ Social links error:', error.message);
                totalErrors++;
            } else {
                console.log(`✅ Social links inserted: ${data?.length || 0} records`);
                totalInserted += data?.length || 0;
            }
        } catch (err) {
            console.error('❌ Social links failed:', err.message);
            totalErrors++;
        }
        
        // 3. Insert Blogs
        console.log('\\n📝 Inserting Blogs...');
        try {
            // Clear existing blogs first
            await supabase.from('blogs').delete().neq('id', '00000000-0000-0000-0000-000000000000');
            
            const { data, error } = await supabase
                .from('blogs')
                .insert(sampleData.blogs)
                .select();
            
            if (error) {
                console.error('❌ Blogs error:', error.message);
                totalErrors++;
            } else {
                console.log(`✅ Blogs inserted: ${data?.length || 0} records`);
                totalInserted += data?.length || 0;
            }
        } catch (err) {
            console.error('❌ Blogs failed:', err.message);
            totalErrors++;
        }
        
        // 4. Insert Projects
        console.log('\\n🚀 Inserting Projects...');
        try {
            // Clear existing projects first
            await supabase.from('projects').delete().neq('id', '00000000-0000-0000-0000-000000000000');
            
            const { data, error } = await supabase
                .from('projects')
                .insert(sampleData.projects)
                .select();
            
            if (error) {
                console.error('❌ Projects error:', error.message);
                totalErrors++;
            } else {
                console.log(`✅ Projects inserted: ${data?.length || 0} records`);
                totalInserted += data?.length || 0;
            }
        } catch (err) {
            console.error('❌ Projects failed:', err.message);
            totalErrors++;
        }
        
        // 5. Insert Resources
        console.log('\\n📚 Inserting Resources...');
        try {
            // Clear existing resources first
            await supabase.from('resources').delete().neq('id', '00000000-0000-0000-0000-000000000000');
            
            const { data, error } = await supabase
                .from('resources')
                .insert(sampleData.resources)
                .select();
            
            if (error) {
                console.error('❌ Resources error:', error.message);
                totalErrors++;
            } else {
                console.log(`✅ Resources inserted: ${data?.length || 0} records`);
                totalInserted += data?.length || 0;
            }
        } catch (err) {
            console.error('❌ Resources failed:', err.message);
            totalErrors++;
        }
        
        // 6. Verification
        console.log('\\n🔍 Verifying Data...');
        const tables = ['profiles', 'social_links', 'blogs', 'projects', 'resources'];
        const counts = {};
        
        for (const table of tables) {
            try {
                const { count, error } = await supabase
                    .from(table)
                    .select('*', { count: 'exact', head: true });
                
                if (error) {
                    console.log(`❌ ${table}: ${error.message}`);
                    counts[table] = 'error';
                } else {
                    console.log(`✅ ${table}: ${count} records`);
                    counts[table] = count;
                }
            } catch (err) {
                console.log(`❌ ${table}: ${err.message}`);
                counts[table] = 'error';
            }
        }
        
        // Final Summary
        console.log('\\n🎉 Population Complete!');
        console.log('===============================');
        console.log(`✅ Total records inserted: ${totalInserted}`);
        console.log(`❌ Total errors: ${totalErrors}`);
        console.log('\\n📊 Database Summary:');
        Object.entries(counts).forEach(([table, count]) => {
            console.log(`   ${table}: ${count} records`);
        });
        
        console.log('\\n🚀 Next Steps:');
        console.log('1. Open your website: http://localhost:8000');
        console.log('2. Check admin panel: http://localhost:8000/admin.html');
        console.log('3. Verify data appears correctly');
        console.log('4. Test CRUD operations in admin panel');
        
        if (totalErrors > 0) {
            console.log(`\\n⚠️  Note: ${totalErrors} errors occurred during population`);
            console.log('Check error messages above for details');
        }
        
    } catch (error) {
        console.error('💥 Fatal error:', error.message);
        process.exit(1);
    }
}

// Alternative function to create sample data in localStorage format
async function createLocalStorageBackup() {
    console.log('\\n💾 Creating localStorage backup...');
    
    try {
        const dataPath = path.join(__dirname, 'sample-data.json');
        const sampleData = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
        
        const localStorageData = {
            profile: sampleData.profile,
            socials: sampleData.social_links,
            blogs: sampleData.blogs.map(blog => ({
                ...blog,
                id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
                created_at: new Date().toISOString()
            })),
            resources: sampleData.resources.map(resource => ({
                ...resource,
                id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
                created_at: new Date().toISOString()
            })),
            projects: sampleData.projects.map(project => ({
                ...project,
                id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
                created_at: new Date().toISOString()
            }))
        };
        
        const backupPath = path.join(__dirname, 'localStorage-backup.json');
        fs.writeFileSync(backupPath, JSON.stringify(localStorageData, null, 2));
        
        console.log('✅ localStorage backup created: localStorage-backup.json');
        console.log('💡 You can manually copy this data to localStorage if Supabase fails');
        
    } catch (error) {
        console.error('❌ Backup creation failed:', error.message);
    }
}

// Main execution
async function main() {
    const args = process.argv.slice(2);
    
    if (args.includes('--backup-only')) {
        await createLocalStorageBackup();
        return;
    }
    
    if (args.includes('--test-connection')) {
        console.log('🔌 Testing Supabase connection...');
        try {
            const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
            const { data, error } = await supabase.from('profiles').select('count').limit(1);
            
            if (error) {
                console.error('❌ Connection failed:', error.message);
                console.log('💡 Try running with --backup-only to create localStorage data');
            } else {
                console.log('✅ Connection successful!');
                console.log('🚀 Run without --test-connection to populate data');
            }
        } catch (err) {
            console.error('❌ Connection error:', err.message);
        }
        return;
    }
    
    // Default: populate backend
    await populateBackend();
    await createLocalStorageBackup();
}

main().catch(console.error);