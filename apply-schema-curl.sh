#!/bin/bash

# Simple script to apply Supabase schema using curl
echo "🚀 Applying Supabase Schema via REST API..."
echo "📍 Project URL: https://dwbdpleelicqwhydzylr.supabase.co"
echo ""

# Supabase credentials
SUPABASE_URL="https://dwbdpleelicqwhydzylr.supabase.co"
SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR3YmRwbGVlbGljcXdoeWR6eWxyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTczMjc4MTUsImV4cCI6MjA3MjkwMzgxNX0.hqlIpI92OIioZRLV6kAPMtfpSPinNIP4i1t5ImtOVOo"

# Read the schema file
if [ ! -f "supabase-schema.sql" ]; then
    echo "❌ Error: supabase-schema.sql not found!"
    exit 1
fi

echo "📖 Reading schema file..."
SCHEMA_CONTENT=$(cat supabase-schema.sql | tr '\n' ' ' | sed 's/"/\\"/g')

echo "📤 Sending schema to Supabase..."

# Use the REST API to execute the schema
RESPONSE=$(curl -s -X POST "$SUPABASE_URL/rest/v1/rpc/exec_sql" \
  -H "apikey: $SUPABASE_ANON_KEY" \
  -H "Authorization: Bearer $SUPABASE_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d "{\"query\": \"$SCHEMA_CONTENT\"}")

echo "📥 Response received"

# Check if the response contains error
if echo "$RESPONSE" | grep -q "error\|Error"; then
    echo "⚠️  Schema application may have had issues:"
    echo "$RESPONSE" | head -5
    echo ""
    echo "💡 This is often normal if the schema was already partially applied."
else
    echo "✅ Schema applied successfully!"
fi

echo ""
echo "🔍 Testing connection..."

# Test connection by trying to read from profiles table
TEST_RESPONSE=$(curl -s "$SUPABASE_URL/rest/v1/profiles?select=count" \
  -H "apikey: $SUPABASE_ANON_KEY" \
  -H "Authorization: Bearer $SUPABASE_ANON_KEY")

if echo "$TEST_RESPONSE" | grep -q "error\|Error"; then
    echo "❌ Connection test failed"
    echo "Response: $TEST_RESPONSE"
else
    echo "✅ Database connection successful!"
    echo "📊 Profiles table accessible"
fi

echo ""
echo "🎯 Next Steps:"
echo "1. Open /test-supabase-connection.html to verify"
echo "2. Try /admin.html to manage content"
echo "3. Create test blog posts and resources"
echo ""
echo "=================================================="
