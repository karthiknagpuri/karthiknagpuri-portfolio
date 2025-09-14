// Image protection and button functionality
document.addEventListener('DOMContentLoaded', () => {
    // Protect the zero image from downloading
    const zeroImage = document.querySelector('.zero-image');
    const imageContainer = document.querySelector('.zero-image-container');
    const animationTrigger = document.querySelector('.animation-trigger');
    
    if (zeroImage) {
        // Disable right-click context menu on image
        zeroImage.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            return false;
        });
        
        // Prevent dragging
        zeroImage.addEventListener('dragstart', (e) => {
            e.preventDefault();
            return false;
        });
        
        // Prevent selection
        zeroImage.addEventListener('selectstart', (e) => {
            e.preventDefault();
            return false;
        });
        
        // Prevent saving via keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            // Prevent Ctrl+S / Cmd+S
            if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                e.preventDefault();
                return false;
            }
            // Prevent Ctrl+A / Cmd+A when image is in focus
            if ((e.ctrlKey || e.metaKey) && e.key === 'a') {
                const selection = window.getSelection();
                if (selection.anchorNode && imageContainer.contains(selection.anchorNode)) {
                    e.preventDefault();
                    return false;
                }
            }
        });
    }
    
    if (imageContainer) {
        // Disable right-click on the container overlay
        imageContainer.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            return false;
        });
        
        // Prevent pointer events from reaching the image
        imageContainer.addEventListener('mousedown', (e) => {
            if (e.target.classList.contains('zero-image')) {
                e.preventDefault();
                return false;
            }
        });
    }
    
    // Animation trigger button functionality
    if (animationTrigger) {
        animationTrigger.addEventListener('click', () => {
            // Simple visual feedback for the transformation
            if (zeroImage) {
                zeroImage.style.transition = 'transform 1s ease-in-out, opacity 0.5s ease-in-out';
                zeroImage.style.transform = 'rotate(360deg) scale(1.1)';
                zeroImage.style.opacity = '0.7';
                
                setTimeout(() => {
                    zeroImage.style.transform = 'rotate(720deg) scale(1)';
                    zeroImage.style.opacity = '0.9';
                }, 1000);
                
                setTimeout(() => {
                    zeroImage.style.transform = 'rotate(0deg) scale(1)';
                }, 2000);
            }
            
            // Update button text temporarily
            const originalText = animationTrigger.textContent;
            animationTrigger.textContent = '∞ achieved';
            animationTrigger.disabled = true;
            
            setTimeout(() => {
                animationTrigger.textContent = originalText;
                animationTrigger.disabled = false;
            }, 3000);
        });
    }
    
    // Additional protection: disable dev tools on the image (optional, can be aggressive)
    if (imageContainer) {
        imageContainer.addEventListener('keydown', (e) => {
            // Disable F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+Shift+C
            if (e.key === 'F12' || 
                ((e.ctrlKey || e.metaKey) && e.shiftKey && ['I', 'J', 'C'].includes(e.key))) {
                e.preventDefault();
                return false;
            }
        });
    }
});