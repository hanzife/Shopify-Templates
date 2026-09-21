(function () {
    const header = document.getElementById('siteHeader');
    if (!header) return;

    // 1. Scroll Depth Glass Blur Trigger (5% or 40px)
    window.addEventListener('scroll', () => {
        if (window.scrollY > 40) {
            header.classList.add('is-scrolled');
        } else {
            header.classList.remove('is-scrolled');
        }
    }, { passive: true });

    // 2. Precise Dark/Light Section Detector via Intersection Observer
    const darkSections = document.querySelectorAll('.jacket-reveal, [data-theme="dark"], .dark-section');
    
    if (darkSections.length > 0) {
        const observerOptions = {
            root: null,
            rootMargin: '-70px 0px -80% 0px',
            threshold: 0
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    header.classList.add('is-dark');
                } else {
                    header.classList.remove('is-dark');
                }
            });
        }, observerOptions);

        darkSections.forEach(section => observer.observe(section));
    }
})();