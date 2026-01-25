document.addEventListener('DOMContentLoaded', function() {
    // Create lightbox elements
    const lightbox = document.createElement('div');
    lightbox.id = 'lightbox';
    lightbox.className = 'lightbox';
    
    const closeBtn = document.createElement('span');
    closeBtn.className = 'lightbox-close';
    closeBtn.innerHTML = '&times;';
    
    const lightboxImg = document.createElement('img');
    lightboxImg.className = 'lightbox-content';
    lightboxImg.id = 'lightbox-img';
    
    lightbox.appendChild(closeBtn);
    lightbox.appendChild(lightboxImg);
    document.body.appendChild(lightbox);
    
    // Select all images in the flip cards
    const galleryImages = document.querySelectorAll('.flip-card-back img');
    
    galleryImages.forEach(img => {
        img.addEventListener('click', function(e) {
            // Stop propagation so the card doesn't try to do anything else (though flipping is hover-based)
            e.stopPropagation();
            
            lightbox.style.display = 'block';
            // Slight delay to allow display:block to apply before changing opacity for transition
            setTimeout(() => {
                lightbox.classList.add('show');
            }, 10);
            
            lightboxImg.src = this.src;
            lightboxImg.alt = this.alt;
        });
    });
    
    // Close lightbox on click
    closeBtn.addEventListener('click', function() {
        closeLightbox();
    });
    
    // Close on click outside image
    lightbox.addEventListener('click', function(e) {
        if (e.target === lightbox) {
            closeLightbox();
        }
    });

    // Close on Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && lightbox.style.display === 'block') {
            closeLightbox();
        }
    });
    
    function closeLightbox() {
        lightbox.classList.remove('show');
        setTimeout(() => {
            lightbox.style.display = 'none';
        }, 300); // Match transition duration
    }
});

// Scroll Reveal Animation
document.addEventListener('DOMContentLoaded', function() {
    const reveals = document.querySelectorAll('.reveal-fade-up');

    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                observer.unobserve(entry.target); // Only animate once
            }
        });
    }, {
        root: null,
        threshold: 0.15, // Trigger when 15% of the element is visible
        rootMargin: '0px 0px -50px 0px' 
    });

    reveals.forEach(element => {
        revealObserver.observe(element);
    });
});

