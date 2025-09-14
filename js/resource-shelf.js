// Resource Shelf System with AI Enrichment
const GEMINI_API_KEY = 'AIzaSyAc1Rg_hn-aRYr-UIwgOWDUnZhxP28e4tI';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

// Resource categories
const RESOURCE_CATEGORIES = {
    'startup': 'Startup & Entrepreneurship',
    'ai': 'AI & Machine Learning',
    'development': 'Development & Programming',
    'design': 'Design & UX',
    'marketing': 'Marketing & Growth',
    'productivity': 'Productivity & Tools',
    'finance': 'Finance & Investment',
    'leadership': 'Leadership & Management',
    'learning': 'Learning & Education',
    'other': 'Other Resources'
};

// Resource Shelf Manager
class ResourceShelf {
    constructor() {
        this.resources = [];
        this.isLoading = false;
        this.loadResources();
    }

    // Load existing resources from localStorage or Supabase
    async loadResources() {
        try {
            // Try to load from Supabase first
            if (window.db && typeof window.db.getResources === 'function') {
                const { data } = await window.db.getResources();
                if (data) {
                    this.resources = data;
                    return;
                }
            }
            
            // Fallback to localStorage
            const stored = localStorage.getItem('resourceShelf');
            if (stored) {
                this.resources = JSON.parse(stored);
            }
        } catch (error) {
            console.error('Error loading resources:', error);
            this.resources = [];
        }
    }

    // Save resources
    async saveResources() {
        try {
            // Save to Supabase if available
            if (window.db && typeof window.db.createResource === 'function') {
                for (const resource of this.resources) {
                    if (!resource.saved) {
                        await window.db.createResource(resource);
                        resource.saved = true;
                    }
                }
            }
            
            // Always save to localStorage as backup
            localStorage.setItem('resourceShelf', JSON.stringify(this.resources));
        } catch (error) {
            console.error('Error saving resources:', error);
        }
    }

    // Scrape URL content
    async scrapeUrl(url) {
        try {
            // Parse URL for domain-specific extraction
            const urlParts = new URL(url);
            const hostname = urlParts.hostname.replace('www.', '');
            const pathname = urlParts.pathname;
            
            let title = '';
            let description = '';
            let author = '';
            let content = '';
            
            // Domain-specific extraction patterns
            if (hostname.includes('substack.com')) {
                // Substack pattern: username.substack.com/p/article-slug
                const pathParts = pathname.split('/');
                if (pathParts[1] === 'p' && pathParts[2]) {
                    title = pathParts[2]
                        .replace(/-/g, ' ')
                        .replace(/\b\w/g, l => l.toUpperCase());
                    author = hostname.split('.')[0]
                        .replace(/-/g, ' ')
                        .replace(/\b\w/g, l => l.toUpperCase());
                    description = `Article from ${author}'s Substack newsletter`;
                }
            } else if (hostname.includes('medium.com')) {
                // Medium pattern
                const pathParts = pathname.split('/');
                const lastPart = pathParts[pathParts.length - 1];
                if (lastPart) {
                    // Remove the hash at the end if present
                    const titleParts = lastPart.split('-');
                    titleParts.pop(); // Remove hash
                    title = titleParts.join(' ').replace(/\b\w/g, l => l.toUpperCase());
                    author = pathParts[1]?.replace('@', '') || 'Medium Author';
                    description = `Article on Medium by ${author}`;
                }
            } else if (hostname.includes('github.com')) {
                // GitHub pattern: github.com/user/repo
                const pathParts = pathname.split('/').filter(p => p);
                if (pathParts.length >= 2) {
                    author = pathParts[0];
                    title = pathParts[1];
                    description = `GitHub repository: ${author}/${title}`;
                }
            } else if (hostname.includes('youtube.com') || hostname.includes('youtu.be')) {
                title = 'YouTube Video';
                description = 'Video content from YouTube';
                author = 'YouTube Creator';
            } else {
                // Generic extraction
                const lastPath = pathname.split('/').filter(p => p).pop() || '';
                title = lastPath
                    .replace(/[-_]/g, ' ')
                    .replace(/\.\w+$/, '') // Remove file extension
                    .replace(/\b\w/g, l => l.toUpperCase());
                    
                if (!title) {
                    title = hostname.split('.')[0].replace(/\b\w/g, l => l.toUpperCase());
                }
                description = `Resource from ${hostname}`;
            }
            
            // Placeholder content explaining CORS limitation
            content = `This resource is from ${hostname}. Due to browser security restrictions (CORS), ` +
                     `direct content scraping is not possible. The AI will analyze the URL and available ` +
                     `metadata to provide categorization and insights about this resource.`;
            
            return {
                title: title.trim() || 'Untitled Resource',
                description: description.trim() || `Resource from ${hostname}`,
                image: '', // Would require backend service
                author: author.trim() || '',
                content: content,
                url: url
            };
            
        } catch (error) {
            console.error('Error scraping URL:', error);
            // Fallback to most basic extraction
            return {
                title: url.split('/').pop() || 'Untitled Resource',
                description: 'Unable to extract description',
                image: '',
                author: '',
                content: '',
                url: url
            };
        }
    }

    // Enrich content with Gemini AI
    async enrichWithGemini(scrapedData) {
        try {
            const prompt = `
                Analyze this article/resource and provide enriched metadata:
                
                Title: ${scrapedData.title}
                URL: ${scrapedData.url}
                Description: ${scrapedData.description}
                Content excerpt: ${scrapedData.content.substring(0, 1000)}
                
                Please provide:
                1. A better, concise title (if needed)
                2. A compelling 2-3 sentence summary
                3. Main category from: startup, ai, development, design, marketing, productivity, finance, leadership, learning, other
                4. 3-5 relevant tags
                5. Key takeaways (3-5 bullet points)
                6. Target audience
                7. Difficulty level: beginner, intermediate, advanced
                8. Estimated reading time in minutes
                9. Quality score (1-10)
                10. Why this is valuable (1 sentence)
                
                Format the response as JSON.
            `;

            const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{
                            text: prompt
                        }]
                    }]
                })
            });

            if (!response.ok) {
                throw new Error('Gemini API request failed');
            }

            const data = await response.json();
            const aiResponse = data.candidates[0].content.parts[0].text;
            
            // Parse the AI response
            try {
                // Extract JSON from the response
                const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                    return JSON.parse(jsonMatch[0]);
                }
            } catch (parseError) {
                console.error('Error parsing AI response:', parseError);
            }

            // Fallback parsing if JSON extraction fails
            return this.parseAIResponse(aiResponse);
        } catch (error) {
            console.error('Error enriching with Gemini:', error);
            // Fallback to basic categorization
            return this.basicCategorization(scrapedData);
        }
    }

    // Parse AI response if not in JSON format
    parseAIResponse(text) {
        const lines = text.split('\n');
        const result = {
            title: '',
            summary: '',
            category: 'other',
            // tags: [], // Not in database schema
            keyTakeaways: [],
            targetAudience: '',
            difficulty: 'intermediate',
            readingTime: 5,
            qualityScore: 7,
            value: ''
        };

        // Simple parsing logic
        lines.forEach(line => {
            if (line.includes('Title:')) result.title = line.split(':')[1]?.trim();
            if (line.includes('Summary:')) result.summary = line.split(':')[1]?.trim();
            if (line.includes('Category:')) result.category = line.split(':')[1]?.trim().toLowerCase();
            // if (line.includes('Tags:')) result.tags = line.split(':')[1]?.split(',').map(t => t.trim()); // Not in database schema
            if (line.includes('Reading time:')) result.readingTime = parseInt(line.match(/\d+/)?.[0] || '5');
            if (line.includes('Quality score:')) result.qualityScore = parseInt(line.match(/\d+/)?.[0] || '7');
        });

        return result;
    }

    // Basic categorization without AI
    basicCategorization(scrapedData) {
        const text = (scrapedData.title + ' ' + scrapedData.description + ' ' + scrapedData.content).toLowerCase();
        
        let category = 'other';
        const categoryKeywords = {
            'startup': ['startup', 'entrepreneur', 'founder', 'venture', 'business'],
            'ai': ['ai', 'artificial intelligence', 'machine learning', 'ml', 'neural', 'gpt'],
            'development': ['programming', 'coding', 'developer', 'software', 'code', 'api'],
            'design': ['design', 'ux', 'ui', 'user experience', 'interface'],
            'marketing': ['marketing', 'growth', 'seo', 'advertising', 'branding'],
            'productivity': ['productivity', 'efficiency', 'tools', 'workflow', 'automation'],
            'finance': ['finance', 'investment', 'funding', 'money', 'revenue'],
            'leadership': ['leadership', 'management', 'team', 'culture', 'organization'],
            'learning': ['learning', 'education', 'course', 'tutorial', 'guide']
        };

        // Find best matching category
        let maxMatches = 0;
        for (const [cat, keywords] of Object.entries(categoryKeywords)) {
            const matches = keywords.filter(keyword => text.includes(keyword)).length;
            if (matches > maxMatches) {
                maxMatches = matches;
                category = cat;
            }
        }

        // Extract tags
        const tags = [];
        const commonTags = ['startup', 'ai', 'lean', 'mvp', 'product', 'growth', 'tech', 'innovation'];
        commonTags.forEach(tag => {
            if (text.includes(tag)) {
                tags.push(tag);
            }
        });

        // Estimate reading time
        const wordCount = scrapedData.content.split(' ').length;
        const readingTime = Math.ceil(wordCount / 200); // Average reading speed

        return {
            title: scrapedData.title,
            summary: scrapedData.description,
            category,
            // tags: tags.slice(0, 5), // Not in database schema
            keyTakeaways: [],
            targetAudience: 'General',
            difficulty: 'intermediate',
            readingTime,
            qualityScore: 7,
            value: 'Valuable resource for learning and growth'
        };
    }

    // Add a new resource
    async addResource(url, manualData = {}) {
        if (this.isLoading) {
            return { error: 'Already processing a resource' };
        }

        this.isLoading = true;
        
        try {
            // Check if URL already exists
            if (this.resources.find(r => r.url === url)) {
                return { error: 'Resource already exists' };
            }

            // Show loading state
            this.showLoadingState();

            // Scrape the URL
            const scrapedData = await this.scrapeUrl(url);

            // Enrich with AI
            const enrichedData = await this.enrichWithGemini(scrapedData);

            // Combine all data
            const resource = {
                id: Date.now().toString(),
                url,
                name: enrichedData.title || scrapedData.title,
                description: enrichedData.summary || scrapedData.description,
                category: enrichedData.category || 'other',
                // tags: enrichedData.tags || [], // Not in database schema
                author: scrapedData.author || '',
                image: scrapedData.image || '',
                keyTakeaways: enrichedData.keyTakeaways || [],
                targetAudience: enrichedData.targetAudience || '',
                difficulty: enrichedData.difficulty || 'intermediate',
                readingTime: enrichedData.readingTime || 5,
                qualityScore: enrichedData.qualityScore || 7,
                value: enrichedData.value || '',
                dateAdded: new Date().toISOString(),
                favorite: false,
                notes: manualData.notes || '',
                ...manualData
            };

            // Add to resources
            this.resources.unshift(resource);
            
            // Save
            await this.saveResources();

            // Update UI
            this.renderResources();

            return { success: true, resource };
        } catch (error) {
            console.error('Error adding resource:', error);
            return { error: error.message };
        } finally {
            this.isLoading = false;
            this.hideLoadingState();
        }
    }

    // Show loading state
    showLoadingState() {
        const loader = document.getElementById('resource-loader');
        if (loader) {
            loader.style.display = 'flex';
        }
    }

    // Hide loading state
    hideLoadingState() {
        const loader = document.getElementById('resource-loader');
        if (loader) {
            loader.style.display = 'none';
        }
    }

    // Render resources in the UI
    renderResources(filter = {}) {
        const container = document.getElementById('resource-shelf-container');
        if (!container) return;

        // Filter resources
        let filtered = this.resources;
        if (filter.category) {
            filtered = filtered.filter(r => r.category === filter.category);
        }
        if (filter.search) {
            const searchLower = filter.search.toLowerCase();
            filtered = filtered.filter(r => 
                r.title.toLowerCase().includes(searchLower) ||
                r.description.toLowerCase().includes(searchLower) ||
                false // tags not in database schema: r.tags?.some(t => t.toLowerCase().includes(searchLower))
            );
        }

        // Group by category
        const grouped = {};
        filtered.forEach(resource => {
            const cat = resource.category || 'other';
            if (!grouped[cat]) {
                grouped[cat] = [];
            }
            grouped[cat].push(resource);
        });

        // Render HTML - Minimal style with all resources in one list
        let html = '';
        if (Object.keys(grouped).length > 1) {
            // If multiple categories, show them
            for (const [category, resources] of Object.entries(grouped)) {
                html += `
                    <div class="resource-category-section">
                        <h3 class="resource-category-title">${category}</h3>
                        <div class="resource-grid">
                            ${resources.map(resource => this.renderResourceCard(resource)).join('')}
                        </div>
                    </div>
                `;
            }
        } else {
            // Single category or filtered - just show resources
            html = '<div class="resource-grid">';
            filtered.forEach(resource => {
                html += this.renderResourceCard(resource);
            });
            html += '</div>';
        }

        container.innerHTML = html || '<p class="no-resources">no resources yet</p>';
    }

    // Render single resource card - Minimal version
    renderResourceCard(resource) {
        // Simple, clean card with just essentials
        return `
            <div class="resource-card" data-id="${resource.id}">
                <h4 class="resource-title">
                    <a href="${resource.url}" target="_blank" rel="noopener">${resource.name}</a>
                </h4>
                
                <p class="resource-description">${resource.description}</p>
                
                <div class="resource-meta">
                    <span>${resource.readingTime} min</span>
                    ${resource.author ? `<span>• ${resource.author}</span>` : ''}
                    <span>• ${resource.category}</span>
                </div>
                <div class="resource-actions" style="margin-top:.5rem; display:flex; gap:.5rem;">
                    <a href="/resources/${encodeURIComponent(resource.id)}" class="resource-share-link">open</a>
                    <button class="resource-share-btn" data-share-id="${resource.id}">share</button>
                </div>
            </div>
        `;
    }

    // Toggle favorite
    toggleFavorite(id) {
        const resource = this.resources.find(r => r.id === id);
        if (resource) {
            resource.favorite = !resource.favorite;
            this.saveResources();
            this.renderResources();
        }
    }

    // View resource details
    viewDetails(id) {
        const resource = this.resources.find(r => r.id === id);
        if (resource) {
            // Create and show modal with full details
            this.showResourceModal(resource);
        }
    }

    // Show resource modal
    showResourceModal(resource) {
        const modal = document.createElement('div');
        modal.className = 'resource-modal';
        modal.innerHTML = `
            <div class="resource-modal-content">
                <button class="modal-close" onclick="this.closest('.resource-modal').remove()">×</button>
                <h2>${resource.name}</h2>
                <a href="${resource.url}" target="_blank" class="resource-link">${resource.url}</a>
                
                <div class="resource-detail-grid">
                    <div>
                        <strong>Category:</strong> ${RESOURCE_CATEGORIES[resource.category]}
                    </div>
                    <div>
                        <strong>Quality Score:</strong> ${resource.qualityScore}/10
                    </div>
                    <div>
                        <strong>Reading Time:</strong> ${resource.readingTime} minutes
                    </div>
                    <div>
                        <strong>Difficulty:</strong> ${resource.difficulty}
                    </div>
                    <div>
                        <strong>Target Audience:</strong> ${resource.targetAudience || 'General'}
                    </div>
                    <div>
                        <strong>Date Added:</strong> ${new Date(resource.dateAdded).toLocaleDateString()}
                    </div>
                </div>
                
                <div class="resource-section">
                    <h3>Description</h3>
                    <p>${resource.description}</p>
                </div>
                
                ${resource.value ? `
                    <div class="resource-section">
                        <h3>Why This Is Valuable</h3>
                        <p>${resource.value}</p>
                    </div>
                ` : ''}
                
                ${resource.keyTakeaways && resource.keyTakeaways.length > 0 ? `
                    <div class="resource-section">
                        <h3>Key Takeaways</h3>
                        <ul>
                            ${resource.keyTakeaways.map(t => `<li>${t}</li>`).join('')}
                        </ul>
                    </div>
                ` : ''}
                
                <div class="resource-section">
                    <h3>Tags</h3>
                    <!-- Tags not in database schema
                    <div class="resource-tags">
                        ${resource.tags?.map(tag => `<span class="resource-tag">${tag}</span>`).join('') || ''}
                    </div>
                    -->
                </div>
                
                ${resource.notes ? `
                    <div class="resource-section">
                        <h3>Your Notes</h3>
                        <p>${resource.notes}</p>
                    </div>
                ` : ''}
            </div>
        `;
        document.body.appendChild(modal);
    }

    // Edit resource
    editResource(id) {
        const resource = this.resources.find(r => r.id === id);
        if (resource) {
            // Show edit form
            this.showEditForm(resource);
        }
    }

    // Delete resource
    deleteResource(id) {
        if (confirm('Are you sure you want to delete this resource?')) {
            this.resources = this.resources.filter(r => r.id !== id);
            this.saveResources();
            this.renderResources();
        }
    }

    // Show edit form
    showEditForm(resource) {
        const modal = document.createElement('div');
        modal.className = 'resource-modal';
        modal.innerHTML = `
            <div class="resource-modal-content">
                <button class="modal-close" onclick="this.closest('.resource-modal').remove()">×</button>
                <h2>Edit Resource</h2>
                
                <form id="edit-resource-form" onsubmit="resourceShelf.saveEdit(event, '${resource.id}')">
                    <div class="form-group">
                        <label>Title</label>
                        <input type="text" name="name" value="${resource.name}" required>
                    </div>
                    
                    <div class="form-group">
                        <label>Description</label>
                        <textarea name="description" rows="3" required>${resource.description}</textarea>
                    </div>
                    
                    <div class="form-group">
                        <label>Category</label>
                        <select name="category">
                            ${Object.entries(RESOURCE_CATEGORIES).map(([key, label]) => 
                                `<option value="${key}" ${resource.category === key ? 'selected' : ''}>${label}</option>`
                            ).join('')}
                        </select>
                    </div>
                    
                    <!-- Tags not in database schema
                    <div class="form-group" style="display:none;">
                        <label>Tags (comma separated)</label>
                        <input type="text" name="tags" value="${resource.tags?.join(', ') || ''}">
                    </div>
                    -->
                    
                    <div class="form-group">
                        <label>Quality Score (1-10)</label>
                        <input type="number" name="qualityScore" min="1" max="10" value="${resource.qualityScore}">
                    </div>
                    
                    <div class="form-group">
                        <label>Reading Time (minutes)</label>
                        <input type="number" name="readingTime" min="1" value="${resource.readingTime}">
                    </div>
                    
                    <div class="form-group">
                        <label>Your Notes</label>
                        <textarea name="notes" rows="3">${resource.notes || ''}</textarea>
                    </div>
                    
                    <button type="submit" class="save-btn">Save Changes</button>
                </form>
            </div>
        `;
        document.body.appendChild(modal);
    }

    // Save edit
    saveEdit(event, id) {
        event.preventDefault();
        const form = event.target;
        const resource = this.resources.find(r => r.id === id);
        
        if (resource) {
            resource.name = form.name.value;
            resource.description = form.description.value;
            resource.category = form.category.value;
            // resource.tags = form.tags.value.split(',').map(t => t.trim()).filter(Boolean); // Not in database schema
            resource.qualityScore = parseInt(form.qualityScore.value);
            resource.readingTime = parseInt(form.readingTime.value);
            resource.notes = form.notes.value;
            
            this.saveResources();
            this.renderResources();
            form.closest('.resource-modal').remove();
        }
    }
}

// Initialize Resource Shelf
const resourceShelf = new ResourceShelf();

// Export for use in other files
window.resourceShelf = resourceShelf;

// Deep-link for /resources/:id and share handling
document.addEventListener('DOMContentLoaded', () => {
    // Share buttons (event delegation)
    document.body.addEventListener('click', async (e) => {
        const shareBtn = e.target.closest('.resource-share-btn');
        if (shareBtn) {
            const id = shareBtn.getAttribute('data-share-id');
            const res = resourceShelf.resources.find(r => r.id === id);
            const url = window.location.origin + '/resources/' + encodeURIComponent(id);
            try {
                if (navigator.share) {
                    await navigator.share({ title: res?.name || 'Resource', text: res?.description || '', url });
                } else {
                    await navigator.clipboard.writeText(url);
                    shareBtn.textContent = 'copied!';
                    setTimeout(() => shareBtn.textContent = 'share', 1500);
                }
            } catch {}
        }
    });

    // Handle deep link
    const parts = window.location.pathname.split('/').filter(Boolean);
    if (parts[0] === 'resources' && parts[1]) {
        const id = decodeURIComponent(parts[1]);
        const renderDetails = (resource) => {
            if (!resource) return;
            // Reuse modal for details
            resourceShelf.showResourceModal(resource);
            // Add share to modal header
            const modal = document.querySelector('.resource-modal');
            const header = modal?.querySelector('h2');
            if (header) {
                const shareBtn = document.createElement('button');
                shareBtn.textContent = 'share';
                shareBtn.style.marginLeft = '0.5rem';
                shareBtn.addEventListener('click', async () => {
                    const shareUrl = window.location.origin + '/resources/' + encodeURIComponent(resource.id);
                    try {
                        if (navigator.share) {
                            await navigator.share({ title: resource.name, text: resource.description, url: shareUrl });
                        } else {
                            await navigator.clipboard.writeText(shareUrl);
                            shareBtn.textContent = 'copied!';
                            setTimeout(() => shareBtn.textContent = 'share', 1500);
                        }
                    } catch {}
                });
                header.after(shareBtn);
            }
        };

        // Try local cache first
        const localRes = resourceShelf.resources.find(r => r.id === id);
        if (localRes) {
            renderDetails(localRes);
        } else {
            // Try backend
            fetch(`/api/resources/${encodeURIComponent(id)}`)
                .then(r => r.ok ? r.json() : null)
                .then(resource => renderDetails(resource))
                .catch(() => {});
        }
    }
});