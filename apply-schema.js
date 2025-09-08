#!/usr/bin/env node

// Script to apply Supabase schema
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Supabase configuration
const SUPABASE_URL = 'https://dwbdpleelicqwhydzylr.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR3YmRwbGVlbGljcXdoeWR6eWxyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTczMjc4MTUsImV4cCI6MjA3MjkwMzgxNX0.hqlIpI92OIioZRLV6kAPMtfpSPinNIP4i1t5ImtOVOo';

// Initialize Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

console.log('🚀 Applying Supabase Schema...');
console.log('📍 Project URL:', SUPABASE_URL);
console.log('');

async function applySchema() {
    try {
        // Read the schema file
        const schemaPath = path.join(__dirname, 'supabase-schema.sql');
        const schemaSQL = fs.readFileSync(schemaPath, 'utf8');

        console.log('📖 Read schema file successfully');

        // Split the schema into individual statements
        const statements = schemaSQL
            .split(';')
            .map(stmt => stmt.trim())
            .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

        console.log(`📝 Found ${statements.length} SQL statements to execute`);
        console.log('');

        let successCount = 0;
        let errorCount = 0;

        // Execute each statement
        for (let i = 0; i < statements.length; i++) {
            const statement = statements[i];
            const preview = statement.substring(0, 50) + (statement.length > 50 ? '...' : '');

            try {
                console.log(`⚡ Executing [${i + 1}/${statements.length}]: ${preview}`);

                // For most statements, we can use a simple test
                if (statement.toUpperCase().includes('CREATE TABLE') ||
                    statement.toUpperCase().includes('CREATE EXTENSION') ||
                    statement.toUpperCase().includes('CREATE TRIGGER') ||
                    statement.toUpperCase().includes('CREATE INDEX') ||
                    statement.toUpperCase().includes('CREATE POLICY') ||
                    statement.toUpperCase().includes('ALTER TABLE') ||
                    statement.toUpperCase().includes('DROP')) {

                    // Test if the statement works by trying a simple query
                    const { error } = await supabase.rpc('exec_sql', { query: statement });

                    if (error) {
                        // If it's an "already exists" error, that's actually OK for our safe schema
                        if (error.message.includes('already exists') ||
                            error.message.includes('does not exist')) {
                            console.log(`   ⚠️  Expected: ${error.message.split('\n')[0]}`);
                            successCount++;
                        } else {
                            console.log(`   ❌ Error: ${error.message.split('\n')[0]}`);
                            errorCount++;
                        }
                    } else {
                        console.log(`   ✅ Success`);
                        successCount++;
                    }
                } else if (statement.toUpperCase().includes('INSERT INTO')) {
                    // Handle INSERT statements
                    const { error } = await supabase.rpc('exec_sql', { query: statement });

                    if (error) {
                        if (error.message.includes('duplicate key') ||
                            error.message.includes('already exists')) {
                            console.log(`   ⚠️  Expected (already exists): ${error.message.split('\n')[0]}`);
                            successCount++;
                        } else {
                            console.log(`   ❌ Error: ${error.message.split('\n')[0]}`);
                            errorCount++;
                        }
                    } else {
                        console.log(`   ✅ Success`);
                        successCount++;
                    }
                } else if (statement.toUpperCase().includes('CREATE OR REPLACE FUNCTION')) {
                    // Handle function creation
                    const { error } = await supabase.rpc('exec_sql', { query: statement });

                    if (error) {
                        console.log(`   ❌ Error: ${error.message.split('\n')[0]}`);
                        errorCount++;
                    } else {
                        console.log(`   ✅ Success`);
                        successCount++;
                    }
                } else {
                    console.log(`   ⏭️  Skipping: ${preview}`);
                }

            } catch (error) {
                console.log(`   ❌ Exception: ${error.message}`);
                errorCount++;
            }
        }

        console.log('');
        console.log('📊 Summary:');
        console.log(`   ✅ Successful: ${successCount}`);
        console.log(`   ❌ Errors: ${errorCount}`);
        console.log(`   📋 Total statements: ${statements.length}`);

        if (errorCount === 0) {
            console.log('');
            console.log('🎉 Schema applied successfully!');
            console.log('🧪 You can now test your connection at: /test-supabase-connection.html');
        } else {
            console.log('');
            console.log('⚠️  Some statements had errors. Check the output above.');
        }

        // Test the connection by trying to read from a table
        console.log('');
        console.log('🔍 Testing connection...');
        const { data, error } = await supabase.from('profiles').select('count').limit(1);

        if (error) {
            console.log('❌ Connection test failed:', error.message);
        } else {
            console.log('✅ Connection test successful!');
        }

    } catch (error) {
        console.error('💥 Failed to apply schema:', error.message);
        process.exit(1);
    }
}

// Alternative method using direct SQL execution
async function applySchemaAlternative() {
    try {
        console.log('🔄 Using alternative schema application method...');

        // Read the entire schema file
        const schemaPath = path.join(__dirname, 'supabase-schema.sql');
        const schemaSQL = fs.readFileSync(schemaPath, 'utf8');

        console.log('📖 Read schema file successfully');

        // Execute the entire schema at once
        const { data, error } = await supabase.rpc('exec_sql', {
            query: schemaSQL
        });

        if (error) {
            console.log('❌ Error applying schema:', error.message);
            console.log('');
            console.log('💡 This might be normal if the schema was already partially applied.');
            console.log('🔍 Try testing the connection at: /test-supabase-connection.html');
        } else {
            console.log('✅ Schema applied successfully!');
        }

        // Test connection
        console.log('');
        console.log('🔍 Testing connection...');
        const { data: testData, error: testError } = await supabase.from('profiles').select('*').limit(1);

        if (testError) {
            console.log('⚠️  Tables may not exist yet. Error:', testError.message);
            console.log('💡 Try refreshing /test-supabase-connection.html to see current status');
        } else {
            console.log('✅ Database connection successful!');
            console.log('📊 Found', testData ? testData.length : 0, 'profile(s)');
        }

    } catch (error) {
        console.error('💥 Alternative method failed:', error.message);
    }
}

// Run the schema application
async function main() {
    console.log('='.repeat(50));
    console.log('🛠️  SUPABASE SCHEMA APPLICATION TOOL');
    console.log('='.repeat(50));

    try {
        // First try the standard method
        await applySchema();
    } catch (error) {
        console.log('');
        console.log('🔄 Standard method failed, trying alternative...');
        await applySchemaAlternative();
    }

    console.log('');
    console.log('='.repeat(50));
    console.log('🎯 Next Steps:');
    console.log('1. Open /test-supabase-connection.html to verify');
    console.log('2. Try /admin.html to manage content');
    console.log('3. Create test blog posts and resources');
    console.log('='.repeat(50));
}

main().catch(console.error);
