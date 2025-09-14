// Blog functionality
document.addEventListener('DOMContentLoaded', () => {
    // Filter functionality
    const filterTags = document.querySelectorAll('.filter-tag');
    const blogPosts = document.querySelectorAll('.blog-post');
    
    filterTags.forEach(tag => {
        tag.addEventListener('click', () => {
            // Remove active class from all tags
            filterTags.forEach(t => t.classList.remove('active'));
            // Add active class to clicked tag
            tag.classList.add('active');
            
            const filter = tag.getAttribute('data-filter');
            
            // Show/hide posts based on filter
            blogPosts.forEach(post => {
                if (filter === 'all') {
                    post.classList.remove('hidden');
                } else {
                    const postTags = post.getAttribute('data-tags').split(',');
                    if (postTags.includes(filter)) {
                        post.classList.remove('hidden');
                    } else {
                        post.classList.add('hidden');
                    }
                }
            });
        });
    });
    
    // Newsletter form
    const newsletterForm = document.getElementById('newsletter-form');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = e.target.querySelector('input[type="email"]').value;
            
            // Store in localStorage (in real app, send to backend)
            const subscribers = JSON.parse(localStorage.getItem('newsletter_subscribers') || '[]');
            if (!subscribers.includes(email)) {
                subscribers.push(email);
                localStorage.setItem('newsletter_subscribers', JSON.stringify(subscribers));
                
                // Show success message
                const button = e.target.querySelector('button');
                const originalText = button.textContent;
                button.textContent = 'subscribed!';
                button.style.background = 'var(--success)';
                
                // Reset form
                e.target.reset();
                
                // Reset button after 3 seconds
                setTimeout(() => {
                    button.textContent = originalText;
                    button.style.background = '';
                }, 3000);
            } else {
                // Already subscribed
                const button = e.target.querySelector('button');
                const originalText = button.textContent;
                button.textContent = 'already subscribed';
                button.style.background = 'var(--warning)';
                
                setTimeout(() => {
                    button.textContent = originalText;
                    button.style.background = '';
                }, 3000);
            }
        });
    }
    
    // Simulate view count increment
    const postViews = document.querySelectorAll('.post-views');
    postViews.forEach(view => {
        const currentViews = view.textContent;
        const viewCount = parseFloat(currentViews);
        const unit = currentViews.includes('k') ? 'k' : '';
        
        // Randomly increment views (in real app, this would be server-side)
        const newViews = viewCount + Math.random() * 0.1;
        view.textContent = newViews.toFixed(1) + unit + ' views';
    });
    // Deep-link handling for /blog/:slug and share button
    const pathParts = window.location.pathname.split('/').filter(Boolean);
    const slug = pathParts[0] === 'blog' && pathParts[1] ? decodeURIComponent(pathParts[1]) : null;

    if (slug) {
        // Try fetching blog by slug from backend if available
        fetch(`/api/blogs/${encodeURIComponent(slug)}`)
            .then(r => r.ok ? r.json() : null)
            .then(blog => {
                if (!blog) return;
                const container = document.getElementById('blog-posts');
                if (!container) return;
                container.innerHTML = '';
                const article = document.createElement('article');
                article.className = 'blog-post';
                article.innerHTML = `
                    <div class="post-header">
                        <h2 class="post-title">${blog.title}</h2>
                        <div class="post-meta">
                            <span class="post-date">${new Date(blog.date || blog.created_at || Date.now()).toLocaleDateString()}</span>
                            ${blog.read_time ? `<span class="post-read-time">${blog.read_time} min read</span>` : ''}
                        </div>
                    </div>
                    <p class="post-excerpt">${blog.excerpt || ''}</p>
                    ${blog.content ? `<div class="post-content">${blog.content}</div>` : ''}
                    <div style="margin-top:1rem;display:flex;gap:.5rem;">
                        <button id="share-blog-btn" style="padding:.4rem .6rem;">share</button>
                        <a href="/blog" style="padding:.4rem .6rem;">all posts</a>
                    </div>
                `;
                container.appendChild(article);

                const shareBtn = document.getElementById('share-blog-btn');
                if (shareBtn) {
                    shareBtn.addEventListener('click', async () => {
                        const shareData = {
                            title: blog.title,
                            text: blog.excerpt || blog.title,
                            url: window.location.origin + `/blog/${blog.slug || slug}`
                        };
                        try {
                            if (navigator.share) {
                                await navigator.share(shareData);
                            } else {
                                await navigator.clipboard.writeText(shareData.url);
                                shareBtn.textContent = 'copied!';
                                setTimeout(() => shareBtn.textContent = 'share', 1500);
                            }
                        } catch {}
                    });
                }
            })
            .catch(() => {});
    }
});