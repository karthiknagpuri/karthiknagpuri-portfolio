// Global Search Functionality with Ctrl+K

// Search data - in production, this would come from a backend
const searchData = {
    posts: [
        { title: 'Building Founder-First Ecosystems', type: 'blog', url: '/blog.html#building-founder-first-ecosystems', tags: ['ecosystem', 'startups'] },
        { title: 'Zero to One: My Startup Journey', type: 'blog', url: '/blog.html#zero-to-one', tags: ['personal', 'startups'] },
        { title: 'AI in Indian Startups: The Reality', type: 'blog', url: '/blog.html#ai-in-indian-startups', tags: ['ai', 'technology'] },
        { title: 'Community Building at Scale', type: 'blog', url: '/blog.html#community-building-at-scale', tags: ['ecosystem', 'community'] },
        { title: 'The Feedbuzz Story', type: 'blog', url: '/blog.html#feedbuzz-story', tags: ['technology', 'startups'] }
    ],
    projects: [
        { title: 'Feedbuzz', type: 'project', url: '/#feedbuzz', description: 'Modern content platform' },
        { title: 'EvolveX', type: 'project', url: '/#evolvex', description: 'Startup ecosystem builder' },
        { title: 'Nexteen', type: 'project', url: '/#nexteen', description: 'Next-gen tech solutions' },
        { title: 'CodingCubs', type: 'project', url: '/#codingcubs', description: 'Tech community platform' }
    ],
    commands: [
        { title: 'help', type: 'command', description: 'Show all commands' },
        { title: 'about', type: 'command', description: 'Learn about me' },
        { title: 'projects', type: 'command', description: 'View all projects' },
        { title: 'contact', type: 'command', description: 'Get in touch' },
        { title: 'theme', type: 'command', description: 'Change theme' },
        { title: 'matrix', type: 'command', description: 'Enter the matrix' }
    ],
    pages: [
        { title: 'Home', type: 'page', url: '/', description: 'Main portfolio page' },
        { title: 'Blog', type: 'page', url: '/blog.html', description: 'Thoughts and writings' },
        { title: 'Resources', type: 'page', url: '/resources.html', description: 'Curated resources' }
    ]
};

class GlobalSearch {
    constructor() {
        this.overlay = null;
        this.searchInput = null;
        this.resultsContainer = null;
        this.isOpen = false;
        this.selectedIndex = -1;
        this.results = [];
        
        this.init();
    }
    
    init() {
        this.createSearchOverlay();
        this.bindKeyboardShortcuts();
    }
    
    createSearchOverlay() {
        // Create search overlay HTML
        const overlayHTML = `
            <div class="search-overlay" id="global-search-overlay">
                <div class="search-box">
                    <div class="search-header">
                        <input type="text" id="global-search-input" placeholder="Search posts, projects, commands, or pages..." autocomplete="off">
                        <span class="search-icon">🔍</span>
                    </div>
                    <div class="search-results" id="global-search-results"></div>
                    <div class="search-footer">
                        <span class="search-hint">↑↓ to navigate</span>
                        <span class="search-hint">Enter to select</span>
                        <span class="search-hint">ESC to close</span>
                    </div>
                </div>
            </div>
        `;
        
        // Add to body if not already present
        if (!document.getElementById('global-search-overlay')) {
            document.body.insertAdjacentHTML('beforeend', overlayHTML);
        }
        
        this.overlay = document.getElementById('global-search-overlay');
        this.searchInput = document.getElementById('global-search-input');
        this.resultsContainer = document.getElementById('global-search-results');
        
        // Bind search input events
        if (this.searchInput) {
            this.searchInput.addEventListener('input', (e) => this.handleSearch(e.target.value));
            this.searchInput.addEventListener('keydown', (e) => this.handleKeyNavigation(e));
        }
    }
    
    bindKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl+K or Cmd+K to open search
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                this.toggle();
            }
            
            // ESC to close
            if (e.key === 'Escape' && this.isOpen) {
                this.close();
            }
        });
    }
    
    toggle() {
        if (this.isOpen) {
            this.close();
        } else {
            this.open();
        }
    }
    
    open() {
        if (!this.overlay) return;
        
        this.overlay.classList.add('active');
        this.isOpen = true;
        this.searchInput.value = '';
        this.searchInput.focus();
        this.handleSearch('');
        
        // Prevent body scroll
        document.body.style.overflow = 'hidden';
    }
    
    close() {
        if (!this.overlay) return;
        
        this.overlay.classList.remove('active');
        this.isOpen = false;
        this.selectedIndex = -1;
        this.results = [];
        
        // Restore body scroll
        document.body.style.overflow = '';
    }
    
    handleSearch(query) {
        if (!query) {
            this.showDefaultResults();
            return;
        }
        
        const lowerQuery = query.toLowerCase();
        this.results = [];
        
        // Search through all data
        Object.keys(searchData).forEach(category => {
            searchData[category].forEach(item => {
                const titleMatch = item.title.toLowerCase().includes(lowerQuery);
                const descMatch = item.description && item.description.toLowerCase().includes(lowerQuery);
                const tagMatch = item.tags && item.tags.some(tag => tag.includes(lowerQuery));
                
                if (titleMatch || descMatch || tagMatch) {
                    this.results.push({ ...item, category });
                }
            });
        });
        
        this.displayResults();
    }
    
    showDefaultResults() {
        // Show recent or popular items when search is empty
        this.results = [
            ...searchData.posts.slice(0, 2).map(p => ({ ...p, category: 'posts' })),
            ...searchData.projects.slice(0, 2).map(p => ({ ...p, category: 'projects' })),
            ...searchData.commands.slice(0, 3).map(c => ({ ...c, category: 'commands' }))
        ];
        
        this.displayResults(true);
    }
    
    displayResults(isDefault = false) {
        if (!this.resultsContainer) return;
        
        if (this.results.length === 0 && !isDefault) {
            this.resultsContainer.innerHTML = `
                <div class="search-no-results">
                    No results found for your search.
                </div>
            `;
            return;
        }
        
        const resultsHTML = this.results.map((result, index) => {
            const icon = this.getIconForType(result.type);
            const isSelected = index === this.selectedIndex;
            
            return `
                <div class="search-result ${isSelected ? 'selected' : ''}" data-index="${index}">
                    <span class="search-result-icon">${icon}</span>
                    <div class="search-result-content">
                        <div class="search-result-title">${result.title}</div>
                        ${result.description ? `<div class="search-result-desc">${result.description}</div>` : ''}
                    </div>
                    <span class="search-result-type">${result.type}</span>
                </div>
            `;
        }).join('');
        
        this.resultsContainer.innerHTML = isDefault 
            ? `<div class="search-suggestions-label">Suggestions</div>${resultsHTML}`
            : resultsHTML;
        
        // Add click handlers
        this.resultsContainer.querySelectorAll('.search-result').forEach((el, index) => {
            el.addEventListener('click', () => this.selectResult(index));
            el.addEventListener('mouseenter', () => {
                this.selectedIndex = index;
                this.updateSelection();
            });
        });
    }
    
    getIconForType(type) {
        const icons = {
            blog: '📝',
            project: '🚀',
            command: '⚡',
            page: '📄'
        };
        return icons[type] || '📌';
    }
    
    handleKeyNavigation(e) {
        if (!this.results.length) return;
        
        switch(e.key) {
            case 'ArrowDown':
                e.preventDefault();
                this.selectedIndex = (this.selectedIndex + 1) % this.results.length;
                this.updateSelection();
                break;
                
            case 'ArrowUp':
                e.preventDefault();
                this.selectedIndex = this.selectedIndex <= 0 
                    ? this.results.length - 1 
                    : this.selectedIndex - 1;
                this.updateSelection();
                break;
                
            case 'Enter':
                e.preventDefault();
                if (this.selectedIndex >= 0) {
                    this.selectResult(this.selectedIndex);
                }
                break;
        }
    }
    
    updateSelection() {
        this.resultsContainer.querySelectorAll('.search-result').forEach((el, index) => {
            if (index === this.selectedIndex) {
                el.classList.add('selected');
                el.scrollIntoView({ block: 'nearest' });
            } else {
                el.classList.remove('selected');
            }
        });
    }
    
    selectResult(index) {
        const result = this.results[index];
        if (!result) return;
        
        if (result.type === 'command') {
            // Execute command in terminal
            const terminalInput = document.getElementById('terminal-input');
            if (terminalInput) {
                terminalInput.value = result.title;
                terminalInput.focus();
                // Trigger enter key
                const event = new KeyboardEvent('keypress', { key: 'Enter' });
                terminalInput.dispatchEvent(event);
            }
            this.close();
        } else if (result.url) {
            // Navigate to URL
            window.location.href = result.url;
        }
    }
}

// Add styles for search
const searchStyles = `
<style>
.search-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.95);
    display: none;
    align-items: flex-start;
    justify-content: center;
    padding-top: 10vh;
    z-index: 10000;
    backdrop-filter: blur(5px);
}

.search-overlay.active {
    display: flex;
}

.search-box {
    background: var(--bg-darker);
    border: 1px solid var(--accent);
    border-radius: 12px;
    width: 90%;
    max-width: 650px;
    max-height: 70vh;
    display: flex;
    flex-direction: column;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
}

.search-header {
    position: relative;
    padding: 1.5rem;
    border-bottom: 1px solid var(--border);
}

.search-icon {
    position: absolute;
    right: 1.5rem;
    top: 50%;
    transform: translateY(-50%);
    font-size: 1.2rem;
    opacity: 0.5;
}

#global-search-input {
    width: 100%;
    background: transparent;
    border: none;
    color: var(--text);
    font-size: 1.3rem;
    font-family: var(--font-mono);
    outline: none;
}

.search-results {
    flex: 1;
    overflow-y: auto;
    padding: 0.5rem;
    max-height: 400px;
}

.search-suggestions-label {
    padding: 0.5rem 1rem;
    color: var(--text-secondary);
    font-size: 0.85rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
}

.search-result {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 0.8rem 1rem;
    margin-bottom: 0.25rem;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.15s ease;
}

.search-result:hover,
.search-result.selected {
    background: var(--border);
}

.search-result-icon {
    font-size: 1.2rem;
}

.search-result-content {
    flex: 1;
}

.search-result-title {
    color: var(--text);
    font-size: 0.95rem;
    font-weight: 500;
}

.search-result-desc {
    color: var(--text-secondary);
    font-size: 0.85rem;
    margin-top: 0.2rem;
}

.search-result-type {
    background: var(--bg);
    color: var(--text-secondary);
    padding: 0.2rem 0.6rem;
    border-radius: 12px;
    font-size: 0.75rem;
    text-transform: uppercase;
}

.search-footer {
    display: flex;
    gap: 1.5rem;
    justify-content: center;
    padding: 1rem;
    border-top: 1px solid var(--border);
}

.search-hint {
    color: var(--text-secondary);
    font-size: 0.8rem;
}

.search-no-results {
    text-align: center;
    padding: 3rem;
    color: var(--text-secondary);
}

/* Animations */
@keyframes slideDown {
    from {
        opacity: 0;
        transform: translateY(-20px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.search-overlay.active .search-box {
    animation: slideDown 0.2s ease;
}
</style>
`;

// Add styles to head
document.head.insertAdjacentHTML('beforeend', searchStyles);

// Initialize search when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.globalSearch = new GlobalSearch();
});