(function () {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
    gsap.registerPlugin(ScrollTrigger);

    function initJacketExperience() {
        const section = document.querySelector("#jacketSection");
        const track = document.querySelector("#jacketTrack");
        if (!section || !track) return;

        const jackets = gsap.utils.toArray(".jacket-image", section);
        const slots = gsap.utils.toArray(".jacket-slot", section);
        if (!slots.length) return;

        const currentJacket = document.querySelector("#currentJacket");
        const jacketLabel = document.querySelector("#jacketLabel");
        const progressBar = document.querySelector("#progressBar");

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
            if (currentJacket) currentJacket.textContent = number;
            if (jacketLabel) jacketLabel.textContent = `Item ${number}`;

            if (progressBar) {
                gsap.to(progressBar, {
                    width: `${(index / (COUNT - 1)) * 100}%`,
                    duration: 0.45,
                    ease: "power2.out",
                    overwrite: true
                });
            }
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
            .to(track, { x, duration: TRANSITION_DURATION, ease: "power3.inOut" }, 0);

            updateJacketStates(index, true);
            currentIndex = index;
            updateUI(index);
        }

        // Clean up previous ScrollTriggers to prevent stacking bugs
        ScrollTrigger.getAll().forEach(st => {
            if (st.trigger === section) st.kill();
        });

        const trigger = ScrollTrigger.create({
            trigger: section,
            start: "top top",
            end: "+=350%",
            pin: section.querySelector(".jacket-stage"),
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

    // Run initialization safely
    if (document.readyState === "complete" || document.readyState === "interactive") {
        setTimeout(initJacketExperience, 200);
    } else {
        document.addEventListener("DOMContentLoaded", () => setTimeout(initJacketExperience, 200));
    }

    document.addEventListener("shopify:section:load", () => {
        setTimeout(initJacketExperience, 200);
    });
})();