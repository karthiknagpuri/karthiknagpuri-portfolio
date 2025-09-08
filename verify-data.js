#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');

// Supabase configuration
const SUPABASE_URL = 'https://dwbdpleelicqwhydzylr.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR3YmRwbGVlbGljcXdoeWR6eWxyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTczMjc4MTUsImV4cCI6MjA3MjkwMzgxNX0.hqlIpI92OIioZRLV6kAPMtfpSPinNIP4i1t5ImtOVOo';

console.log('🔍 Verifying Supabase Data...');

async function verifyData() {
    try {
        const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        console.log('✅ Connected to Supabase');
        
        const tables = [
            { name: 'profiles', expectedMin: 1 },
            { name: 'social_links', expectedMin: 4 },
            { name: 'blogs', expectedMin: 5 },
            { name: 'projects', expectedMin: 6 },
            { name: 'resources', expectedMin: 15 },
            { name: 'messages', expectedMin: 0 }
        ];
        
        console.log('\\n📊 Table Verification:');
        console.log('=====================');
        
        let allGood = true;
        
        for (const table of tables) {
            try {
                // Get count
                const { count, error: countError } = await supabase
                    .from(table.name)
                    .select('*', { count: 'exact', head: true });
                
                if (countError) {
                    console.log(`❌ ${table.name}: ${countError.message}`);
                    allGood = false;
                    continue;
                }
                
                // Get sample data
                const { data, error } = await supabase
                    .from(table.name)
                    .select('*')
                    .limit(3);
                
                if (error) {
                    console.log(`❌ ${table.name}: ${error.message}`);
                    allGood = false;
                    continue;
                }
                
                const status = count >= table.expectedMin ? '✅' : '⚠️';
                console.log(`${status} ${table.name}: ${count} records (expected min: ${table.expectedMin})`);
                
                // Show sample data
                if (data && data.length > 0) {
                    console.log(`   Sample: ${JSON.stringify(data[0]).substring(0, 100)}...`);
                }
                
                if (count < table.expectedMin) {
                    allGood = false;
                }
                
            } catch (err) {
                console.log(`❌ ${table.name}: ${err.message}`);
                allGood = false;
            }
        }
        
        // Test specific data
        console.log('\\n🧪 Data Quality Tests:');
        console.log('=====================');
        
        // Test 1: Blogs have proper slugs
        try {
            const { data: blogs, error } = await supabase
                .from('blogs')
                .select('title, slug')
                .limit(5);
            
            if (error) {
                console.log('❌ Blog slug test failed:', error.message);
                allGood = false;
            } else {
                const slugTest = blogs.every(blog => blog.slug && blog.slug.length > 0);
                console.log(`${slugTest ? '✅' : '❌'} Blog slugs: ${slugTest ? 'All valid' : 'Some missing'}`);
                if (!slugTest) allGood = false;
            }
        } catch (err) {
            console.log('❌ Blog test error:', err.message);
            allGood = false;
        }
        
        // Test 2: Resources have URLs
        try {
            const { data: resources, error } = await supabase
                .from('resources')
                .select('name, url')
                .limit(10);
            
            if (error) {
                console.log('❌ Resource URL test failed:', error.message);
                allGood = false;
            } else {
                const urlTest = resources.every(resource => resource.url && resource.url.startsWith('http'));
                console.log(`${urlTest ? '✅' : '❌'} Resource URLs: ${urlTest ? 'All valid' : 'Some invalid'}`);
                if (!urlTest) allGood = false;
            }
        } catch (err) {
            console.log('❌ Resource test error:', err.message);
            allGood = false;
        }
        
        // Test 3: Social links have proper order
        try {
            const { data: socials, error } = await supabase
                .from('social_links')
                .select('platform, order_index')
                .order('order_index');
            
            if (error) {
                console.log('❌ Social links order test failed:', error.message);
                allGood = false;
            } else {
                const orderTest = socials.every((social, index) => social.order_index === index + 1);
                console.log(`${orderTest ? '✅' : '❌'} Social links order: ${orderTest ? 'Correct' : 'Incorrect'}`);
                if (!orderTest) allGood = false;
            }
        } catch (err) {
            console.log('❌ Social links test error:', err.message);
            allGood = false;
        }
        
        // Summary
        console.log('\\n🎯 Verification Summary:');
        console.log('========================');
        
        if (allGood) {
            console.log('✅ All tests passed! Your backend is ready.');
            console.log('\\n🚀 What to do next:');
            console.log('1. Open http://localhost:8000 to see your site');
            console.log('2. Check admin panel at http://localhost:8000/admin.html');
            console.log('3. Test creating/editing content');
            console.log('4. Verify data persists across page refreshes');
        } else {
            console.log('❌ Some tests failed. Check the errors above.');
            console.log('\\n🔧 Troubleshooting:');
            console.log('1. Make sure you have the correct Supabase URL and key');
            console.log('2. Ensure your Supabase project has the correct schema');
            console.log('3. Run the populate-backend.js script again');
            console.log('4. Check Supabase dashboard for RLS policies');
        }
        
        console.log('\\n📊 Database Status: ' + (allGood ? '🟢 Ready' : '🟡 Needs Attention'));
        
    } catch (error) {
        console.error('💥 Verification failed:', error.message);
        console.log('\\n🆘 Emergency Fallback:');
        console.log('Your site will still work with localStorage fallback');
        process.exit(1);
    }
}

// Connection test function
async function testConnection() {
    console.log('🔌 Testing Supabase connection...');
    
    try {
        const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        
        // Simple connection test
        const { data, error } = await supabase
            .from('profiles')
            .select('count')
            .limit(1);
        
        if (error) {
            console.log('❌ Connection test failed:', error.message);
            console.log('\\n💡 Possible issues:');
            console.log('- Incorrect Supabase URL or API key');
            console.log('- Supabase project not active');
            console.log('- Tables not created yet');
            console.log('- Network connectivity issues');
            return false;
        } else {
            console.log('✅ Connection successful!');
            return true;
        }
        
    } catch (err) {
        console.log('❌ Connection error:', err.message);
        return false;
    }
}

// Main execution
async function main() {
    const args = process.argv.slice(2);
    
    if (args.includes('--connection-only')) {
        const connected = await testConnection();
        if (connected) {
            console.log('🚀 Connection works! Run without --connection-only for full verification');
        }
        return;
    }
    
    // Default: full verification
    await verifyData();
}

main().catch(console.error);