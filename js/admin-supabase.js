// Admin Panel with Supabase Integration
let isLoggedIn = false;

// Admin credentials (for demo, using hardcoded auth)
const ADMIN_EMAIL = 'admin@zero.dev';
const DEFAULT_ADMIN_PASSWORD = 'zero@admin2024';

// Check if user is logged in
async function checkLoginStatus() {
    const { data: session } = await db.getSession();
    if (session) {
        isLoggedIn = true;
        showAdminDashboard();
        return true;
    }
    return false;
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', async () => {
    // Check login status
    const loggedIn = await checkLoginStatus();
    
    if (!loggedIn) {
        showLoginForm();
    }
    
    // Setup event listeners
    setupEventListeners();
});

function showLoginForm() {
    document.getElementById('login-section').style.display = 'flex';
    document.getElementById('admin-dashboard').style.display = 'none';
    document.getElementById('admin-status').textContent = '';
    document.getElementById('logout-btn').style.display = 'none';
}

function showAdminDashboard() {
    document.getElementById('login-section').style.display = 'none';
    document.getElementById('admin-dashboard').style.display = 'block';
    document.getElementById('admin-status').textContent = '✅ Admin';
    document.getElementById('logout-btn').style.display = 'block';
    
    // Show connection status
    updateConnectionStatus();
    
    // Load initial data
    loadProfileData();
    loadSocialLinks();
}

// Function to update connection status display
async function updateConnectionStatus() {
    const statusDiv = document.getElementById('connection-status');
    const statusIcon = document.getElementById('status-icon');
    const statusText = document.getElementById('status-text');
    const retryBtn = document.getElementById('retry-connection');
    
    if (!statusDiv) return;
    
    // Get connection status
    const status = db.getConnectionStatus();
    
    if (status.status === 'connected') {
        statusDiv.style.background = '#0f01';
        statusDiv.style.border = '1px solid #0f0';
        statusIcon.textContent = '✅ ';
        statusText.textContent = 'Connected to Supabase backend';
        retryBtn.style.display = 'none';
    } else if (status.status === 'initializing') {
        statusDiv.style.background = '#ff01';
        statusDiv.style.border = '1px solid #ff0';
        statusIcon.textContent = '⏳ ';
        statusText.textContent = 'Initializing connection...';
        retryBtn.style.display = 'none';
        // Check again in a second
        setTimeout(updateConnectionStatus, 1000);
    } else {
        statusDiv.style.background = '#f001';
        statusDiv.style.border = '1px solid #f00';
        statusIcon.textContent = '⚠️ ';
        statusText.textContent = `Using localStorage fallback (${status.error || 'Supabase unavailable'})`;
        retryBtn.style.display = 'inline-block';
    }
}

function setupEventListeners() {
    // Login form
    document.getElementById('login-form').addEventListener('submit', handleLogin);
    
    // Retry connection button
    const retryBtn = document.getElementById('retry-connection');
    if (retryBtn) {
        retryBtn.addEventListener('click', async () => {
            retryBtn.disabled = true;
            retryBtn.textContent = 'Retrying...';
            
            // Try to reconnect
            const connected = await db.initializeSupabase();
            
            // Update status display
            updateConnectionStatus();
            
            retryBtn.disabled = false;
            retryBtn.textContent = 'Retry Connection';
            
            if (connected) {
                showSuccessMessage('Successfully connected to Supabase!');
                // Reload data from backend
                loadProfileData();
                loadSocialLinks();
                loadBlogs();
                loadResources();
            }
        });
    }
    
    // Logout button
    document.getElementById('logout-btn').addEventListener('click', handleLogout);
    
    // Tab navigation
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            switchTab(e.target.dataset.tab);
        });
    });
    
    // Form submissions
    document.getElementById('profile-form').addEventListener('submit', handleProfileUpdate);
    document.getElementById('socials-form').addEventListener('submit', handleSocialsUpdate);
    document.getElementById('blog-form').addEventListener('submit', handleBlogSubmit);
    document.getElementById('project-form').addEventListener('submit', handleProjectSubmit);
    document.getElementById('resource-form').addEventListener('submit', handleResourceSubmit);
    document.getElementById('settings-form').addEventListener('submit', handlePasswordChange);
    
    // Add buttons
    document.getElementById('add-social-btn').addEventListener('click', addSocialLink);
    document.getElementById('new-blog-btn').addEventListener('click', showBlogEditor);
    document.getElementById('new-project-btn').addEventListener('click', showProjectEditor);
    document.getElementById('new-resource-btn').addEventListener('click', showResourceEditor);
    
    // Cancel buttons
    document.getElementById('cancel-blog-btn').addEventListener('click', hideBlogEditor);
    document.getElementById('cancel-project-btn').addEventListener('click', hideProjectEditor);
    document.getElementById('cancel-resource-btn').addEventListener('click', hideResourceEditor);
    
    // Export/Import
    document.getElementById('export-data-btn').addEventListener('click', exportData);
    document.getElementById('import-data-btn').addEventListener('click', () => {
        document.getElementById('import-file').click();
    });
    document.getElementById('import-file').addEventListener('change', handleImport);
    
    // Clear cache
    document.getElementById('clear-cache-btn').addEventListener('click', clearCache);
}

// Authentication handlers
async function handleLogin(e) {
    e.preventDefault();
    const password = document.getElementById('admin-password').value;
    
    // Check against stored password first, then default
    const storedPassword = localStorage.getItem('adminPassword');
    let isValidPassword = false;
    
    if (storedPassword) {
        // Check against stored password (decode the simple encoding)
        try {
            const decodedPassword = atob(storedPassword);
            isValidPassword = (password === decodedPassword);
        } catch {
            isValidPassword = false;
        }
    }
    
    // Fallback to default password
    if (!isValidPassword) {
        isValidPassword = (password === DEFAULT_ADMIN_PASSWORD);
    }
    
    if (isValidPassword) {
        // Create a mock session
        isLoggedIn = true;
        showAdminDashboard();
        document.getElementById('login-error').textContent = '';
        document.getElementById('admin-password').value = '';
    } else {
        document.getElementById('login-error').textContent = 'Invalid password';
    }
}

async function handleLogout() {
    await db.signOut();
    isLoggedIn = false;
    showLoginForm();
}

// Tab switching
function switchTab(tabName) {
    // Update active tab button
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
    
    // Show corresponding panel
    document.querySelectorAll('.tab-panel').forEach(panel => {
        panel.classList.remove('active');
    });
    document.getElementById(`${tabName}-tab`).classList.add('active');
    
    // Load data for the tab
    switch(tabName) {
        case 'profile':
            loadProfileData();
            break;
        case 'socials':
            loadSocialLinks();
            break;
        case 'blogs':
            loadBlogs();
            break;
        case 'projects':
            loadProjects();
            break;
        case 'resources':
            loadResources();
            break;
        case 'messages':
            loadMessages();
            break;
    }
}

// Profile management
async function loadProfileData() {
    const { data: profile, error } = await db.getProfile();
    
    if (profile) {
        document.querySelector('[name="name"]').value = profile.name || '';
        document.querySelector('[name="title"]').value = profile.title || '';
        document.querySelector('[name="email"]').value = profile.email || '';
        document.querySelector('[name="phone"]').value = profile.phone || '';
        document.querySelector('[name="location"]').value = profile.location || '';
        document.querySelector('[name="bio"]').value = profile.bio || '';
    }
}

async function handleProfileUpdate(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const profile = Object.fromEntries(formData);
    
    const { error } = await db.updateProfile(profile);
    
    if (!error) {
        showSuccessMessage('Profile updated successfully!');
    } else {
        console.error('Error updating profile:', error);
    }
}

// Social links management
async function loadSocialLinks() {
    const { data: socials, error } = await db.getSocials();
    const container = document.getElementById('social-links-container');
    container.innerHTML = '';
    
    if (socials && socials.length > 0) {
        socials.forEach((social, index) => {
            addSocialLinkElement(social.platform, social.url, index);
        });
    } else {
        // Add default empty social link
        addSocialLinkElement('', '', 0);
    }
}

function addSocialLink() {
    const container = document.getElementById('social-links-container');
    const index = container.children.length;
    addSocialLinkElement('', '', index);
}

function addSocialLinkElement(platform, url, index) {
    const container = document.getElementById('social-links-container');
    const linkDiv = document.createElement('div');
    linkDiv.className = 'social-link-item';
    linkDiv.innerHTML = `
        <input type="text" name="platform_${index}" placeholder="Platform" value="${platform}" required>
        <input type="url" name="url_${index}" placeholder="URL" value="${url}" required>
        <button type="button" class="remove-btn" onclick="this.parentElement.remove()">Remove</button>
    `;
    container.appendChild(linkDiv);
}

async function handleSocialsUpdate(e) {
    e.preventDefault();
    const container = document.getElementById('social-links-container');
    const socials = [];
    
    container.querySelectorAll('.social-link-item').forEach((item, index) => {
        const platform = item.querySelector(`[name="platform_${index}"]`).value;
        const url = item.querySelector(`[name="url_${index}"]`).value;
        if (platform && url) {
            socials.push({ platform, url });
        }
    });
    
    const { error } = await db.updateSocials(socials);
    
    if (!error) {
        showSuccessMessage('Social links updated successfully!');
    } else {
        console.error('Error updating social links:', error);
    }
}

// Blog management
async function loadBlogs() {
    const { data: blogs, error } = await db.getBlogs();
    const listContainer = document.getElementById('blogs-list');
    listContainer.innerHTML = '';
    
    if (blogs && blogs.length > 0) {
        blogs.forEach(blog => {
            const blogCard = document.createElement('div');
            blogCard.className = 'item-card';
            blogCard.innerHTML = `
                <div class="item-header">
                    <div>
                        <h3 class="item-title">${blog.title}</h3>
                        <div class="item-meta">
                            ${new Date(blog.created_at).toLocaleDateString()} · ${blog.read_time || 5} min read
                            ${blog.published ? ' · Published' : ' · Draft'}
                        </div>
                        <p>${blog.excerpt || ''}</p>
                    </div>
                    <div class="item-actions">
                        <button class="edit-btn" onclick="editBlog('${blog.id}')">Edit</button>
                        <button class="delete-btn" onclick="deleteBlog('${blog.id}')">Delete</button>
                    </div>
                </div>
            `;
            listContainer.appendChild(blogCard);
        });
    } else {
        listContainer.innerHTML = '<p style="color: var(--text-secondary);">No blog posts yet.</p>';
    }
}

function showBlogEditor(blog = null) {
    document.getElementById('blog-editor').style.display = 'block';
    document.getElementById('blogs-list').style.display = 'none';
    
    if (blog) {
        document.querySelector('#blog-form [name="title"]').value = blog.title || '';
        document.querySelector('#blog-form [name="slug"]').value = blog.slug || '';
        document.querySelector('#blog-form [name="excerpt"]').value = blog.excerpt || '';
        document.querySelector('#blog-form [name="content"]').value = blog.content || '';
        document.querySelector('#blog-form [name="tags"]').value = blog.tags ? blog.tags.join(', ') : '';
        document.querySelector('#blog-form [name="readTime"]').value = blog.read_time || 5;
        document.getElementById('blog-form').dataset.blogId = blog.id;
    } else {
        document.getElementById('blog-form').reset();
        delete document.getElementById('blog-form').dataset.blogId;
    }
}

function hideBlogEditor() {
    document.getElementById('blog-editor').style.display = 'none';
    document.getElementById('blogs-list').style.display = 'block';
}

async function handleBlogSubmit(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const blogData = {
        title: formData.get('title'),
        slug: formData.get('slug'),
        excerpt: formData.get('excerpt'),
        content: formData.get('content'),
        tags: formData.get('tags').split(',').map(tag => tag.trim()).filter(Boolean),
        read_time: parseInt(formData.get('readTime')),
        published: true
    };
    
    const blogId = e.target.dataset.blogId;
    let result;
    
    if (blogId) {
        result = await db.updateBlog(blogId, blogData);
    } else {
        result = await db.createBlog(blogData);
    }
    
    if (!result.error) {
        showSuccessMessage('Blog saved successfully!');
        hideBlogEditor();
        loadBlogs();
    } else {
        console.error('Error saving blog:', result.error);
        showErrorMessage('Failed to save blog: ' + (result.error.message || result.error));
    }
}

window.editBlog = async function(id) {
    const { data: blogs, error } = await db.getBlogs();
    
    if (error) {
        console.error('Error loading blogs:', error);
        showErrorMessage('Failed to load blogs: ' + (error.message || error));
        return;
    }
    
    const blog = blogs ? blogs.find(b => b.id === id) : null;
    if (blog) {
        showBlogEditor(blog);
    } else {
        console.error('Blog not found with ID:', id);
        showErrorMessage('Blog not found. It may have been deleted.');
    }
};

window.deleteBlog = async function(id) {
    if (confirm('Are you sure you want to delete this blog post?')) {
        const { error } = await db.deleteBlog(id);
        if (!error) {
            showSuccessMessage('Blog deleted successfully!');
            loadBlogs();
        }
    }
};

// Project management
async function loadProjects() {
    const { data: projects, error } = await db.getProjects();
    const listContainer = document.getElementById('projects-list');
    listContainer.innerHTML = '';
    
    if (projects && projects.length > 0) {
        projects.forEach(project => {
            const projectCard = document.createElement('div');
            projectCard.className = 'item-card';
            projectCard.innerHTML = `
                <div class="item-header">
                    <div>
                        <h3 class="item-title">${project.name}</h3>
                        <div class="item-meta">Status: ${project.status || 'active'}</div>
                        <p>${project.description || ''}</p>
                    </div>
                    <div class="item-actions">
                        <button class="edit-btn" onclick="editProject('${project.id}')">Edit</button>
                        <button class="delete-btn" onclick="deleteProject('${project.id}')">Delete</button>
                    </div>
                </div>
            `;
            listContainer.appendChild(projectCard);
        });
    } else {
        listContainer.innerHTML = '<p style="color: var(--text-secondary);">No projects yet.</p>';
    }
}

function showProjectEditor(project = null) {
    document.getElementById('project-editor').style.display = 'block';
    document.getElementById('projects-list').style.display = 'none';
    
    if (project) {
        document.querySelector('#project-form [name="name"]').value = project.name || '';
        document.querySelector('#project-form [name="description"]').value = project.description || '';
        document.querySelector('#project-form [name="techStack"]').value = project.tech_stack ? project.tech_stack.join(', ') : '';
        document.querySelector('#project-form [name="url"]').value = project.url || '';
        document.querySelector('#project-form [name="github"]').value = project.github_url || '';
        document.querySelector('#project-form [name="status"]').value = project.status || 'active';
        document.getElementById('project-form').dataset.projectId = project.id;
    } else {
        document.getElementById('project-form').reset();
        delete document.getElementById('project-form').dataset.projectId;
    }
}

function hideProjectEditor() {
    document.getElementById('project-editor').style.display = 'none';
    document.getElementById('projects-list').style.display = 'block';
}

async function handleProjectSubmit(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const projectData = {
        name: formData.get('name'),
        description: formData.get('description'),
        tech_stack: formData.get('techStack').split(',').map(tech => tech.trim()).filter(Boolean),
        url: formData.get('url'),
        github_url: formData.get('github'),
        status: formData.get('status')
    };
    
    const projectId = e.target.dataset.projectId;
    let result;
    
    if (projectId) {
        result = await db.updateProject(projectId, projectData);
    } else {
        result = await db.createProject(projectData);
    }
    
    if (!result.error) {
        showSuccessMessage('Project saved successfully!');
        hideProjectEditor();
        loadProjects();
    } else {
        console.error('Error saving project:', result.error);
    }
}

window.editProject = async function(id) {
    const { data: projects, error } = await db.getProjects();
    
    if (error) {
        console.error('Error loading projects:', error);
        showErrorMessage('Failed to load projects: ' + (error.message || error));
        return;
    }
    
    const project = projects ? projects.find(p => p.id === id) : null;
    if (project) {
        showProjectEditor(project);
    } else {
        console.error('Project not found with ID:', id);
        showErrorMessage('Project not found. It may have been deleted.');
    }
};

window.deleteProject = async function(id) {
    if (confirm('Are you sure you want to delete this project?')) {
        const { error } = await db.deleteProject(id);
        if (!error) {
            showSuccessMessage('Project deleted successfully!');
            loadProjects();
        }
    }
};

// Resource management
async function loadResources() {
    const { data: resources, error } = await db.getResources();
    const listContainer = document.getElementById('resources-list');
    listContainer.innerHTML = '';
    
    if (resources && resources.length > 0) {
        resources.forEach(resource => {
            const resourceCard = document.createElement('div');
            resourceCard.className = 'item-card';
            resourceCard.innerHTML = `
                <div class="item-header">
                    <div>
                        <h3 class="item-title">${resource.name}</h3>
                        <div class="item-meta">Category: ${resource.category}</div>
                        <p>${resource.description || ''}</p>
                        <a href="${resource.url}" target="_blank" style="color: var(--accent);">${resource.url}</a>
                    </div>
                    <div class="item-actions">
                        <button class="edit-btn" onclick="editResource('${resource.id}')">Edit</button>
                        <button class="delete-btn" onclick="deleteResource('${resource.id}')">Delete</button>
                    </div>
                </div>
            `;
            listContainer.appendChild(resourceCard);
        });
    } else {
        listContainer.innerHTML = '<p style="color: var(--text-secondary);">No resources yet.</p>';
    }
}

function showResourceEditor(resource = null) {
    document.getElementById('resource-editor').style.display = 'block';
    document.getElementById('resources-list').style.display = 'none';
    
    if (resource) {
        document.querySelector('#resource-form [name="name"]').value = resource.name || '';
        document.querySelector('#resource-form [name="category"]').value = resource.category || 'other';
        document.querySelector('#resource-form [name="url"]').value = resource.url || '';
        document.querySelector('#resource-form [name="description"]').value = resource.description || '';
        document.getElementById('resource-form').dataset.resourceId = resource.id;
    } else {
        document.getElementById('resource-form').reset();
        delete document.getElementById('resource-form').dataset.resourceId;
    }
}

function hideResourceEditor() {
    document.getElementById('resource-editor').style.display = 'none';
    document.getElementById('resources-list').style.display = 'block';
}

async function handleResourceSubmit(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const resourceData = {
        name: formData.get('name'),
        category: formData.get('category'),
        url: formData.get('url'),
        description: formData.get('description')
    };
    
    const resourceId = e.target.dataset.resourceId;
    let result;
    
    if (resourceId) {
        result = await db.updateResource(resourceId, resourceData);
    } else {
        result = await db.createResource(resourceData);
    }
    
    if (!result.error) {
        showSuccessMessage('Resource saved successfully!');
        hideResourceEditor();
        loadResources();
    } else {
        console.error('Error saving resource:', result.error);
        showErrorMessage('Failed to save resource: ' + (result.error.message || result.error));
    }
}

window.editResource = async function(id) {
    const { data: resources, error } = await db.getResources();
    
    if (error) {
        console.error('Error loading resources:', error);
        showErrorMessage('Failed to load resources: ' + (error.message || error));
        return;
    }
    
    const resource = resources ? resources.find(r => r.id === id) : null;
    if (resource) {
        showResourceEditor(resource);
    } else {
        console.error('Resource not found with ID:', id);
        showErrorMessage('Resource not found. It may have been deleted.');
    }
};

window.deleteResource = async function(id) {
    if (confirm('Are you sure you want to delete this resource?')) {
        const { error } = await db.deleteResource(id);
        if (!error) {
            showSuccessMessage('Resource deleted successfully!');
            loadResources();
        }
    }
};

// Message management
async function loadMessages() {
    const { data: messages, error } = await db.getMessages();
    const listContainer = document.getElementById('messages-list');
    listContainer.innerHTML = '';
    
    if (messages && messages.length > 0) {
        messages.forEach(message => {
            const messageItem = document.createElement('div');
            messageItem.className = 'message-item';
            messageItem.innerHTML = `
                <div class="message-header">
                    <span class="message-from">${message.name}</span>
                    <span class="message-date">${new Date(message.created_at).toLocaleString()}</span>
                </div>
                <div class="message-email">${message.email}</div>
                <div class="message-content">${message.message}</div>
                <button class="delete-btn" onclick="deleteMessage('${message.id}')" style="margin-top: 1rem;">Delete</button>
            `;
            listContainer.appendChild(messageItem);
        });
    } else {
        listContainer.innerHTML = '<p style="color: var(--text-secondary);">No messages yet.</p>';
    }
}

window.deleteMessage = async function(id) {
    if (confirm('Are you sure you want to delete this message?')) {
        const { error } = await db.deleteMessage(id);
        if (!error) {
            showSuccessMessage('Message deleted successfully!');
            loadMessages();
        }
    }
};

// Settings management
async function handlePasswordChange(e) {
    e.preventDefault();
    const newPassword = document.querySelector('[name="newPassword"]').value;
    const confirmPassword = document.querySelector('[name="confirmPassword"]').value;
    
    if (newPassword !== confirmPassword) {
        showErrorMessage('Passwords do not match!');
        return;
    }
    
    if (newPassword.length < 6) {
        showErrorMessage('Password must be at least 6 characters long');
        return;
    }
    
    // Store in localStorage as fallback (in production, use Supabase Auth)
    try {
        // Hash the password (in production, this would be handled by Supabase)
        const hashedPassword = btoa(newPassword); // Simple encoding for demo
        localStorage.setItem('adminPassword', hashedPassword);
        
        showSuccessMessage('Password updated successfully!');
        e.target.reset();
    } catch (error) {
        showErrorMessage('Failed to update password. Please try again.');
    }
}

// Data export/import
async function exportData() {
    const data = {
        profile: (await db.getProfile()).data,
        socials: (await db.getSocials()).data,
        blogs: (await db.getBlogs()).data,
        projects: (await db.getProjects()).data,
        resources: (await db.getResources()).data,
        messages: (await db.getMessages()).data,
        exportDate: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `portfolio-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    showSuccessMessage('Data exported successfully!');
}

async function handleImport(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = async (event) => {
        try {
            const data = JSON.parse(event.target.result);
            
            if (confirm('This will replace all existing data. Are you sure?')) {
                // Import data to Supabase
                // Note: This would need proper implementation with Supabase
                alert('Import functionality requires additional Supabase setup');
                showSuccessMessage('Data import initiated!');
            }
        } catch (error) {
            alert('Invalid file format!');
        }
    };
    reader.readAsText(file);
}

function clearCache() {
    if (confirm('Are you sure you want to clear all cached data?')) {
        localStorage.clear();
        sessionStorage.clear();
        showSuccessMessage('Cache cleared successfully!');
    }
}

function showSuccessMessage(message) {
    // Create and show success message
    const successDiv = document.createElement('div');
    successDiv.className = 'success-message';
    successDiv.textContent = message;
    successDiv.style.position = 'fixed';
    successDiv.style.top = '20px';
    successDiv.style.right = '20px';
    successDiv.style.zIndex = '9999';
    successDiv.style.background = '#4ade80';
    successDiv.style.color = '#000';
    successDiv.style.padding = '1rem 1.5rem';
    successDiv.style.borderRadius = '8px';
    successDiv.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.3)';
    successDiv.style.fontFamily = 'var(--font-mono, monospace)';
    document.body.appendChild(successDiv);
    
    setTimeout(() => {
        successDiv.remove();
    }, 3000);
}

function showErrorMessage(message) {
    // Create and show error message
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    errorDiv.style.position = 'fixed';
    errorDiv.style.top = '20px';
    errorDiv.style.right = '20px';
    errorDiv.style.zIndex = '9999';
    errorDiv.style.background = '#ef4444';
    errorDiv.style.color = '#fff';
    errorDiv.style.padding = '1rem 1.5rem';
    errorDiv.style.borderRadius = '8px';
    errorDiv.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.3)';
    errorDiv.style.fontFamily = 'var(--font-mono, monospace)';
    document.body.appendChild(errorDiv);
    
    setTimeout(() => {
        errorDiv.remove();
    }, 3000);
}