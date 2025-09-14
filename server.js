const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// Data file paths
const DATA_DIR = path.join(__dirname, 'data');
const ADMIN_FILE = path.join(DATA_DIR, 'admin.json');
const PROFILE_FILE = path.join(DATA_DIR, 'profile.json');
const SOCIALS_FILE = path.join(DATA_DIR, 'socials.json');
const BLOGS_FILE = path.join(DATA_DIR, 'blogs.json');
const PROJECTS_FILE = path.join(DATA_DIR, 'projects.json');
const RESOURCES_FILE = path.join(DATA_DIR, 'resources.json');
const MESSAGES_FILE = path.join(DATA_DIR, 'messages.json');

// Initialize data directory and files
async function initializeData() {
    try {
        await fs.mkdir(DATA_DIR, { recursive: true });
        
        // Initialize admin credentials
        if (!await fileExists(ADMIN_FILE)) {
            await fs.writeFile(ADMIN_FILE, JSON.stringify({
                password: hashPassword('zero@admin2024'),
                sessions: []
            }, null, 2));
        }
        
        // Initialize profile
        if (!await fileExists(PROFILE_FILE)) {
            await fs.writeFile(PROFILE_FILE, JSON.stringify({
                name: 'Karthik Nagapuri',
                title: 'AI Engineer | Founder | Ecosystem Builder',
                email: 'karthik@evolvex.in',
                phone: '+91 98765 43210',
                location: 'Hyderabad, India',
                bio: 'From a rural farming family to building founder-first ecosystems across Bharat. Founded 4 startups, mentored MSMEs, hosted 100+ events.',
                about: `I'm Zero [ Karthik Nagapuri ] — an AI engineer, founder, and ecosystem builder. From a rural farming family to building founder-first ecosystems across Bharat.

Founded 4 startups, mentored MSMEs, hosted 100+ events. Pioneering AI solutions at EvolveX while creating Founder Quest — a 48-state journey documenting India's entrepreneurial spirit.

Current: Building 21st-century digital infrastructure. Passionate about AI democratization, rural entrepreneurship, and creating the future.`
            }, null, 2));
        }
        
        // Initialize socials
        if (!await fileExists(SOCIALS_FILE)) {
            await fs.writeFile(SOCIALS_FILE, JSON.stringify([
                { platform: 'GitHub', url: 'https://github.com/karthiknagapuri' },
                { platform: 'LinkedIn', url: 'https://linkedin.com/in/karthiknagpuri' },
                { platform: 'Twitter', url: 'https://twitter.com/karthiknagpuri' },
                { platform: 'Medium', url: 'https://medium.com/@Karthiknagapuri' }
            ], null, 2));
        }
        
        // Initialize empty arrays for other data
        if (!await fileExists(BLOGS_FILE)) {
            await fs.writeFile(BLOGS_FILE, JSON.stringify([], null, 2));
        }
        if (!await fileExists(PROJECTS_FILE)) {
            await fs.writeFile(PROJECTS_FILE, JSON.stringify([], null, 2));
        }
        if (!await fileExists(RESOURCES_FILE)) {
            await fs.writeFile(RESOURCES_FILE, JSON.stringify([], null, 2));
        }
        if (!await fileExists(MESSAGES_FILE)) {
            await fs.writeFile(MESSAGES_FILE, JSON.stringify([], null, 2));
        }
        
    } catch (error) {
        console.error('Error initializing data:', error);
    }
}

// Helper functions
async function fileExists(filePath) {
    try {
        await fs.access(filePath);
        return true;
    } catch {
        return false;
    }
}

function hashPassword(password) {
    return crypto.createHash('sha256').update(password).digest('hex');
}

function generateToken() {
    return crypto.randomBytes(32).toString('hex');
}

// Auth middleware
async function authenticateToken(req, res, next) {
    const token = req.headers['authorization']?.split(' ')[1];
    
    if (!token) {
        return res.status(401).json({ error: 'No token provided' });
    }
    
    try {
        const adminData = JSON.parse(await fs.readFile(ADMIN_FILE, 'utf8'));
        const session = adminData.sessions.find(s => s.token === token);
        
        if (!session || new Date(session.expiry) < new Date()) {
            return res.status(401).json({ error: 'Invalid or expired token' });
        }
        
        req.session = session;
        next();
    } catch (error) {
        res.status(500).json({ error: 'Authentication error' });
    }
}

// API Routes

// Auth endpoints
app.post('/api/login', async (req, res) => {
    const { password } = req.body;
    
    try {
        const adminData = JSON.parse(await fs.readFile(ADMIN_FILE, 'utf8'));
        
        if (hashPassword(password) !== adminData.password) {
            return res.status(401).json({ error: 'Invalid password' });
        }
        
        const token = generateToken();
        const expiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
        
        adminData.sessions.push({ token, expiry });
        await fs.writeFile(ADMIN_FILE, JSON.stringify(adminData, null, 2));
        
        res.json({ token, expiry });
    } catch (error) {
        res.status(500).json({ error: 'Login failed' });
    }
});

app.post('/api/logout', authenticateToken, async (req, res) => {
    try {
        const adminData = JSON.parse(await fs.readFile(ADMIN_FILE, 'utf8'));
        adminData.sessions = adminData.sessions.filter(s => s.token !== req.session.token);
        await fs.writeFile(ADMIN_FILE, JSON.stringify(adminData, null, 2));
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Logout failed' });
    }
});

app.post('/api/change-password', authenticateToken, async (req, res) => {
    const { newPassword } = req.body;
    
    try {
        const adminData = JSON.parse(await fs.readFile(ADMIN_FILE, 'utf8'));
        adminData.password = hashPassword(newPassword);
        adminData.sessions = []; // Invalidate all sessions
        await fs.writeFile(ADMIN_FILE, JSON.stringify(adminData, null, 2));
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Password change failed' });
    }
});

// Profile endpoints
app.get('/api/profile', async (req, res) => {
    try {
        const profile = JSON.parse(await fs.readFile(PROFILE_FILE, 'utf8'));
        res.json(profile);
    } catch (error) {
        res.status(500).json({ error: 'Failed to load profile' });
    }
});

app.put('/api/profile', authenticateToken, async (req, res) => {
    try {
        await fs.writeFile(PROFILE_FILE, JSON.stringify(req.body, null, 2));
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update profile' });
    }
});

// Social links endpoints
app.get('/api/socials', async (req, res) => {
    try {
        const socials = JSON.parse(await fs.readFile(SOCIALS_FILE, 'utf8'));
        res.json(socials);
    } catch (error) {
        res.status(500).json({ error: 'Failed to load socials' });
    }
});

app.put('/api/socials', authenticateToken, async (req, res) => {
    try {
        await fs.writeFile(SOCIALS_FILE, JSON.stringify(req.body, null, 2));
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update socials' });
    }
});

// Blog endpoints
app.get('/api/blogs', async (req, res) => {
    try {
        const blogs = JSON.parse(await fs.readFile(BLOGS_FILE, 'utf8'));
        res.json(blogs);
    } catch (error) {
        res.status(500).json({ error: 'Failed to load blogs' });
    }
});

app.get('/api/blogs/:slug', async (req, res) => {
    try {
        const blogs = JSON.parse(await fs.readFile(BLOGS_FILE, 'utf8'));
        const blog = blogs.find(b => b.slug === req.params.slug);
        if (!blog) {
            return res.status(404).json({ error: 'Blog not found' });
        }
        res.json(blog);
    } catch (error) {
        res.status(500).json({ error: 'Failed to load blog' });
    }
});

app.post('/api/blogs', authenticateToken, async (req, res) => {
    try {
        const blogs = JSON.parse(await fs.readFile(BLOGS_FILE, 'utf8'));
        const newBlog = {
            ...req.body,
            id: Date.now().toString(),
            date: new Date().toISOString()
        };
        blogs.push(newBlog);
        await fs.writeFile(BLOGS_FILE, JSON.stringify(blogs, null, 2));
        res.json(newBlog);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create blog' });
    }
});

app.put('/api/blogs/:id', authenticateToken, async (req, res) => {
    try {
        const blogs = JSON.parse(await fs.readFile(BLOGS_FILE, 'utf8'));
        const index = blogs.findIndex(b => b.id === req.params.id);
        if (index === -1) {
            return res.status(404).json({ error: 'Blog not found' });
        }
        blogs[index] = { ...blogs[index], ...req.body };
        await fs.writeFile(BLOGS_FILE, JSON.stringify(blogs, null, 2));
        res.json(blogs[index]);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update blog' });
    }
});

app.delete('/api/blogs/:id', authenticateToken, async (req, res) => {
    try {
        const blogs = JSON.parse(await fs.readFile(BLOGS_FILE, 'utf8'));
        const filtered = blogs.filter(b => b.id !== req.params.id);
        await fs.writeFile(BLOGS_FILE, JSON.stringify(filtered, null, 2));
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete blog' });
    }
});

// Project endpoints
app.get('/api/projects', async (req, res) => {
    try {
        const projects = JSON.parse(await fs.readFile(PROJECTS_FILE, 'utf8'));
        res.json(projects);
    } catch (error) {
        res.status(500).json({ error: 'Failed to load projects' });
    }
});

app.post('/api/projects', authenticateToken, async (req, res) => {
    try {
        const projects = JSON.parse(await fs.readFile(PROJECTS_FILE, 'utf8'));
        const newProject = {
            ...req.body,
            id: Date.now().toString()
        };
        projects.push(newProject);
        await fs.writeFile(PROJECTS_FILE, JSON.stringify(projects, null, 2));
        res.json(newProject);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create project' });
    }
});

app.put('/api/projects/:id', authenticateToken, async (req, res) => {
    try {
        const projects = JSON.parse(await fs.readFile(PROJECTS_FILE, 'utf8'));
        const index = projects.findIndex(p => p.id === req.params.id);
        if (index === -1) {
            return res.status(404).json({ error: 'Project not found' });
        }
        projects[index] = { ...projects[index], ...req.body };
        await fs.writeFile(PROJECTS_FILE, JSON.stringify(projects, null, 2));
        res.json(projects[index]);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update project' });
    }
});

app.delete('/api/projects/:id', authenticateToken, async (req, res) => {
    try {
        const projects = JSON.parse(await fs.readFile(PROJECTS_FILE, 'utf8'));
        const filtered = projects.filter(p => p.id !== req.params.id);
        await fs.writeFile(PROJECTS_FILE, JSON.stringify(filtered, null, 2));
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete project' });
    }
});

// Resource endpoints
app.get('/api/resources', async (req, res) => {
    try {
        const resources = JSON.parse(await fs.readFile(RESOURCES_FILE, 'utf8'));
        res.json(resources);
    } catch (error) {
        res.status(500).json({ error: 'Failed to load resources' });
    }
});

app.post('/api/resources', authenticateToken, async (req, res) => {
    try {
        const resources = JSON.parse(await fs.readFile(RESOURCES_FILE, 'utf8'));
        const newResource = {
            ...req.body,
            id: Date.now().toString()
        };
        resources.push(newResource);
        await fs.writeFile(RESOURCES_FILE, JSON.stringify(resources, null, 2));
        res.json(newResource);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create resource' });
    }
});

app.get('/api/resources/:id', async (req, res) => {
    try {
        const resources = JSON.parse(await fs.readFile(RESOURCES_FILE, 'utf8'));
        const resource = resources.find(r => r.id === req.params.id);
        if (!resource) {
            return res.status(404).json({ error: 'Resource not found' });
        }
        res.json(resource);
    } catch (error) {
        res.status(500).json({ error: 'Failed to load resource' });
    }
});

app.put('/api/resources/:id', authenticateToken, async (req, res) => {
    try {
        const resources = JSON.parse(await fs.readFile(RESOURCES_FILE, 'utf8'));
        const index = resources.findIndex(r => r.id === req.params.id);
        if (index === -1) {
            return res.status(404).json({ error: 'Resource not found' });
        }
        resources[index] = { ...resources[index], ...req.body };
        await fs.writeFile(RESOURCES_FILE, JSON.stringify(resources, null, 2));
        res.json(resources[index]);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update resource' });
    }
});

app.delete('/api/resources/:id', authenticateToken, async (req, res) => {
    try {
        const resources = JSON.parse(await fs.readFile(RESOURCES_FILE, 'utf8'));
        const filtered = resources.filter(r => r.id !== req.params.id);
        await fs.writeFile(RESOURCES_FILE, JSON.stringify(filtered, null, 2));
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete resource' });
    }
});

// Message endpoints
app.get('/api/messages', authenticateToken, async (req, res) => {
    try {
        const messages = JSON.parse(await fs.readFile(MESSAGES_FILE, 'utf8'));
        res.json(messages);
    } catch (error) {
        res.status(500).json({ error: 'Failed to load messages' });
    }
});

app.post('/api/messages', async (req, res) => {
    try {
        const messages = JSON.parse(await fs.readFile(MESSAGES_FILE, 'utf8'));
        const newMessage = {
            ...req.body,
            id: Date.now().toString(),
            date: new Date().toISOString(),
            read: false
        };
        messages.push(newMessage);
        await fs.writeFile(MESSAGES_FILE, JSON.stringify(messages, null, 2));
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Failed to save message' });
    }
});

app.delete('/api/messages/:id', authenticateToken, async (req, res) => {
    try {
        const messages = JSON.parse(await fs.readFile(MESSAGES_FILE, 'utf8'));
        const filtered = messages.filter(m => m.id !== req.params.id);
        await fs.writeFile(MESSAGES_FILE, JSON.stringify(filtered, null, 2));
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete message' });
    }
});

// Export all data
app.get('/api/export', authenticateToken, async (req, res) => {
    try {
        const data = {
            profile: JSON.parse(await fs.readFile(PROFILE_FILE, 'utf8')),
            socials: JSON.parse(await fs.readFile(SOCIALS_FILE, 'utf8')),
            blogs: JSON.parse(await fs.readFile(BLOGS_FILE, 'utf8')),
            projects: JSON.parse(await fs.readFile(PROJECTS_FILE, 'utf8')),
            resources: JSON.parse(await fs.readFile(RESOURCES_FILE, 'utf8')),
            messages: JSON.parse(await fs.readFile(MESSAGES_FILE, 'utf8'))
        };
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: 'Failed to export data' });
    }
});

// Import all data
app.post('/api/import', authenticateToken, async (req, res) => {
    try {
        const { profile, socials, blogs, projects, resources, messages } = req.body;
        
        if (profile) await fs.writeFile(PROFILE_FILE, JSON.stringify(profile, null, 2));
        if (socials) await fs.writeFile(SOCIALS_FILE, JSON.stringify(socials, null, 2));
        if (blogs) await fs.writeFile(BLOGS_FILE, JSON.stringify(blogs, null, 2));
        if (projects) await fs.writeFile(PROJECTS_FILE, JSON.stringify(projects, null, 2));
        if (resources) await fs.writeFile(RESOURCES_FILE, JSON.stringify(resources, null, 2));
        if (messages) await fs.writeFile(MESSAGES_FILE, JSON.stringify(messages, null, 2));
        
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Failed to import data' });
    }
});

// Clean URL routes to serve HTML without .html and support slugs
app.get(['/blog', '/blog/:slug'], (req, res) => {
    res.sendFile(path.join(__dirname, 'blog.html'));
});

app.get(['/resources', '/resources/:id'], (req, res) => {
    res.sendFile(path.join(__dirname, 'resources.html'));
});

// Start server
initializeData().then(() => {
    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
    });
});