// Content Loader for Frontend - Fetches data from Supabase
document.addEventListener('DOMContentLoaded', async () => {
    // Load profile data
    loadProfileInfo();
    
    // Load social links
    loadSocialLinks();
    
    // Setup contact form
    setupContactForm();
});

async function loadProfileInfo() {
    const { data: profile, error } = await db.getProfile();
    
    if (profile && !error) {
        // Update profile information in various places
        const nameElements = document.querySelectorAll('[data-profile="name"]');
        nameElements.forEach(el => el.textContent = profile.name);
        
        const titleElements = document.querySelectorAll('[data-profile="title"]');
        titleElements.forEach(el => el.textContent = profile.title);
        
        const bioElements = document.querySelectorAll('[data-profile="bio"]');
        bioElements.forEach(el => el.textContent = profile.bio);
        
        // Update hero section if it exists
        const heroTitle = document.querySelector('.hero-title');
        if (heroTitle) {
            heroTitle.textContent = profile.name;
        }
        
        const heroSubtitle = document.querySelector('.hero-subtitle');
        if (heroSubtitle) {
            heroSubtitle.textContent = profile.title;
        }
        
        // Update about section
        const aboutContent = document.querySelector('.about-content');
        if (aboutContent && profile.about) {
            aboutContent.innerHTML = profile.about.split('\n').map(p => `<p>${p}</p>`).join('');
        }
    }
}

async function loadSocialLinks() {
    const { data: socials, error } = await db.getSocials();
    
    if (socials && !error && socials.length > 0) {
        // Update navigation social links
        const navRight = document.querySelector('.nav-right');
        if (navRight) {
            navRight.innerHTML = '';
            socials.forEach(social => {
                const link = document.createElement('a');
                link.href = social.url;
                link.className = 'nav-link';
                link.textContent = social.platform.toLowerCase();
                link.target = '_blank';
                link.rel = 'noopener noreferrer';
                navRight.appendChild(link);
            });
        }
        
        // Update footer social links
        const footerLinks = document.querySelector('.footer-links');
        if (footerLinks) {
            // Keep existing links but add social links
            const existingSocials = footerLinks.querySelectorAll('a[href*="github"], a[href*="twitter"], a[href*="linkedin"]');
            existingSocials.forEach(link => link.remove());
            
            socials.forEach(social => {
                const link = document.createElement('a');
                link.href = social.url;
                link.className = 'footer-link';
                link.textContent = social.platform.toLowerCase();
                link.target = '_blank';
                link.rel = 'noopener noreferrer';
                footerLinks.appendChild(link);
            });
        }
    }
}

function setupContactForm() {
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const formData = new FormData(e.target);
            const messageData = {
                name: formData.get('name'),
                email: formData.get('email'),
                message: formData.get('message')
            };
            
            // Save to Supabase
            const { error } = await db.createMessage(messageData);
            
            if (!error) {
                // Show success message
                const successMessage = document.createElement('div');
                successMessage.className = 'form-success';
                successMessage.textContent = 'Message sent successfully! I\'ll get back to you soon.';
                successMessage.style.cssText = `
                    color: var(--success);
                    margin-top: 1rem;
                    padding: 1rem;
                    background: rgba(74, 222, 128, 0.1);
                    border-radius: 6px;
                `;
                contactForm.appendChild(successMessage);
                
                // Reset form
                contactForm.reset();
                
                // Remove success message after 5 seconds
                setTimeout(() => {
                    successMessage.remove();
                }, 5000);
            } else {
                // Show error message
                const errorMessage = document.createElement('div');
                errorMessage.className = 'form-error';
                errorMessage.textContent = 'Failed to send message. Please try again.';
                errorMessage.style.cssText = `
                    color: #ef4444;
                    margin-top: 1rem;
                    padding: 1rem;
                    background: rgba(239, 68, 68, 0.1);
                    border-radius: 6px;
                `;
                contactForm.appendChild(errorMessage);
                
                setTimeout(() => {
                    errorMessage.remove();
                }, 5000);
            }
        });
    }
}

// Load blog posts for blog page
async function loadBlogPosts() {
    const { data: blogs, error } = await db.getBlogs();
    const blogContainer = document.getElementById('blog-posts');
    
    if (blogContainer && blogs && !error) {
        blogContainer.innerHTML = '';
        
        if (blogs.length === 0) {
            blogContainer.innerHTML = '<p style="color: var(--text-secondary);">No blog posts yet. Check back soon!</p>';
            return;
        }
        
        blogs.forEach(blog => {
            const blogCard = document.createElement('article');
            blogCard.className = 'blog-post';
            blogCard.innerHTML = `
                <a href="/blog/${blog.slug}" class="blog-link">
                    <h2 class="blog-title">${blog.title}</h2>
                    <div class="blog-meta">
                        <span>${new Date(blog.created_at).toLocaleDateString()}</span>
                        <span>·</span>
                        <span>${blog.read_time || 5} min read</span>
                    </div>
                    <p class="blog-excerpt">${blog.excerpt || ''}</p>
                    ${blog.tags && blog.tags.length > 0 ? `
                        <div class="blog-tags">
                            ${blog.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                        </div>
                    ` : ''}
                </a>
            `;
            blogContainer.appendChild(blogCard);
        });
    }
}

// Load projects
async function loadProjects() {
    const { data: projects, error } = await db.getProjects();
    const projectsContainer = document.getElementById('projects-container');
    
    if (projectsContainer && projects && !error) {
        projectsContainer.innerHTML = '';
        
        if (projects.length === 0) {
            projectsContainer.innerHTML = '<p style="color: var(--text-secondary);">Projects coming soon!</p>';
            return;
        }
        
        projects.forEach(project => {
            if (project.status !== 'active') return;
            
            const projectCard = document.createElement('div');
            projectCard.className = 'project-card';
            projectCard.innerHTML = `
                <h3 class="project-title">${project.name}</h3>
                <p class="project-description">${project.description || ''}</p>
                ${project.tech_stack && project.tech_stack.length > 0 ? `
                    <div class="project-tech">
                        ${project.tech_stack.map(tech => `<span class="tech-tag">${tech}</span>`).join('')}
                    </div>
                ` : ''}
                <div class="project-links">
                    ${project.url ? `<a href="${project.url}" target="_blank" class="project-link">View Project</a>` : ''}
                    ${project.github_url ? `<a href="${project.github_url}" target="_blank" class="project-link">GitHub</a>` : ''}
                </div>
            `;
            projectsContainer.appendChild(projectCard);
        });
    }
}

// Load resources
async function loadResources() {
    const { data: resources, error } = await db.getResources();
    const resourcesContainer = document.getElementById('resources-container');
    
    if (resourcesContainer && resources && !error) {
        resourcesContainer.innerHTML = '';
        
        if (resources.length === 0) {
            resourcesContainer.innerHTML = '<p style="color: var(--text-secondary);">Resources coming soon!</p>';
            return;
        }
        
        // Group resources by category
        const grouped = resources.reduce((acc, resource) => {
            const category = resource.category || 'other';
            if (!acc[category]) acc[category] = [];
            acc[category].push(resource);
            return acc;
        }, {});
        
        Object.entries(grouped).forEach(([category, items]) => {
            const categorySection = document.createElement('div');
            categorySection.className = 'resource-category';
            categorySection.innerHTML = `
                <h3 class="category-title">${category.charAt(0).toUpperCase() + category.slice(1)}</h3>
                <div class="resource-list">
                    ${items.map(resource => `
                        <a href="${resource.url}" target="_blank" class="resource-item">
                            <span class="resource-name">${resource.name}</span>
                            ${resource.description ? `<span class="resource-description">${resource.description}</span>` : ''}
                        </a>
                    `).join('')}
                </div>
            `;
            resourcesContainer.appendChild(categorySection);
        });
    }
}

// Export functions for use in other pages
window.loadBlogPosts = loadBlogPosts;
window.loadProjects = loadProjects;
window.loadResources = loadResources;