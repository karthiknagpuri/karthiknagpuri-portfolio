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
});