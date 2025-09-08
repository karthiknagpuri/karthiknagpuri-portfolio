#!/usr/bin/env node

// Quick schema application script using npx
const https = require('https');
const fs = require('fs');
const path = require('path');

// Supabase configuration
const SUPABASE_URL = 'https://dwbdpleelicqwhydzylr.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR3YmRwbGVlbGljcXdoeWR6eWxyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTczMjc4MTUsImV4cCI6MjA3MjkwMzgxNX0.hqlIpI92OIioZRLV6kAPMtfpSPinNIP4i1t5ImtOVOo';

console.log('🚀 Quick Supabase Schema Application');
console.log('📍 Project URL:', SUPABASE_URL);
console.log('');

function makeRequest(endpoint, data) {
    return new Promise((resolve, reject) => {
        const url = new URL(endpoint, SUPABASE_URL);
        const options = {
            hostname: url.hostname,
            path: url.pathname + url.search,
            method: data ? 'POST' : 'GET',
            headers: {
                'apikey': SUPABASE_ANON_KEY,
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                'Content-Type': 'application/json'
            }
        };

        const req = https.request(options, (res) => {
            let body = '';
            res.on('data', (chunk) => body += chunk);
            res.on('end', () => {
                try {
                    const response = body ? JSON.parse(body) : {};
                    resolve({ statusCode: res.statusCode, data: response });
                } catch (e) {
                    resolve({ statusCode: res.statusCode, data: body });
                }
            });
        });

        req.on('error', reject);

        if (data) {
            req.write(JSON.stringify(data));
        }

        req.end();
    });
}

async function applySchema() {
    try {
        // Read the schema file
        const schemaPath = path.join(__dirname, 'supabase-schema.sql');
        const schemaSQL = fs.readFileSync(schemaPath, 'utf8');

        console.log('📖 Read schema file successfully');

        // Test connection first
        console.log('🔍 Testing connection...');
        const testResponse = await makeRequest('/rest/v1/profiles?select=count');

        if (testResponse.statusCode === 200) {
            console.log('✅ Connection test successful!');
        } else {
            console.log('⚠️  Connection test returned:', testResponse.statusCode);
        }

        // Apply schema
        console.log('📤 Applying schema...');

        const schemaResponse = await makeRequest('/rest/v1/rpc/exec_sql', {
            query: schemaSQL
        });

        console.log('📥 Response received');

        if (schemaResponse.statusCode === 200) {
            console.log('✅ Schema applied successfully!');
        } else {
            console.log('⚠️  Schema application response:', schemaResponse.statusCode);
            if (schemaResponse.data && typeof schemaResponse.data === 'object') {
                console.log('Response:', JSON.stringify(schemaResponse.data, null, 2));
            } else {
                console.log('Response:', schemaResponse.data);
            }
        }

        // Test connection again
        console.log('');
        console.log('🔍 Final connection test...');
        const finalTest = await makeRequest('/rest/v1/profiles?select=*&limit=1');

        if (finalTest.statusCode === 200) {
            console.log('✅ Database fully operational!');
            console.log('📊 Tables accessible and ready for use');
        } else {
            console.log('⚠️  Final test returned:', finalTest.statusCode);
        }

    } catch (error) {
        console.error('💥 Error:', error.message);
    }
}

// Alternative method using simple curl-like approach
async function simpleTest() {
    console.log('🔄 Using simple connection test...');

    const testResponse = await makeRequest('/rest/v1/profiles?select=count');

    if (testResponse.statusCode === 200) {
        console.log('✅ Supabase connection is working!');
        console.log('💡 Schema may already be applied or partially applied.');
    } else if (testResponse.statusCode === 404) {
        console.log('❌ Tables not found - schema needs to be applied');
        console.log('📋 Go to Supabase Dashboard → SQL Editor to apply schema');
    } else {
        console.log('⚠️  Unexpected response:', testResponse.statusCode);
        console.log('Response:', testResponse.data);
    }
}

async function main() {
    console.log('='.repeat(50));
    console.log('🛠️  SUPABASE SCHEMA APPLICATION TOOL');
    console.log('='.repeat(50));

    try {
        await applySchema();
    } catch (error) {
        console.log('');
        console.log('🔄 Main method failed, trying simple test...');
        await simpleTest();
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
