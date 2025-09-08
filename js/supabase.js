// Supabase Configuration
// NOTE: Update these with your actual Supabase project details
const SUPABASE_URL = 'https://dwbdpleelicqwhydzylr.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR3YmRwbGVlbGljcXdoeWR6eWxyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTczMjc4MTUsImV4cCI6MjA3MjkwMzgxNX0.hqlIpI92OIioZRLV6kAPMtfpSPinNIP4i1t5ImtOVOo';

// Initialize Supabase client with better error handling
let supabaseClient = null;
let connectionStatus = 'initializing';
let connectionError = null;

// Function to initialize Supabase client
async function initializeSupabase() {
    try {
        if (typeof window !== 'undefined' && window.supabase) {
            console.log('Initializing Supabase client...');
            supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
            
            // Test the connection
            const { data, error } = await supabaseClient.from('profiles').select('count').limit(1);
            
            if (error && error.message.includes('relation') === false) {
                // If error is not about missing table, it's a connection issue
                throw new Error(`Supabase connection failed: ${error.message}`);
            }
            
            connectionStatus = 'connected';
            console.log('✅ Supabase connected successfully');
            return true;
        } else {
            throw new Error('Supabase SDK not loaded');
        }
    } catch (error) {
        connectionStatus = 'disconnected';
        connectionError = error.message;
        console.warn('⚠️ Supabase connection failed, using localStorage fallback:', error.message);
        console.log('💡 To fix: Update SUPABASE_URL and SUPABASE_ANON_KEY in js/supabase.js');
        return false;
    }
}

// Initialize on load
if (typeof window !== 'undefined') {
    if (window.supabase) {
        initializeSupabase();
    } else {
        // Wait for SDK to load
        window.addEventListener('load', () => {
            setTimeout(initializeSupabase, 100);
        });
    }
}

// localStorage fallback helper
const localStorageDB = {
    getItem(key) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : null;
        } catch {
            return null;
        }
    },
    setItem(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch {
            return false;
        }
    }
};

// Helper function to check connection
function isSupabaseConnected() {
    return supabaseClient && connectionStatus === 'connected';
}

// Function to get connection status
function getConnectionStatus() {
    return {
        status: connectionStatus,
        error: connectionError,
        usingFallback: !isSupabaseConnected()
    };
}

// Database helper functions with localStorage fallback
const db = {
    // Connection status
    getConnectionStatus,
    initializeSupabase,
    // Profile operations
    async getProfile() {
        try {
            if (supabaseClient && connectionStatus === 'connected') {
                const { data, error } = await supabaseClient
                    .from('profiles')
                    .select('*')
                    .single();
                if (error) throw error;
                return { data, error };
            } else {
                throw new Error('Supabase not connected');
            }
        } catch (error) {
            // Fallback to localStorage
            console.log('Using localStorage for profile (Supabase unavailable)');
            const data = localStorageDB.getItem('profile') || {};
            return { data, error: null };
        }
    },

    async updateProfile(profile) {
        try {
            if (!supabaseClient) throw new Error('Supabase not available');
            const { data, error } = await supabaseClient
                .from('profiles')
                .upsert(profile)
                .select()
                .single();
            if (error) throw error;
            return { data, error };
        } catch (error) {
            // Fallback to localStorage
            localStorageDB.setItem('profile', profile);
            return { data: profile, error: null };
        }
    },

    // Social links operations
    async getSocials() {
        try {
            if (!supabaseClient) throw new Error('Supabase not available');
            const { data, error } = await supabaseClient
                .from('social_links')
                .select('*')
                .order('order_index', { ascending: true });
            if (error) throw error;
            return { data, error };
        } catch (error) {
            // Fallback to localStorage
            const data = localStorageDB.getItem('socials') || [];
            return { data, error: null };
        }
    },

    async updateSocials(socials) {
        try {
            if (!supabaseClient) throw new Error('Supabase not available');
            // Delete existing and insert new
            await supabaseClient.from('social_links').delete().neq('id', 0);
            
            const socialsWithOrder = socials.map((social, index) => ({
                ...social,
                order_index: index
            }));
            
            const { data, error } = await supabaseClient
                .from('social_links')
                .insert(socialsWithOrder)
                .select();
            if (error) throw error;
            return { data, error };
        } catch (error) {
            // Fallback to localStorage
            const socialsWithOrder = socials.map((social, index) => ({
                ...social,
                order_index: index,
                id: social.id || Date.now().toString() + index
            }));
            localStorageDB.setItem('socials', socialsWithOrder);
            return { data: socialsWithOrder, error: null };
        }
    },

    // Blog operations
    async getBlogs() {
        try {
            const { data, error } = await supabaseClient
                .from('blogs')
                .select('*')
                .order('created_at', { ascending: false });
            if (error) throw error;
            return { data, error };
        } catch (error) {
            // Fallback to localStorage
            const data = localStorageDB.getItem('blogs') || [];
            // Sort by created_at descending
            data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
            return { data, error: null };
        }
    },

    async getBlog(slug) {
        try {
            if (!supabaseClient) throw new Error('Supabase not available');
            const { data, error } = await supabaseClient
                .from('blogs')
                .select('*')
                .eq('slug', slug)
                .single();
            if (error) throw error;
            return { data, error };
        } catch (error) {
            // Fallback to localStorage
            const blogs = localStorageDB.getItem('blogs') || [];
            const data = blogs.find(b => b.slug === slug);
            return { data, error: data ? null : new Error('Blog not found') };
        }
    },

    async createBlog(blog) {
        try {
            if (isSupabaseConnected()) {
                const { data, error } = await supabaseClient
                    .from('blogs')
                    .insert(blog)
                    .select()
                    .single();
                if (error) throw error;
                console.log('✅ Blog saved to Supabase');
                return { data, error };
            } else {
                throw new Error('Supabase not connected');
            }
        } catch (error) {
            // Fallback to localStorage
            console.log('💾 Saving blog to localStorage (Supabase unavailable)');
            const blogs = localStorageDB.getItem('blogs') || [];
            const newBlog = { ...blog, id: Date.now().toString(), created_at: new Date().toISOString() };
            blogs.push(newBlog);
            localStorageDB.setItem('blogs', blogs);
            return { data: newBlog, error: null };
        }
    },

    async updateBlog(id, blog) {
        try {
            if (!supabaseClient) throw new Error('Supabase not available');
            const { data, error } = await supabaseClient
                .from('blogs')
                .update(blog)
                .eq('id', id)
                .select()
                .single();
            if (error) throw error;
            return { data, error };
        } catch (error) {
            // Fallback to localStorage
            const blogs = localStorageDB.getItem('blogs') || [];
            const index = blogs.findIndex(b => b.id === id);
            if (index !== -1) {
                blogs[index] = { ...blogs[index], ...blog };
                localStorageDB.setItem('blogs', blogs);
                return { data: blogs[index], error: null };
            }
            return { data: null, error: new Error('Blog not found') };
        }
    },

    async deleteBlog(id) {
        try {
            if (!supabaseClient) throw new Error('Supabase not available');
            const { error } = await supabaseClient
                .from('blogs')
                .delete()
                .eq('id', id);
            if (error) throw error;
            return { error };
        } catch (error) {
            // Fallback to localStorage
            const blogs = localStorageDB.getItem('blogs') || [];
            const filteredBlogs = blogs.filter(b => b.id !== id);
            localStorageDB.setItem('blogs', filteredBlogs);
            return { error: null };
        }
    },

    // Project operations
    async getProjects() {
        try {
            if (!supabaseClient) throw new Error('Supabase not available');
            const { data, error } = await supabaseClient
                .from('projects')
                .select('*')
                .order('created_at', { ascending: false });
            if (error) throw error;
            return { data, error };
        } catch (error) {
            // Fallback to localStorage
            const data = localStorageDB.getItem('projects') || [];
            data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
            return { data, error: null };
        }
    },

    async createProject(project) {
        try {
            if (!supabaseClient) throw new Error('Supabase not available');
            const { data, error } = await supabaseClient
                .from('projects')
                .insert(project)
                .select()
                .single();
            if (error) throw error;
            return { data, error };
        } catch (error) {
            // Fallback to localStorage
            const projects = localStorageDB.getItem('projects') || [];
            const newProject = { ...project, id: Date.now().toString(), created_at: new Date().toISOString() };
            projects.push(newProject);
            localStorageDB.setItem('projects', projects);
            return { data: newProject, error: null };
        }
    },

    async updateProject(id, project) {
        try {
            if (!supabaseClient) throw new Error('Supabase not available');
            const { data, error } = await supabaseClient
                .from('projects')
                .update(project)
                .eq('id', id)
                .select()
                .single();
            if (error) throw error;
            return { data, error };
        } catch (error) {
            // Fallback to localStorage
            const projects = localStorageDB.getItem('projects') || [];
            const index = projects.findIndex(p => p.id === id);
            if (index !== -1) {
                projects[index] = { ...projects[index], ...project };
                localStorageDB.setItem('projects', projects);
                return { data: projects[index], error: null };
            }
            return { data: null, error: new Error('Project not found') };
        }
    },

    async deleteProject(id) {
        try {
            if (!supabaseClient) throw new Error('Supabase not available');
            const { error } = await supabaseClient
                .from('projects')
                .delete()
                .eq('id', id);
            if (error) throw error;
            return { error };
        } catch (error) {
            // Fallback to localStorage
            const projects = localStorageDB.getItem('projects') || [];
            const filteredProjects = projects.filter(p => p.id !== id);
            localStorageDB.setItem('projects', filteredProjects);
            return { error: null };
        }
    },

    // Resource operations
    async getResources() {
        try {
            if (!supabaseClient) throw new Error('Supabase not available');
            const { data, error } = await supabaseClient
                .from('resources')
                .select('*')
                .order('created_at', { ascending: false });
            if (error) throw error;
            return { data, error };
        } catch (error) {
            // Fallback to localStorage
            const data = localStorageDB.getItem('resources') || [];
            data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
            return { data, error: null };
        }
    },

    async createResource(resource) {
        try {
            if (isSupabaseConnected()) {
                // Filter to only include columns that exist in the database schema
                // Remove any fields like tags, metadata, etc. that don't exist
                const validResource = {
                    name: resource.name || resource.title || 'Untitled Resource',
                    category: resource.category || 'other',
                    url: resource.url || '',
                    description: resource.description || '',
                    featured: resource.featured === true
                };
                
                // Ensure no invalid fields are sent
                const cleanResource = Object.fromEntries(
                    Object.entries(validResource).filter(([key]) => 
                        ['name', 'category', 'url', 'description', 'featured'].includes(key)
                    )
                );
                
                const { data, error } = await supabaseClient
                    .from('resources')
                    .insert(cleanResource)
                    .select()
                    .single();
                if (error) throw error;
                console.log('✅ Resource saved to Supabase');
                return { data, error };
            } else {
                throw new Error('Supabase not connected');
            }
        } catch (error) {
            // Fallback to localStorage
            console.log('💾 Saving resource to localStorage (Supabase unavailable)');
            const resources = localStorageDB.getItem('resources') || [];
            const newResource = { ...resource, id: Date.now().toString(), created_at: new Date().toISOString() };
            resources.push(newResource);
            localStorageDB.setItem('resources', resources);
            return { data: newResource, error: null };
        }
    },

    async updateResource(id, resource) {
        try {
            if (!supabaseClient) throw new Error('Supabase not available');
            
            // Filter to only include columns that exist in the database schema
            // Remove any fields like tags, metadata, etc. that don't exist
            const validResource = {
                name: resource.name || resource.title || 'Untitled Resource',
                category: resource.category || 'other',
                url: resource.url || '',
                description: resource.description || '',
                featured: resource.featured === true
            };
            
            // Ensure no invalid fields are sent
            const cleanResource = Object.fromEntries(
                Object.entries(validResource).filter(([key]) => 
                    ['name', 'category', 'url', 'description', 'featured'].includes(key)
                )
            );
            
            const { data, error } = await supabaseClient
                .from('resources')
                .update(cleanResource)
                .eq('id', id)
                .select()
                .single();
            if (error) throw error;
            return { data, error };
        } catch (error) {
            // Fallback to localStorage
            const resources = localStorageDB.getItem('resources') || [];
            const index = resources.findIndex(r => r.id === id);
            if (index !== -1) {
                resources[index] = { ...resources[index], ...resource };
                localStorageDB.setItem('resources', resources);
                return { data: resources[index], error: null };
            }
            return { data: null, error: new Error('Resource not found') };
        }
    },

    async deleteResource(id) {
        try {
            if (!supabaseClient) throw new Error('Supabase not available');
            const { error } = await supabaseClient
                .from('resources')
                .delete()
                .eq('id', id);
            if (error) throw error;
            return { error };
        } catch (error) {
            // Fallback to localStorage
            const resources = localStorageDB.getItem('resources') || [];
            const filteredResources = resources.filter(r => r.id !== id);
            localStorageDB.setItem('resources', filteredResources);
            return { error: null };
        }
    },

    // Message operations
    async getMessages() {
        try {
            if (!supabaseClient) throw new Error('Supabase not available');
            const { data, error } = await supabaseClient
                .from('messages')
                .select('*')
                .order('created_at', { ascending: false });
            if (error) throw error;
            return { data, error };
        } catch (error) {
            // Fallback to localStorage
            const data = localStorageDB.getItem('messages') || [];
            data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
            return { data, error: null };
        }
    },

    async createMessage(message) {
        try {
            if (!supabaseClient) throw new Error('Supabase not available');
            const { data, error } = await supabaseClient
                .from('messages')
                .insert(message)
                .select()
                .single();
            if (error) throw error;
            return { data, error };
        } catch (error) {
            // Fallback to localStorage
            const messages = localStorageDB.getItem('messages') || [];
            const newMessage = { ...message, id: Date.now().toString(), created_at: new Date().toISOString() };
            messages.push(newMessage);
            localStorageDB.setItem('messages', messages);
            return { data: newMessage, error: null };
        }
    },

    async deleteMessage(id) {
        try {
            if (!supabaseClient) throw new Error('Supabase not available');
            const { error } = await supabaseClient
                .from('messages')
                .delete()
                .eq('id', id);
            if (error) throw error;
            return { error };
        } catch (error) {
            // Fallback to localStorage
            const messages = localStorageDB.getItem('messages') || [];
            const filteredMessages = messages.filter(m => m.id !== id);
            localStorageDB.setItem('messages', filteredMessages);
            return { error: null };
        }
    },

    // Auth operations
    async signIn(email, password) {
        try {
            if (!supabaseClient) throw new Error('Supabase not available');
            const { data, error } = await supabaseClient.auth.signInWithPassword({
                email,
                password
            });
            if (error) throw error;
            return { data, error };
        } catch (error) {
            // Fallback to localStorage auth
            const storedPassword = localStorage.getItem('admin_password');
            if (storedPassword && storedPassword === password && email === 'admin@karthiknagapuri.com') {
                const sessionData = {
                    user: { email, id: 'local-user' },
                    session: { access_token: 'local-token', expires_at: Date.now() + 3600000 }
                };
                localStorage.setItem('auth_session', JSON.stringify(sessionData));
                return { data: sessionData, error: null };
            }
            return { data: null, error: new Error('Invalid credentials') };
        }
    },

    async signOut() {
        try {
            if (!supabaseClient) throw new Error('Supabase not available');
            const { error } = await supabaseClient.auth.signOut();
            if (error) throw error;
            return { error };
        } catch (error) {
            // Fallback to localStorage
            localStorage.removeItem('auth_session');
            return { error: null };
        }
    },

    async getSession() {
        try {
            if (!supabaseClient) throw new Error('Supabase not available');
            const { data, error } = await supabaseClient.auth.getSession();
            if (error) throw error;
            return { data: data?.session, error };
        } catch (error) {
            // Fallback to localStorage
            const sessionStr = localStorage.getItem('auth_session');
            if (sessionStr) {
                const session = JSON.parse(sessionStr);
                if (session.session.expires_at > Date.now()) {
                    return { data: session.session, error: null };
                }
                localStorage.removeItem('auth_session');
            }
            return { data: null, error: null };
        }
    },

    async updatePassword(newPassword) {
        try {
            if (!supabaseClient) throw new Error('Supabase not available');
            const { data, error } = await supabaseClient.auth.updateUser({
                password: newPassword
            });
            if (error) throw error;
            return { data, error };
        } catch (error) {
            // Fallback to localStorage
            localStorage.setItem('admin_password', newPassword);
            return { data: { user: { email: 'admin@karthiknagapuri.com' } }, error: null };
        }
    }
};

// Export for use in other files
window.db = db;
window.supabaseClient = supabaseClient;