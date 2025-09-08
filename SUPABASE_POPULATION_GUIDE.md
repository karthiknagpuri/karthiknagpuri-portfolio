# Supabase Data Population Guide

## Issue: Row-Level Security (RLS) Blocking Data Insertion

Your Supabase database has Row-Level Security (RLS) policies enabled that prevent the population script from inserting data using the anonymous key.

## ✅ Current Status
- ✅ Connection to Supabase successful
- ✅ Database schema is properly set up
- ✅ Sample data file created (sample-data.json)
- ✅ Population script created (populate-backend.js)
- ❌ RLS policies blocking data insertion

## 🔧 Solution Options

### Option 1: Temporarily Disable RLS (Recommended for Development)

1. Open your Supabase project dashboard
2. Go to **SQL Editor**
3. Copy and paste the contents of `setup-rls-policies.sql`
4. Run the SQL script to disable RLS temporarily
5. Run the population script: `npm run setup-backend`
6. Re-enable RLS by running the commented SQL commands

### Option 2: Use Service Role Key (Advanced)

1. In Supabase dashboard, go to **Settings → API**
2. Copy your `service_role` key (⚠️ Keep this secret!)
3. Create a file called `.env` in your project root:
   ```
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
   ```
4. Modify the population script to use the service role key for admin operations

### Option 3: Use the LocalStorage Backup (Fallback)

If you can't modify Supabase settings:

1. The script already created `localStorage-backup.json`
2. Open your website at `http://localhost:8000/admin.html`
3. Use the admin panel to manually import the data
4. Your site will work with localStorage as the backend

## 📊 What Data Will Be Populated

- **Profile**: Personal information and bio
- **Social Links**: GitHub, LinkedIn, Twitter, Email (4 links)
- **Blog Posts**: 5 detailed technical blog posts
- **Projects**: 8 comprehensive projects with descriptions
- **Resources**: 20 curated development resources

## 🚀 Quick Start Commands

```bash
# Test connection only
npm run test-backend

# Populate all data (after fixing RLS)
npm run setup-backend

# Verify data insertion
npm run verify-data

# Create localStorage backup only
npm run backup-data
```

## 🔍 Troubleshooting

### "new row violates row-level security policy"
- **Solution**: Use Option 1 (disable RLS temporarily) or Option 2 (service role key)

### "Connection failed" or 404 errors
- **Check**: Supabase URL and API key are correct
- **Verify**: Supabase project is active and running

### Data not appearing on website
- **Check**: Run `npm run verify-data` to confirm data was inserted
- **Clear**: Browser cache and localStorage
- **Test**: Admin panel functionality at `/admin.html`

## 📈 Next Steps After Population

1. Visit `http://localhost:8000` to see your populated website
2. Check the admin panel at `http://localhost:8000/admin.html`
3. Test creating, editing, and deleting content
4. Verify data persists across page refreshes
5. Re-enable RLS policies for production use

## 🛡️ Security Notes

- RLS policies protect your data from unauthorized access
- Temporarily disabling RLS is safe for development/testing
- Always re-enable RLS before deploying to production
- Never commit service role keys to version control