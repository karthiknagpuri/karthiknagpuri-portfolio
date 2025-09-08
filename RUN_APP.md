# 🚀 Running Your Portfolio App

## Quick Start Options

### Option 1: Python Server (Recommended)
```bash
python3 start-server.py
```
Or manually:
```bash
python3 -m http.server 8000
```

### Option 2: Node.js (if installed)
```bash
npx http-server -p 8000
```
Or:
```bash
npm start
```

### Option 3: PHP (if installed)
```bash
php -S localhost:8000
```

### Option 4: Simple File Server
Double-click `start-server.py` or run it with Python

## 🌐 Access Your App

Once running, open these URLs:

- **Main Site**: http://localhost:8000
- **Admin Panel**: http://localhost:8000/admin.html
- **Test Supabase**: http://localhost:8000/test-supabase-connection.html
- **Blog**: http://localhost:8000/blog.html
- **Resources**: http://localhost:8000/resources.html

## 🔧 Admin Panel Access

- **URL**: http://localhost:8000/admin.html
- **Password**: `zero@admin2024`
- **Features**:
  - ✅ Manage blog posts
  - ✅ Add/edit resources
  - ✅ Update profile
  - ✅ View messages
  - ✅ Export/import data

## 🧪 Testing Supabase Connection

1. Visit: http://localhost:8000/test-supabase-connection.html
2. The page automatically tests your connection
3. Use the buttons to:
   - Test blogs table
   - Test resources table
   - Create test data
   - List existing data

## 📊 Current Status

- ✅ **Supabase Connected**: Credentials configured
- ⚠️ **Schema**: May need to be applied via dashboard
- ✅ **Admin Panel**: Ready with full CRUD operations
- ✅ **Fallback**: localStorage backup when Supabase unavailable

## 🚨 If Schema Not Applied

If test page shows "Tables not found":

1. Go to: https://supabase.com/dashboard/project/dwbdpleelicqwhydzylr
2. Navigate to **SQL Editor**
3. Copy entire `supabase-schema.sql` content
4. Click **Run**
5. Refresh test page

## 🎯 What You Can Do Now

1. **Create Blog Posts**: Write and publish content
2. **Add Resources**: Share tools, articles, links
3. **Update Profile**: Modify your information
4. **View Messages**: See contact form submissions
5. **Export Data**: Backup your content

## 🔄 Development Workflow

1. **Start Server**: `python3 start-server.py`
2. **Make Changes**: Edit HTML/CSS/JS files
3. **Test**: Refresh browser (Ctrl+F5)
4. **Check Console**: F12 for debugging
5. **Admin Panel**: Manage content at `/admin.html`

## 📱 Features Available

- **Responsive Design**: Works on all devices
- **Dark Mode**: Toggle with sun/moon icon
- **Admin Panel**: Full content management
- **Contact Form**: Submissions saved to Supabase
- **Resource Shelf**: AI-powered resource management
- **Blog System**: Full markdown support
- **Social Links**: Dynamic navigation updates

## 🆘 Troubleshooting

### Server Won't Start
- Try different port: `python3 -m http.server 3000`
- Check if port 8000 is in use
- Try Node.js: `npx http-server -p 8000`

### Admin Login Not Working
- Password: `zero@admin2024`
- Clear browser cache
- Check browser console for errors

### Supabase Not Working
- Check `/test-supabase-connection.html`
- Verify schema applied in dashboard
- Check browser console for connection errors

### Content Not Saving
- Check if Supabase schema is applied
- Verify connection in test page
- Check browser console for errors
- Falls back to localStorage if needed

---

**🎉 Your portfolio is ready! Start the server and explore all features.**
