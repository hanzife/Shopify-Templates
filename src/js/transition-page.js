/* ==========================================================
   ROBUST JACKET CLICK HANDLER & TRIANGLE TRANSITION
   ========================================================== */
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

    // 2. Listen for clicks on any jacket image or slot
    window.addEventListener('click', function (e) {
        const slot = e.target.closest('.jacket-slot') || e.target.closest('.jacket-image');
        if (!slot) return;

        e.preventDefault();
        e.stopPropagation();

        // Find which jacket was clicked
        const slotsArray = Array.from(document.querySelectorAll('.jacket-slot'));
        // Find the parent slot if they clicked the image directly
        const targetSlot = e.target.closest('.jacket-slot');
        const jacketIndex = slotsArray.indexOf(targetSlot) + 1;
        
        const targetUrl = `product.html?jacket=${jacketIndex || 1}`; 

        overlay.classList.add('is-active');

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
                    fetch(targetUrl)
                        .then(response => response.text())
                        .then(html => {
                            const parser = new DOMParser();
                            const doc = parser.parseFromString(html, 'text/html');
                            
                            document.body.innerHTML = doc.body.innerHTML;
                            window.history.pushState({}, '', targetUrl);
                            window.scrollTo(0, 0);

                            gsap.to(triangles, {
                                opacity: 0,
                                scale: 0,
                                duration: 0.4,
                                stagger: {
                                    each: 0.003,
                                    from: "random"
                                },
                                ease: "power2.inOut",
                                onComplete: () => {
                                    overlay.classList.remove('is-active');
                                    location.reload();
                                }
                            });
                        })
                        .catch(err => {
                            window.location.href = targetUrl;
                        });
                }
            }
        );
    }, true); // Use capture phase to ensure it catches the click before GSAP/ScrollTrigger blocks it
})();