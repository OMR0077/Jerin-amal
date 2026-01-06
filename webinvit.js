// Register ScrollTrigger plugin
gsap.registerPlugin(ScrollTrigger);

// All available background images for cycling
const backgroundImages = [
    'images/couple1.JPG', 'images/couple2.JPG', 'images/couple3.JPG',
    'images/couple4.JPG', 'images/couple5.JPG', 'images/couple6.JPG',
    'images/couple7.JPG', 'images/couple8.JPG', 'images/couple9.JPG',
    'images/couple10.JPG', 'images/couple11.JPG', 'images/couple12.JPG'
];

// Scroll tracking variables
let currentImageIndex = 0;
let lastScrollY = 0;
let scrollDirection = 'down';
let ticking = false;
let imagesReady = false;
let wheelTimeout;
let lastWheelTime = 0;

// Device responsiveness detection
const isMobile = () => window.innerWidth <= 768;
const isTablet = () => window.innerWidth > 768 && window.innerWidth <= 1024;
const isIOS = () => {
    return /iPad|iPhone|iPod/.test(navigator.userAgent) || 
           (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
};
const isSafari = () => /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent);

// Dynamic scroll sensitivity based on device
const getScrollStep = () => {
    if (isMobile()) return 20; // More sensitive on mobile
    if (isTablet()) return 25; // Medium sensitivity on tablet
    return 30; // Less sensitive on desktop for better control
};

// Preload images and setup responsive background changing
function preloadImages() {
    let loadedCount = 0;
    
    backgroundImages.forEach((src, index) => {
        const img = new Image();
        img.onload = () => {
            loadedCount++;
            if (loadedCount === backgroundImages.length) {
                imagesReady = true;
                console.log('All images preloaded successfully');
                setupScrollDetection();
            }
        };
        img.onerror = () => {
            loadedCount++;
            console.warn(`Failed to load image: ${src}`);
            if (loadedCount === backgroundImages.length) {
                imagesReady = true;
                setupScrollDetection();
            }
        };
        img.src = src;
    });
}

// Set responsive background properties
function setBackgroundProperties() {
    const mobile = isMobile();
    document.body.style.backgroundAttachment = mobile ? 'scroll' : 'fixed';
    document.body.style.backgroundSize = 'cover';
    document.body.style.backgroundPosition = 'center center';
    document.body.style.backgroundRepeat = 'no-repeat';
}

// Smooth background image transition
function changeBackgroundImage(imageUrl) {
    if (!imageUrl) return;
    
    // Add transition for smooth change
    document.body.style.transition = 'background-image 0.5s ease-in-out';
    document.body.style.backgroundImage = `url('${imageUrl}')`;
    
    // Reset transition after change
    setTimeout(() => {
        document.body.style.transition = '';
        setBackgroundProperties();
    }, 500);
}

// Handle scroll-based image changes with responsive sensitivity
function handleScrollChange() {
    if (!imagesReady) return;
    
    const scrollY = window.scrollY;
    const scrollDiff = Math.abs(scrollY - lastScrollY);
    const scrollStep = getScrollStep();
    
    // Determine scroll direction first
    scrollDirection = scrollY > lastScrollY ? 'down' : 'up';
    
    // Only change image if scroll difference exceeds threshold
    if (scrollDiff >= scrollStep) {
        console.log(`Scroll ${scrollDirection}: ${scrollY}, diff: ${scrollDiff}, step: ${scrollStep}`);
        
        // Calculate new image index
        if (scrollDirection === 'down') {
            currentImageIndex = (currentImageIndex + 1) % backgroundImages.length;
        } else {
            currentImageIndex = currentImageIndex === 0 
                ? backgroundImages.length - 1 
                : currentImageIndex - 1;
        }
        
        console.log(`New image index: ${currentImageIndex}, Image: ${backgroundImages[currentImageIndex]}`);
        
        // Change background image
        const newImage = backgroundImages[currentImageIndex];
        changeBackgroundImage(newImage);
        
        // Update last scroll position after image change
        lastScrollY = scrollY;
    }
}

// Setup scroll detection with proper throttling
function setupScrollDetection() {
    console.log('Setting up scroll detection...');
    
    // Initialize lastScrollY
    lastScrollY = window.scrollY;
    
    // Main scroll handler with improved detection
    window.addEventListener('scroll', () => {
        if (!ticking && imagesReady) {
            requestAnimationFrame(() => {
                handleScrollChange();
                ticking = false;
            });
            ticking = true;
        }
    }, { passive: true });
    
    // Additional wheel event for better scroll detection
    window.addEventListener('wheel', (e) => {
        if (!imagesReady) return;
        
        const now = Date.now();
        // Throttle wheel events to prevent too rapid changes
        if (now - lastWheelTime < 100) return;
        lastWheelTime = now;
        
        // Direct wheel direction detection
        if (Math.abs(e.deltaY) > 10) {
            if (e.deltaY > 0) {
                // Scrolling down
                currentImageIndex = (currentImageIndex + 1) % backgroundImages.length;
            } else {
                // Scrolling up
                currentImageIndex = currentImageIndex === 0 
                    ? backgroundImages.length - 1 
                    : currentImageIndex - 1;
            }
            
            console.log(`Wheel scroll: ${e.deltaY > 0 ? 'down' : 'up'}, New index: ${currentImageIndex}`);
            const newImage = backgroundImages[currentImageIndex];
            changeBackgroundImage(newImage);
        }
    }, { passive: true });
    
    // Touch support for mobile devices
    if (isMobile()) {
        let touchStartY = 0;
        
        document.addEventListener('touchstart', (e) => {
            touchStartY = e.touches[0].clientY;
        }, { passive: true });
        
        document.addEventListener('touchend', (e) => {
            const touchEndY = e.changedTouches[0].clientY;
            const touchDiff = Math.abs(touchStartY - touchEndY);
            
            if (touchDiff > 30) { // Reduced minimum swipe distance
                if (touchStartY > touchEndY) {
                    // Swipe up - next image
                    currentImageIndex = (currentImageIndex + 1) % backgroundImages.length;
                } else {
                    // Swipe down - previous image
                    currentImageIndex = currentImageIndex === 0 
                        ? backgroundImages.length - 1 
                        : currentImageIndex - 1;
                }
                
                console.log(`Touch swipe: ${touchStartY > touchEndY ? 'up' : 'down'}, New index: ${currentImageIndex}`);
                const newImage = backgroundImages[currentImageIndex];
                changeBackgroundImage(newImage);
            }
        }, { passive: true });
    }
}

// Wait for DOM to load
document.addEventListener('DOMContentLoaded', function() {
    
    // iOS-specific optimizations
    if (isIOS()) {
        // Add iOS-specific class for styling
        document.body.classList.add('ios-device');
        
        // Force hardware acceleration for better performance
        const sections = document.querySelectorAll('.section');
        sections.forEach(section => {
            section.style.webkitTransform = 'translate3d(0,0,0)';
            section.style.transform = 'translate3d(0,0,0)';
            section.style.webkitBackfaceVisibility = 'hidden';
            section.style.backfaceVisibility = 'hidden';
        });
        
        // Disable background-attachment fixed on iOS
        const photoSections = document.querySelectorAll('.photo1, .photo2, .photo3, .photo4, .photo5, .photo6, .photo7, .photo8, .photo9, .photo10, .photo11, .photo12');
        photoSections.forEach(section => {
            section.style.backgroundAttachment = 'scroll';
            section.style.webkitBackgroundSize = 'cover';
            section.style.backgroundSize = 'cover';
            section.style.backgroundPosition = 'center center';
            section.style.backgroundRepeat = 'no-repeat';
            section.style.minHeight = '100vh';
            section.style.height = '100vh';
            section.style.webkitTransform = 'translate3d(0,0,0)';
            section.style.transform = 'translate3d(0,0,0)';
        });
        
        // Ensure all sections have proper iOS styling
        const allSections = document.querySelectorAll('.section');
        allSections.forEach(section => {
            section.style.webkitOverflowScrolling = 'touch';
            section.style.webkitBackfaceVisibility = 'hidden';
            section.style.backfaceVisibility = 'hidden';
        });
        
        // Add viewport meta for proper iOS display
        const viewport = document.querySelector('meta[name="viewport"]');
        if (viewport) {
            viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, shrink-to-fit=no, viewport-fit=cover');
        }
    }
    
    // Initialize responsive background properties
    setBackgroundProperties();
    
    // Set initial background image
    document.body.style.backgroundImage = `url('${backgroundImages[0]}')`;
    
    // Start image preloading
    preloadImages();
    
    // Create GSAP animations for each section
    const sections = gsap.utils.toArray('.section');
    
    sections.forEach((section, index) => {
        const content = section.querySelector('.content');
        const animateElements = section.querySelectorAll('.animate-text, h1, h2, h3, p, .date, .detail-item');
        
        // Create timeline for this section
        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: section,
                start: "top 80%",
                end: "bottom 20%",
                toggleActions: "play none none reverse",
                once: false,
            }
        });
        
        // Animate content container first
        if (content) {
            tl.fromTo(content, 
                {
                    opacity: 0,
                    y: 60,
                    scale: 0.95
                },
                {
                    opacity: 1,
                    y: 0,
                    scale: 1,
                    duration: 0.8,
                    ease: "power2.out"
                }
            );
        }
        
        // Animate individual elements with stagger
        if (animateElements.length > 0) {
            tl.fromTo(animateElements, 
                {
                    opacity: 0,
                    y: 30
                },
                {
                    opacity: 1,
                    y: 0,
                    duration: 0.6,
                    stagger: 0.1,
                    ease: "power2.out"
                },
                "-=0.4"
            );
        }
    });
    
    // Parallax effect for background images (desktop only)
    if (!isMobile()) {
        gsap.utils.toArray('.section').forEach(section => {
            gsap.to(section, {
                backgroundPosition: "50% 100%",
                ease: "none",
                scrollTrigger: {
                    trigger: section,
                    start: "top bottom",
                    end: "bottom top",
                    scrub: true
                }
            });
        });
    }
    
    // Hide scroll indicator after first scroll
    let scrollIndicatorHidden = false;
    window.addEventListener('scroll', function() {
        if (!scrollIndicatorHidden && window.scrollY > (isMobile() ? 50 : 100)) {
            const indicator = document.querySelector('.scroll-indicator');
            if (indicator) {
                gsap.to(indicator, {
                    opacity: 0,
                    duration: 0.5,
                    ease: "power2.out"
                });
            }
            scrollIndicatorHidden = true;
        }
    });
    
    // Smooth scroll for internal links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
    
    // Handle window resize for responsiveness
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            setBackgroundProperties();
            ScrollTrigger.refresh();
        }, 250);
    });
    
    // Add loading class for initial animations
    document.body.classList.add('loaded');
});