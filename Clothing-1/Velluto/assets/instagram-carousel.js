(function () {
    const section = document.querySelector("#instagramSection");
    const carousel = document.querySelector("#instagramCarousel");
    const track = document.querySelector("#instagramTrack");

    if (!section || !carousel || !track) return;

    const firstGroup = track.querySelector(".instagram-group");

    let groupWidth = 0;
    let currentX = 0;
    let isHovering = false;
    let scrollDirection = 1;
    let autoTween = null;

    function measure() {
        groupWidth = firstGroup.getBoundingClientRect().width + 10;
        gsap.set(track, { x: -groupWidth });
        currentX = -groupWidth;
    }

    function startCarousel() {
        if (autoTween) autoTween.kill();

        autoTween = gsap.to(track, {
            x: () => scrollDirection === 1 ? 0 : -groupWidth * 2,
            duration: 45,
            ease: "none",
            repeat: -1,
            modifiers: {
                x: function (value) {
                    let x = parseFloat(value);
                    if (scrollDirection === 1 && x >= 0) x -= groupWidth;
                    if (scrollDirection === -1 && x <= -groupWidth * 2) x += groupWidth;
                    return x + "px";
                }
            }
        });
    }

    function reverseDirection(direction) {
        if (direction === scrollDirection) return;
        scrollDirection = direction;
        if (!autoTween) return;
        autoTween.timeScale(scrollDirection === 1 ? 1 : -1);
    }

    section.addEventListener("mouseenter", function () {
        isHovering = true;
        if (!autoTween) {
            startCarousel();
        } else {
            autoTween.play();
        }
    });

    section.addEventListener("mouseleave", function () {
        isHovering = false;
        if (autoTween) {
            gsap.to(autoTween, { timeScale: 0, duration: 0.8, ease: "power2.out" });
        }
    });

    let lastScrollY = window.scrollY;
    window.addEventListener("scroll", function () {
        const currentScrollY = window.scrollY;
        if (currentScrollY > lastScrollY) {
            reverseDirection(1);
        } else if (currentScrollY < lastScrollY) {
            reverseDirection(-1);
        }
        lastScrollY = currentScrollY;
    }, { passive: true });

    window.addEventListener("load", measure);

    window.addEventListener("resize", function () {
        if (autoTween) {
            autoTween.kill();
            autoTween = null;
        }
        measure();
        if (isHovering) startCarousel();
    });

    measure();
})();