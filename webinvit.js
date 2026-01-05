// Register ScrollTrigger plugin
gsap.registerPlugin(ScrollTrigger);

// Define image sets for each section
const sectionImages = {
    hero: ['images/couple1.JPG', 'images/couple2.JPG', 'images/couple3.JPG'],
    'love-story': ['images/couple2.JPG', 'images/couple4.JPG', 'images/couple5.JPG'],
    photo1: ['images/couple3.JPG', 'images/couple6.JPG', 'images/couple7.JPG'],
    photo2: ['images/couple4.JPG', 'images/couple8.JPG', 'images/couple9.JPG'],
    photo3: ['images/couple5.JPG', 'images/couple10.JPG', 'images/couple11.JPG'],
    photo4: ['images/couple6.JPG', 'images/couple12.JPG', 'images/couple1.JPG'],
    photo5: ['images/couple7.JPG', 'images/couple2.JPG', 'images/couple3.JPG'],
    photo6: ['images/couple8.JPG', 'images/couple4.JPG', 'images/couple5.JPG'],
    photo7: ['images/couple9.JPG', 'images/couple6.JPG', 'images/couple7.JPG'],
    photo8: ['images/couple10.JPG', 'images/couple8.JPG', 'images/couple9.JPG'],
    photo9: ['images/couple11.JPG', 'images/couple10.JPG', 'images/couple11.JPG'],
    photo10: ['images/couple12.JPG', 'images/couple1.JPG', 'images/couple2.JPG'],
    photo11: ['images/couple1.JPG', 'images/couple3.JPG', 'images/couple4.JPG'],
    photo12: ['images/couple2.JPG', 'images/couple5.JPG', 'images/couple6.JPG'],
    'wedding-details': ['images/couple3.JPG', 'images/couple7.JPG', 'images/couple8.JPG'],
    closing: ['images/couple4.JPG', 'images/couple9.JPG', 'images/couple10.JPG']
};

let currentImageIndices = {};
let lastScrollY = 0;
let scrollDirection = 'down';

// Initialize current image indices
Object.keys(sectionImages).forEach(sectionClass => {
    currentImageIndices[sectionClass] = 0;
});

// Smooth background image transition function
function changeBackgroundImage(section, imageUrl, callback) {
    // Add transitioning class for smooth overlay effect
    section.classList.add('transitioning');
    
    // Create a new image to preload
    const img = new Image();
    img.onload = function() {
        // Change background with CSS transition
        section.style.backgroundImage = `url('${imageUrl}')`;
        
        // Remove transitioning class after a short delay
        setTimeout(() => {
            section.classList.remove('transitioning');
            if (callback) callback();
        }, 300);
    };
    img.src = imageUrl;
}

// Handle scroll-based image changes
function handleScrollImageChange(section, sectionClass) {
    const images = sectionImages[sectionClass];
    if (!images || images.length === 0) return;
    
    let newIndex;
    if (scrollDirection === 'down') {
        // Next image
        newIndex = (currentImageIndices[sectionClass] + 1) % images.length;
    } else {
        // Previous image  
        newIndex = currentImageIndices[sectionClass] - 1;
        if (newIndex < 0) newIndex = images.length - 1;
    }
    
    if (newIndex !== currentImageIndices[sectionClass]) {
        currentImageIndices[sectionClass] = newIndex;
        const newImage = images[newIndex];
        changeBackgroundImage(section, newImage);
    }
}

// Detect scroll direction
function updateScrollDirection() {
    const currentScrollY = window.scrollY;
    scrollDirection = currentScrollY > lastScrollY ? 'down' : 'up';
    lastScrollY = currentScrollY;
}

// Wait for DOM to load
document.addEventListener('DOMContentLoaded', function() {
    
    // Create animation timeline for each section
    const sections = gsap.utils.toArray('.section');
    
    sections.forEach((section, index) => {
        const animateElements = section.querySelectorAll('.animate-text');
        const sectionClass = section.classList[1]; // Get second class name (hero, love-story, etc.)
        
        // Create timeline for this section
        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: section,
                start: "top 80%",
                end: "bottom 20%",
                toggleActions: "play none none none",
                once: true, // Animation runs only once
                onEnter: () => {
                    // Change background image when section enters viewport
                    updateScrollDirection();
                    handleScrollImageChange(section, sectionClass);
                },
                onLeave: () => {
                    // Optionally change image when leaving
                    updateScrollDirection();
                },
                onEnterBack: () => {
                    // Change image when scrolling back up
                    updateScrollDirection();
                    handleScrollImageChange(section, sectionClass);
                }
            }
        });
        
        // Animate each element in the section
        animateElements.forEach((element, elementIndex) => {
            tl.fromTo(element, 
                {
                    opacity: 0,
                    y: 50
                },
                {
                    opacity: 1,
                    y: 0,
                    duration: 1,
                    ease: "power2.out"
                },
                elementIndex * 0.2 // Stagger animations
            );
        });
    });
    
    // Parallax effect for background images (desktop only)
    if (window.innerWidth > 768) {
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
    let scrolled = false;
    window.addEventListener('scroll', function() {
        updateScrollDirection();
        
        if (!scrolled && window.scrollY > 100) {
            gsap.to('.scroll-indicator', {
                opacity: 0,
                duration: 0.5,
                ease: "power2.out"
            });
            scrolled = true;
        }
    });
    
    // Advanced scroll-based image cycling
    let ticking = false;
    window.addEventListener('scroll', function() {
        if (!ticking) {
            requestAnimationFrame(() => {
                updateScrollDirection();
                
                // Check which section is most visible and potentially change its image
                sections.forEach(section => {
                    const rect = section.getBoundingClientRect();
                    const isVisible = rect.top < window.innerHeight && rect.bottom > 0;
                    const visiblePercentage = Math.max(0, Math.min(1, 
                        (window.innerHeight - Math.max(0, rect.top)) / window.innerHeight
                    ));
                    
                    // Change image when section is significantly visible and user scrolls
                    if (isVisible && visiblePercentage > 0.3 && Math.abs(window.scrollY - lastScrollY) > 50) {
                        const sectionClass = section.classList[1];
                        if (Math.random() > 0.7) { // Add some randomness to avoid too frequent changes
                            handleScrollImageChange(section, sectionClass);
                        }
                    }
                });
                
                ticking = false;
            });
            ticking = true;
        }
    });
    
    // Smooth scroll for any internal links (if added)
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
    
    // Refresh ScrollTrigger on window resize
    window.addEventListener('resize', () => {
        ScrollTrigger.refresh();
    });
});