(function () {
    'use strict';

    // 1. Create the overlay container dynamically if it doesn't exist
    let overlay = document.getElementById('transitionOverlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'transitionOverlay';
        for (let i = 0; i < 144; i++) {
            const tri = document.createElement('div');
            tri.className = 'transition-triangle';
            overlay.appendChild(tri);
        }
        document.body.appendChild(overlay);
    }

    const triangles = overlay.querySelectorAll('.transition-triangle');

    // 2. Listen for clicks on any jacket slot or image link
    window.addEventListener('click', function (e) {
        const slot = e.target.closest('.jacket-slot') || e.target.closest('.jacket-image');
        if (!slot) return;

        const link = slot.querySelector('a') || slot.closest('a');
        if (!link || !link.href) return;

        e.preventDefault();
        e.stopPropagation();

        const targetUrl = link.href;

        overlay.classList.add('is-active');

        // Play the triangle opening animation
        gsap.fromTo(triangles, 
            { opacity: 0, scale: 0 },
            {
                opacity: 1,
                scale: 1.4,
                duration: 0.4,
                stagger: {
                    each: 0.003,
                    from: "random"
                },
                ease: "power2.inOut",
                onComplete: () => {
                    // Smoothly navigate to the actual Shopify product page once animation completes
                    window.location.href = targetUrl;
                }
            }
        );
    }, true);
})();