// Admin Panel JavaScript

// Default admin password (in production, use proper authentication)
const DEFAULT_ADMIN_PASSWORD = 'zero@admin2024';

// Admin state
let isLoggedIn = false;
let adminData = {};

// Initialize admin panel
document.addEventListener('DOMContentLoaded', () => {
    // Check if already logged in
    checkLoginStatus();
    
    // Setup event listeners
    setupLoginForm();
    setupTabs();
    setupForms();
    setupButtons();
    
    // Load data if logged in
    if (isLoggedIn) {
        showDashboard();
        loadAdminData();
    }
});

// Check login status
function checkLoginStatus() {
    const token = sessionStorage.getItem('adminToken');
    const tokenExpiry = sessionStorage.getItem('adminTokenExpiry');
    
    if (token && tokenExpiry) {
        const now = new Date().getTime();
        if (now < parseInt(tokenExpiry)) {
            isLoggedIn = true;
            return true;
        }
    }
    
    isLoggedIn = false;
    sessionStorage.removeItem('adminToken');
    sessionStorage.removeItem('adminTokenExpiry');
    return false;
}

// Setup login form
function setupLoginForm() {
    const loginForm = document.getElementById('login-form');
    const logoutBtn = document.getElementById('logout-btn');
    
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const password = document.getElementById('admin-password').value;
            
            // Check password (in production, verify with backend)
            const storedPassword = localStorage.getItem('adminPassword') || DEFAULT_ADMIN_PASSWORD;
            
            if (password === storedPassword) {
                // Create session token
                const token = btoa(password + ':' + new Date().getTime());
                const expiry = new Date().getTime() + (2 * 60 * 60 * 1000); // 2 hours
                
                sessionStorage.setItem('adminToken', token);
                sessionStorage.setItem('adminTokenExpiry', expiry);
                
                isLoggedIn = true;
                showDashboard();
                loadAdminData();
            } else {
                showError('Invalid password');
            }
        });
    }
    
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            logout();
        });
    }
}

// Show dashboard
function showDashboard() {
    const loginSection = document.getElementById('login-section');
    const dashboard = document.getElementById('admin-dashboard');
    const adminStatus = document.getElementById('admin-status');
    const logoutBtn = document.getElementById('logout-btn');
    
    if (loginSection) loginSection.style.display = 'none';
    if (dashboard) dashboard.style.display = 'block';
    if (adminStatus) adminStatus.textContent = '🔐 Admin Mode';
    if (logoutBtn) logoutBtn.style.display = 'inline-block';
}

// Logout
function logout() {
    sessionStorage.removeItem('adminToken');
    sessionStorage.removeItem('adminTokenExpiry');
    isLoggedIn = false;
    window.location.reload();
}

// Setup tabs
function setupTabs() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabPanels = document.querySelectorAll('.tab-panel');
    
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const tabName = btn.getAttribute('data-tab');
            
            // Update active button
            tabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            // Show corresponding panel
            tabPanels.forEach(panel => {
                panel.classList.remove('active');
                if (panel.id === `${tabName}-tab`) {
                    panel.classList.add('active');
                    
                    // Load tab-specific data
                    loadTabData(tabName);
                }
            });
        });
    });
}

// Load tab data
function loadTabData(tabName) {
    switch(tabName) {
        case 'socials':
            loadSocialLinks();
            break;
        case 'blogs':
            loadBlogPosts();
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

// Setup forms
function setupForms() {
    // Profile form
    const profileForm = document.getElementById('profile-form');
    if (profileForm) {
        profileForm.addEventListener('submit', (e) => {
            e.preventDefault();
            saveProfile(new FormData(profileForm));
        });
    }
    
    // Socials form
    const socialsForm = document.getElementById('socials-form');
    if (socialsForm) {
        socialsForm.addEventListener('submit', (e) => {
            e.preventDefault();
            saveSocialLinks();
        });
    }
    
    // Blog form
    const blogForm = document.getElementById('blog-form');
    if (blogForm) {
        blogForm.addEventListener('submit', (e) => {
            e.preventDefault();
            saveBlogPost(new FormData(blogForm));
        });
    }
    
    // Project form
    const projectForm = document.getElementById('project-form');
    if (projectForm) {
        projectForm.addEventListener('submit', (e) => {
            e.preventDefault();
            saveProject(new FormData(projectForm));
        });
    }
    
    // Resource form
    const resourceForm = document.getElementById('resource-form');
    if (resourceForm) {
        resourceForm.addEventListener('submit', (e) => {
            e.preventDefault();
            saveResource(new FormData(resourceForm));
        });
    }
    
    // Settings form
    const settingsForm = document.getElementById('settings-form');
    if (settingsForm) {
        settingsForm.addEventListener('submit', (e) => {
            e.preventDefault();
            updatePassword(new FormData(settingsForm));
        });
    }
}

// Setup buttons
function setupButtons() {
    // Add social link button
    const addSocialBtn = document.getElementById('add-social-btn');
    if (addSocialBtn) {
        addSocialBtn.addEventListener('click', () => {
            addSocialLinkField();
        });
    }
    
    // New blog button
    const newBlogBtn = document.getElementById('new-blog-btn');
    const blogEditor = document.getElementById('blog-editor');
    const cancelBlogBtn = document.getElementById('cancel-blog-btn');
    
    if (newBlogBtn) {
        newBlogBtn.addEventListener('click', () => {
            blogEditor.style.display = 'block';
            newBlogBtn.style.display = 'none';
        });
    }
    
    if (cancelBlogBtn) {
        cancelBlogBtn.addEventListener('click', () => {
            blogEditor.style.display = 'none';
            newBlogBtn.style.display = 'block';
            document.getElementById('blog-form').reset();
        });
    }
    
    // New project button
    const newProjectBtn = document.getElementById('new-project-btn');
    const projectEditor = document.getElementById('project-editor');
    const cancelProjectBtn = document.getElementById('cancel-project-btn');
    
    if (newProjectBtn) {
        newProjectBtn.addEventListener('click', () => {
            projectEditor.style.display = 'block';
            newProjectBtn.style.display = 'none';
        });
    }
    
    if (cancelProjectBtn) {
        cancelProjectBtn.addEventListener('click', () => {
            projectEditor.style.display = 'none';
            newProjectBtn.style.display = 'block';
            document.getElementById('project-form').reset();
        });
    }
    
    // New resource button
    const newResourceBtn = document.getElementById('new-resource-btn');
    const resourceEditor = document.getElementById('resource-editor');
    const cancelResourceBtn = document.getElementById('cancel-resource-btn');
    
    if (newResourceBtn) {
        newResourceBtn.addEventListener('click', () => {
            resourceEditor.style.display = 'block';
            newResourceBtn.style.display = 'none';
        });
    }
    
    if (cancelResourceBtn) {
        cancelResourceBtn.addEventListener('click', () => {
            resourceEditor.style.display = 'none';
            newResourceBtn.style.display = 'block';
            document.getElementById('resource-form').reset();
        });
    }
    
    // Export/Import buttons
    const exportBtn = document.getElementById('export-data-btn');
    const importBtn = document.getElementById('import-data-btn');
    const importFile = document.getElementById('import-file');
    const clearCacheBtn = document.getElementById('clear-cache-btn');
    
    if (exportBtn) {
        exportBtn.addEventListener('click', exportData);
    }
    
    if (importBtn) {
        importBtn.addEventListener('click', () => {
            importFile.click();
        });
    }
    
    if (importFile) {
        importFile.addEventListener('change', (e) => {
            importData(e.target.files[0]);
        });
    }
    
    if (clearCacheBtn) {
        clearCacheBtn.addEventListener('click', () => {
            if (confirm('Are you sure you want to clear all cached data?')) {
                localStorage.clear();
                sessionStorage.clear();
                alert('Cache cleared. You will be logged out.');
                logout();
            }
        });
    }
}

// Load admin data
function loadAdminData() {
    // Load profile
    const profile = JSON.parse(localStorage.getItem('adminProfile') || '{}');
    if (profile && Object.keys(profile).length > 0) {
        const profileForm = document.getElementById('profile-form');
        if (profileForm) {
            Object.keys(profile).forEach(key => {
                const input = profileForm.querySelector(`[name="${key}"]`);
                if (input) input.value = profile[key];
            });
        }
    }
}

// Save profile
function saveProfile(formData) {
    const profile = {};
    for (let [key, value] of formData.entries()) {
        profile[key] = value;
    }
    
    localStorage.setItem('adminProfile', JSON.stringify(profile));
    showSuccess('Profile saved successfully!');
}

// Load social links
function loadSocialLinks() {
    const container = document.getElementById('social-links-container');
    const socialLinks = JSON.parse(localStorage.getItem('socialLinks') || '[]');
    
    if (socialLinks.length === 0) {
        // Default social links
        socialLinks.push(
            { platform: 'GitHub', url: 'https://github.com/karthiknagapuri' },
            { platform: 'Twitter', url: 'https://twitter.com/karthiknagpuri' },
            { platform: 'LinkedIn', url: 'https://linkedin.com/in/karthiknagpuri' },
            { platform: 'Medium', url: 'https://medium.com/@Karthiknagapuri' }
        );
    }
    
    container.innerHTML = '';
    socialLinks.forEach((link, index) => {
        addSocialLinkField(link.platform, link.url, index);
    });
}

// Add social link field
function addSocialLinkField(platform = '', url = '', index = null) {
    const container = document.getElementById('social-links-container');
    const div = document.createElement('div');
    div.className = 'social-link-item';
    div.innerHTML = `
        <input type="text" placeholder="Platform" value="${platform}" class="social-platform">
        <input type="url" placeholder="URL" value="${url}" class="social-url">
        <button type="button" class="remove-btn" onclick="this.parentElement.remove()">Remove</button>
    `;
    container.appendChild(div);
}

// Save social links
function saveSocialLinks() {
    const container = document.getElementById('social-links-container');
    const items = container.querySelectorAll('.social-link-item');
    const socialLinks = [];
    
    items.forEach(item => {
        const platform = item.querySelector('.social-platform').value;
        const url = item.querySelector('.social-url').value;
        if (platform && url) {
            socialLinks.push({ platform, url });
        }
    });
    
    localStorage.setItem('socialLinks', JSON.stringify(socialLinks));
    showSuccess('Social links saved successfully!');
}

// Load blog posts
function loadBlogPosts() {
    const container = document.getElementById('blogs-list');
    const blogs = JSON.parse(localStorage.getItem('blogPosts') || '[]');
    
    container.innerHTML = '';
    blogs.forEach((blog, index) => {
        const div = document.createElement('div');
        div.className = 'item-card';
        div.innerHTML = `
            <div class="item-header">
                <div>
                    <div class="item-title">${blog.title}</div>
                    <div class="item-meta">${blog.date} · ${blog.readTime} min read · ${blog.views || 0} views</div>
                </div>
                <div class="item-actions">
                    <button class="edit-btn" onclick="editBlogPost(${index})">Edit</button>
                    <button class="delete-btn" onclick="deleteBlogPost(${index})">Delete</button>
                </div>
            </div>
            <p>${blog.excerpt}</p>
            <div class="item-meta">Tags: ${blog.tags}</div>
        `;
        container.appendChild(div);
    });
}

// Save blog post
function saveBlogPost(formData) {
    const blogs = JSON.parse(localStorage.getItem('blogPosts') || '[]');
    const blog = {
        title: formData.get('title'),
        slug: formData.get('slug'),
        excerpt: formData.get('excerpt'),
        content: formData.get('content'),
        tags: formData.get('tags'),
        readTime: formData.get('readTime'),
        date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
        views: 0
    };
    
    blogs.unshift(blog);
    localStorage.setItem('blogPosts', JSON.stringify(blogs));
    
    // Hide editor and reload list
    document.getElementById('blog-editor').style.display = 'none';
    document.getElementById('new-blog-btn').style.display = 'block';
    document.getElementById('blog-form').reset();
    loadBlogPosts();
    
    showSuccess('Blog post saved successfully!');
}

// Delete blog post
window.deleteBlogPost = function(index) {
    if (confirm('Are you sure you want to delete this blog post?')) {
        const blogs = JSON.parse(localStorage.getItem('blogPosts') || '[]');
        blogs.splice(index, 1);
        localStorage.setItem('blogPosts', JSON.stringify(blogs));
        loadBlogPosts();
        showSuccess('Blog post deleted!');
    }
};

// Load projects
function loadProjects() {
    const container = document.getElementById('projects-list');
    const projects = JSON.parse(localStorage.getItem('projects') || '[]');
    
    container.innerHTML = '';
    projects.forEach((project, index) => {
        const div = document.createElement('div');
        div.className = 'item-card';
        div.innerHTML = `
            <div class="item-header">
                <div>
                    <div class="item-title">${project.name}</div>
                    <div class="item-meta">Status: ${project.status} · Tech: ${project.techStack}</div>
                </div>
                <div class="item-actions">
                    <button class="edit-btn" onclick="editProject(${index})">Edit</button>
                    <button class="delete-btn" onclick="deleteProject(${index})">Delete</button>
                </div>
            </div>
            <p>${project.description}</p>
            ${project.url ? `<a href="${project.url}" target="_blank">🔗 Live Demo</a> ` : ''}
            ${project.github ? `<a href="${project.github}" target="_blank">🐙 GitHub</a>` : ''}
        `;
        container.appendChild(div);
    });
}

// Save project
function saveProject(formData) {
    const projects = JSON.parse(localStorage.getItem('projects') || '[]');
    const project = {
        name: formData.get('name'),
        description: formData.get('description'),
        techStack: formData.get('techStack'),
        url: formData.get('url'),
        github: formData.get('github'),
        status: formData.get('status')
    };
    
    projects.unshift(project);
    localStorage.setItem('projects', JSON.stringify(projects));
    
    // Hide editor and reload list
    document.getElementById('project-editor').style.display = 'none';
    document.getElementById('new-project-btn').style.display = 'block';
    document.getElementById('project-form').reset();
    loadProjects();
    
    showSuccess('Project saved successfully!');
}

// Delete project
window.deleteProject = function(index) {
    if (confirm('Are you sure you want to delete this project?')) {
        const projects = JSON.parse(localStorage.getItem('projects') || '[]');
        projects.splice(index, 1);
        localStorage.setItem('projects', JSON.stringify(projects));
        loadProjects();
        showSuccess('Project deleted!');
    }
};

// Load resources
function loadResources() {
    const container = document.getElementById('resources-list');
    const resources = JSON.parse(localStorage.getItem('resources') || '[]');
    
    container.innerHTML = '';
    resources.forEach((resource, index) => {
        const div = document.createElement('div');
        div.className = 'item-card';
        div.innerHTML = `
            <div class="item-header">
                <div>
                    <div class="item-title">${resource.name}</div>
                    <div class="item-meta">Category: ${resource.category}</div>
                </div>
                <div class="item-actions">
                    <button class="edit-btn" onclick="editResource(${index})">Edit</button>
                    <button class="delete-btn" onclick="deleteResource(${index})">Delete</button>
                </div>
            </div>
            <p>${resource.description || ''}</p>
            <a href="${resource.url}" target="_blank">🔗 Visit Resource</a>
        `;
        container.appendChild(div);
    });
}

// Save resource
function saveResource(formData) {
    const resources = JSON.parse(localStorage.getItem('resources') || '[]');
    const resource = {
        name: formData.get('name'),
        category: formData.get('category'),
        url: formData.get('url'),
        description: formData.get('description')
    };
    
    resources.unshift(resource);
    localStorage.setItem('resources', JSON.stringify(resources));
    
    // Hide editor and reload list
    document.getElementById('resource-editor').style.display = 'none';
    document.getElementById('new-resource-btn').style.display = 'block';
    document.getElementById('resource-form').reset();
    loadResources();
    
    showSuccess('Resource saved successfully!');
}

// Delete resource
window.deleteResource = function(index) {
    if (confirm('Are you sure you want to delete this resource?')) {
        const resources = JSON.parse(localStorage.getItem('resources') || '[]');
        resources.splice(index, 1);
        localStorage.setItem('resources', JSON.stringify(resources));
        loadResources();
        showSuccess('Resource deleted!');
    }
};

// Load messages
function loadMessages() {
    const container = document.getElementById('messages-list');
    const messages = JSON.parse(localStorage.getItem('contact_messages') || '[]');
    
    container.innerHTML = '';
    if (messages.length === 0) {
        container.innerHTML = '<p style="color: var(--text-secondary);">No messages yet.</p>';
        return;
    }
    
    messages.reverse().forEach((message, index) => {
        const div = document.createElement('div');
        div.className = 'message-item';
        div.innerHTML = `
            <div class="message-header">
                <div class="message-from">${message.name}</div>
                <div class="message-date">${new Date(message.timestamp).toLocaleString()}</div>
            </div>
            <div class="message-email">${message.email}</div>
            <div class="message-content">${message.message}</div>
        `;
        container.appendChild(div);
    });
}

// Update password
function updatePassword(formData) {
    const newPassword = formData.get('newPassword');
    const confirmPassword = formData.get('confirmPassword');
    
    if (!newPassword || !confirmPassword) {
        showError('Please enter both password fields');
        return;
    }
    
    if (newPassword !== confirmPassword) {
        showError('Passwords do not match');
        return;
    }
    
    if (newPassword.length < 8) {
        showError('Password must be at least 8 characters long');
        return;
    }
    
    localStorage.setItem('adminPassword', newPassword);
    document.getElementById('settings-form').reset();
    showSuccess('Password updated successfully!');
}

// Export data
function exportData() {
    const data = {
        profile: JSON.parse(localStorage.getItem('adminProfile') || '{}'),
        socialLinks: JSON.parse(localStorage.getItem('socialLinks') || '[]'),
        blogPosts: JSON.parse(localStorage.getItem('blogPosts') || '[]'),
        projects: JSON.parse(localStorage.getItem('projects') || '[]'),
        resources: JSON.parse(localStorage.getItem('resources') || '[]'),
        messages: JSON.parse(localStorage.getItem('contact_messages') || '[]'),
        exportDate: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `karthik-portfolio-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    showSuccess('Data exported successfully!');
}

// Import data
function importData(file) {
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const data = JSON.parse(e.target.result);
            
            if (confirm('This will overwrite all existing data. Are you sure?')) {
                if (data.profile) localStorage.setItem('adminProfile', JSON.stringify(data.profile));
                if (data.socialLinks) localStorage.setItem('socialLinks', JSON.stringify(data.socialLinks));
                if (data.blogPosts) localStorage.setItem('blogPosts', JSON.stringify(data.blogPosts));
                if (data.projects) localStorage.setItem('projects', JSON.stringify(data.projects));
                if (data.resources) localStorage.setItem('resources', JSON.stringify(data.resources));
                if (data.messages) localStorage.setItem('contact_messages', JSON.stringify(data.messages));
                
                showSuccess('Data imported successfully!');
                loadAdminData();
            }
        } catch (error) {
            showError('Invalid JSON file');
        }
    };
    reader.readAsText(file);
}

// Show error message
function showError(message) {
    const errorDiv = document.getElementById('login-error');
    if (errorDiv) {
        errorDiv.textContent = message;
        setTimeout(() => {
            errorDiv.textContent = '';
        }, 3000);
    } else {
        alert('Error: ' + message);
    }
}

// Show success message
function showSuccess(message) {
    const div = document.createElement('div');
    div.className = 'success-message';
    div.textContent = message;
    div.style.position = 'fixed';
    div.style.top = '20px';
    div.style.right = '20px';
    div.style.zIndex = '10000';
    document.body.appendChild(div);
    
    setTimeout(() => {
        div.remove();
    }, 3000);
}