#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Supabase configuration
const SUPABASE_URL = 'https://dwbdpleelicqwhydzylr.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR3YmRwbGVlbGljcXdoeWR6eWxyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTczMjc4MTUsImV4cCI6MjA3MjkwMzgxNX0.hqlIpI92OIioZRLV6kAPMtfpSPinNIP4i1t5ImtOVOo';

// Try to use service role key if available
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('🚀 Enhanced Supabase Population Script');
console.log('=====================================');

async function populateWithAuth() {
    try {
        let supabase;
        let authMethod = 'anonymous';
        
        // Try service role key first if available
        if (SUPABASE_SERVICE_ROLE_KEY) {
            console.log('🔑 Using service role key for admin access');
            supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
            authMethod = 'service_role';
        } else {
            console.log('🔓 Using anonymous key (RLS policies may block insertion)');
            supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        }
        
        console.log('✅ Connected to Supabase');
        
        // Load sample data
        const dataPath = path.join(__dirname, 'sample-data.json');
        const sampleData = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
        console.log('📄 Sample data loaded');
        
        let totalInserted = 0;
        let totalErrors = 0;
        
        // Test insertion capability first
        console.log(`\\n🧪 Testing insertion capability with ${authMethod} key...`);
        try {
            const testData = { name: 'test', bio: 'test bio' };
            const { data: testResult, error: testError } = await supabase
                .from('profiles')
                .insert(testData)
                .select();
            
            if (testError) {
                if (testError.message.includes('row-level security policy')) {
                    console.log('❌ RLS policies are blocking insertion');
                    console.log('💡 Solutions:');
                    console.log('   1. Run setup-rls-policies.sql in Supabase SQL Editor');
                    console.log('   2. Set SUPABASE_SERVICE_ROLE_KEY environment variable');
                    console.log('   3. Use localStorage backup instead (already created)');
                    return;
                }
            } else {
                // Clean up test data
                if (testResult && testResult[0]) {
                    await supabase.from('profiles').delete().eq('id', testResult[0].id);
                }
                console.log('✅ Insertion test passed');
            }
        } catch (testErr) {
            console.log('❌ Insertion test failed:', testErr.message);
            if (authMethod === 'anonymous') {
                console.log('💡 Try setting SUPABASE_SERVICE_ROLE_KEY environment variable');
            }
            return;
        }
        
        // Proceed with data population
        const tables = [
            { name: 'profiles', data: sampleData.profile, singular: true },
            { name: 'social_links', data: sampleData.social_links, singular: false },
            { name: 'blogs', data: sampleData.blogs, singular: false },
            { name: 'projects', data: sampleData.projects, singular: false },
            { name: 'resources', data: sampleData.resources, singular: false }
        ];
        
        for (const table of tables) {
            console.log(`\\n📊 Populating ${table.name}...`);
            try {
                // Clear existing data
                console.log(`   Clearing existing ${table.name}...`);
                await supabase.from(table.name).delete().neq('id', '00000000-0000-0000-0000-000000000000');
                
                // Insert new data
                console.log(`   Inserting new ${table.name}...`);
                const insertData = table.singular ? [table.data] : table.data;
                const { data, error } = await supabase
                    .from(table.name)
                    .insert(insertData)
                    .select();
                
                if (error) {
                    console.error(`❌ ${table.name} error:`, error.message);
                    totalErrors++;
                } else {
                    const count = data?.length || 0;
                    console.log(`✅ ${table.name}: ${count} records inserted`);
                    totalInserted += count;
                }
            } catch (err) {
                console.error(`❌ ${table.name} failed:`, err.message);
                totalErrors++;
            }
        }
        
        // Verification
        console.log('\\n🔍 Verifying Data...');
        const counts = {};
        
        for (const table of tables) {
            try {
                const { count, error } = await supabase
                    .from(table.name)
                    .select('*', { count: 'exact', head: true });
                
                if (error) {
                    console.log(`❌ ${table.name}: ${error.message}`);
                    counts[table.name] = 'error';
                } else {
                    console.log(`✅ ${table.name}: ${count} records`);
                    counts[table.name] = count;
                }
            } catch (err) {
                console.log(`❌ ${table.name}: ${err.message}`);
                counts[table.name] = 'error';
            }
        }
        
        // Final Summary
        console.log('\\n🎉 Population Complete!');
        console.log('===============================');
        console.log(`🔑 Authentication: ${authMethod}`);
        console.log(`✅ Total records inserted: ${totalInserted}`);
        console.log(`❌ Total errors: ${totalErrors}`);
        console.log('\\n📊 Database Summary:');
        Object.entries(counts).forEach(([table, count]) => {
            console.log(`   ${table}: ${count} records`);
        });
        
        if (totalErrors === 0) {
            console.log('\\n🚀 Success! Next Steps:');
            console.log('1. Open your website: http://localhost:8000');
            console.log('2. Check admin panel: http://localhost:8000/admin.html');
            console.log('3. Verify data appears correctly');
            console.log('4. Test CRUD operations in admin panel');
        } else {
            console.log(`\\n⚠️  ${totalErrors} errors occurred during population`);
            console.log('See SUPABASE_POPULATION_GUIDE.md for troubleshooting');
        }
        
    } catch (error) {
        console.error('💥 Fatal error:', error.message);
        console.log('\\n📖 Check SUPABASE_POPULATION_GUIDE.md for solutions');
        process.exit(1);
    }
}

// Main execution
async function main() {
    const args = process.argv.slice(2);
    
    if (args.includes('--help')) {
        console.log('Usage: node populate-with-auth.js [options]');
        console.log('');
        console.log('Options:');
        console.log('  --help     Show this help message');
        console.log('');
        console.log('Environment Variables:');
        console.log('  SUPABASE_SERVICE_ROLE_KEY  Service role key for bypassing RLS');
        console.log('');
        console.log('Examples:');
        console.log('  node populate-with-auth.js');
        console.log('  SUPABASE_SERVICE_ROLE_KEY=your_key node populate-with-auth.js');
        return;
    }
    
    await populateWithAuth();
}

main().catch(console.error);