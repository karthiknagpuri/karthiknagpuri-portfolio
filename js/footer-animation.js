class FooterPixelAnimation {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.pixels = [];
        this.animationFrame = 0;
        this.waveOffset = 0;
        this.particlePool = [];
        
        if (this.container) {
            this.init();
        }
    }
    
    init() {
        this.createPixelGrid();
        this.createFloatingText();
        this.startAnimations();
        this.initMouseInteraction();
    }
    
    createPixelGrid() {
        const canvas = document.createElement('div');
        canvas.className = 'footer-pixel-canvas';
        
        // Create 32x18 grid for 16:9 aspect ratio
        const cols = window.innerWidth < 768 ? 16 : 32;
        const rows = window.innerWidth < 768 ? 9 : 18;
        
        for (let y = 0; y < rows; y++) {
            for (let x = 0; x < cols; x++) {
                const pixel = document.createElement('div');
                pixel.className = 'footer-pixel';
                pixel.dataset.x = x;
                pixel.dataset.y = y;
                canvas.appendChild(pixel);
                this.pixels.push(pixel);
            }
        }
        
        this.container.appendChild(canvas);
    }
    
    createFloatingText() {
        const textContainer = document.createElement('div');
        textContainer.className = 'pixel-text';
        
        const text = 'BUILD';
        text.split('').forEach(char => {
            const span = document.createElement('span');
            span.className = 'pixel-char';
            span.textContent = char;
            textContainer.appendChild(span);
        });
        
        this.container.appendChild(textContainer);
    }
    
    startAnimations() {
        // Wave animation
        this.animateWave();
        
        // Random star pixels
        this.animateStars();
        
        // Continuous animation loop
        this.animate();
    }
    
    animateWave() {
        setInterval(() => {
            this.waveOffset += 0.5;
            const cols = window.innerWidth < 768 ? 16 : 32;
            const rows = window.innerWidth < 768 ? 9 : 18;
            
            this.pixels.forEach(pixel => {
                const x = parseInt(pixel.dataset.x);
                const y = parseInt(pixel.dataset.y);
                
                // Create wave pattern at bottom
                if (y >= rows - 4) {
                    const waveHeight = Math.sin((x + this.waveOffset) * 0.3) * 2;
                    if (y >= rows - 2 - Math.abs(waveHeight)) {
                        pixel.classList.add('wave');
                        pixel.style.animationDelay = `${x * 0.05}s`;
                    } else {
                        pixel.classList.remove('wave');
                    }
                }
            });
        }, 100);
    }
    
    animateStars() {
        // Random twinkling stars
        setInterval(() => {
            // Clear old stars
            this.pixels.forEach(pixel => pixel.classList.remove('star'));
            
            // Add new random stars
            const starCount = 8;
            for (let i = 0; i < starCount; i++) {
                const randomPixel = this.pixels[Math.floor(Math.random() * this.pixels.length)];
                const y = parseInt(randomPixel.dataset.y);
                const rows = window.innerWidth < 768 ? 9 : 18;
                
                // Only add stars in upper portion
                if (y < rows - 5) {
                    randomPixel.classList.add('star');
                    randomPixel.style.animationDelay = `${Math.random() * 2}s`;
                }
            }
        }, 3000);
    }
    
    animate() {
        this.animationFrame++;
        
        // Create digital rain effect
        if (this.animationFrame % 30 === 0) {
            this.createDigitalRain();
        }
        
        // Create particle effects
        if (this.animationFrame % 60 === 0) {
            this.createParticle();
        }
        
        requestAnimationFrame(() => this.animate());
    }
    
    createDigitalRain() {
        const cols = window.innerWidth < 768 ? 16 : 32;
        const randomCol = Math.floor(Math.random() * cols);
        const rows = window.innerWidth < 768 ? 9 : 18;
        
        let delay = 0;
        for (let y = 0; y < rows - 4; y++) {
            setTimeout(() => {
                const pixel = this.pixels.find(p => 
                    parseInt(p.dataset.x) === randomCol && 
                    parseInt(p.dataset.y) === y
                );
                
                if (pixel) {
                    pixel.classList.add('active');
                    setTimeout(() => {
                        pixel.classList.remove('active');
                    }, 500);
                }
            }, delay);
            delay += 50;
        }
    }
    
    createParticle() {
        const particle = document.createElement('div');
        particle.className = 'pixel-particle';
        particle.style.left = `${Math.random() * 100}%`;
        particle.style.bottom = '10%';
        
        this.container.appendChild(particle);
        
        // Trigger animation
        setTimeout(() => {
            particle.classList.add('active');
        }, 10);
        
        // Remove after animation
        setTimeout(() => {
            if (particle.parentNode) {
                particle.parentNode.removeChild(particle);
            }
        }, 2000);
    }
    
    initMouseInteraction() {
        this.container.addEventListener('mousemove', (e) => {
            const rect = this.container.getBoundingClientRect();
            const x = (e.clientX - rect.left) / rect.width;
            const y = (e.clientY - rect.top) / rect.height;
            
            // Light up nearby pixels
            this.pixels.forEach(pixel => {
                const px = parseInt(pixel.dataset.x) / 32;
                const py = parseInt(pixel.dataset.y) / 18;
                
                const distance = Math.sqrt(Math.pow(px - x, 2) + Math.pow(py - y, 2));
                
                if (distance < 0.1) {
                    pixel.classList.add('active');
                    setTimeout(() => {
                        pixel.classList.remove('active');
                    }, 1000);
                }
            });
        });
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const footerAnimation = document.getElementById('footer-pixel-animation');
    if (footerAnimation) {
        new FooterPixelAnimation('footer-pixel-animation');
    }
});