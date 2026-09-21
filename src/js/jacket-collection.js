(function () {
    gsap.registerPlugin(ScrollTrigger);

    const section = document.querySelector("#jacketSection");
    const track = document.querySelector("#jacketTrack");
    const jackets = gsap.utils.toArray(".jacket-image");

    const currentJacket = document.querySelector("#currentJacket");
    const jacketLabel = document.querySelector("#jacketLabel");
    const progressBar = document.querySelector("#progressBar");

    function createJacketExperience() {
        const slots = gsap.utils.toArray(".jacket-slot");
        if (!slots.length) return;

        const COUNT = slots.length;
        let currentIndex = 0;
        let isAnimating = false;

        let wheelLocked = false;
        let wheelReleaseTimer = null;

        const TRANSITION_DURATION = 0.9;
        const WHEEL_THRESHOLD = 12;
        const RELEASE_DELAY = 180;

        function getSlotWidth() {
            return slots[0].getBoundingClientRect().width;
        }

        function updateUI(index) {
            const number = String(index + 1).padStart(2, "0");
            currentJacket.textContent = number;
            jacketLabel.textContent = `Jacket ${number}`;

            gsap.to(progressBar, {
                width: `${(index / (COUNT - 1)) * 100}%`,
                duration: 0.45,
                ease: "power2.out",
                overwrite: true
            });
        }

        function updateJacketStates(index, animate = true) {
            jackets.forEach((jacket, i) => {
                const active = i === index;
                gsap.to(jacket, {
                    opacity: active ? 1 : 0.18,
                    scale: active ? 1 : 0.94,
                    duration: animate ? 0.65 : 0,
                    ease: "power2.out",
                    overwrite: true
                });
            });
        }

        function positionJacket(index, animate = true) {
            const x = -(getSlotWidth() * index);

            if (!animate) {
                gsap.set(track, { x });
                updateJacketStates(index, false);
                updateUI(index);
                return;
            }

            isAnimating = true;

            gsap.timeline({
                defaults: { overwrite: "auto" },
                onComplete: () => {
                    isAnimating = false;
                    clearTimeout(wheelReleaseTimer);
                    wheelReleaseTimer = setTimeout(() => {
                        wheelLocked = false;
                    }, RELEASE_DELAY);
                }
            })
            .to(track, { x, duration: TRANSITION_DURATION, ease: "power3.inOut" }, 0)
            .to(progressBar, { width: `${(index / (COUNT - 1)) * 100}%`, duration: 0.7, ease: "power2.out" }, 0.1);

            updateJacketStates(index, true);
            currentIndex = index;
            currentJacket.textContent = String(index + 1).padStart(2, "0");
            jacketLabel.textContent = `Jacket ${String(index + 1).padStart(2, "0")}`;
        }

        const trigger = ScrollTrigger.create({
            trigger: section,
            start: "top top",
            end: "+=400%",
            pin: ".jacket-stage",
            pinSpacing: true,
            anticipatePin: 1,
            invalidateOnRefresh: true,
            onEnter: () => { if (!isAnimating) positionJacket(0, false); },
            onEnterBack: () => { if (!isAnimating) positionJacket(COUNT - 1, false); }
        });

        function handleWheel(event) {
            if (!trigger.isActive) return;
            const delta = event.deltaY;
            if (Math.abs(delta) < WHEEL_THRESHOLD) return;

            if ((currentIndex === 0 && delta < 0) || (currentIndex === COUNT - 1 && delta > 0)) {
                return;
            }

            event.preventDefault();
            if (isAnimating || wheelLocked) return;
            wheelLocked = true;

            const direction = delta > 0 ? 1 : -1;
            const nextIndex = currentIndex + direction;

            if (nextIndex < 0 || nextIndex >= COUNT) {
                wheelLocked = false;
                return;
            }

            const progress = nextIndex / (COUNT - 1);
            const scrollPosition = trigger.start + (trigger.end - trigger.start) * progress;

            window.scrollTo({ top: scrollPosition, behavior: "instant" });
            positionJacket(nextIndex, true);
        }

        window.addEventListener("wheel", handleWheel, { passive: false });

        window.addEventListener("resize", () => {
            if (isAnimating) return;
            gsap.set(track, { x: -(getSlotWidth() * currentIndex) });
        });

        positionJacket(0, false);
    }

    function entranceAnimation() {
        gsap.fromTo(".model-wrap", { opacity: 0, y: 35 }, {
            opacity: 1, y: 0, duration: 1.2, ease: "power3.out",
            scrollTrigger: { trigger: section, start: "top 85%", once: true }
        });

        gsap.fromTo(".collection-label", { opacity: 0, y: 10 }, {
            opacity: 1, y: 0, duration: 1, delay: .15, ease: "power3.out",
            scrollTrigger: { trigger: section, start: "top 85%", once: true }
        });
    }

    function init() {
        createJacketExperience();
        entranceAnimation();
        ScrollTrigger.refresh();
    }

    const images = document.querySelectorAll("img");
    let loaded = 0;

    images.forEach(img => {
        if (img.complete) {
            loaded++;
        } else {
            img.addEventListener("load", () => {
                loaded++;
                if (loaded === images.length) init();
            }, { once: true });
        }
    });

    if (loaded === images.length) init();

    let resizeTimer;
    window.addEventListener("resize", () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => { ScrollTrigger.refresh(); }, 250);
    });
})();