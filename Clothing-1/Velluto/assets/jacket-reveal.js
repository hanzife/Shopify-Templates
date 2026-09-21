(function () {
    "use strict";

    function initJacketReveal() {
        var section = document.getElementById("jacketReveal");
        if (!section || typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") {
            return;
        }

        var pinWrap = document.getElementById("jacketRevealPinWrap");
        var leftEl = document.getElementById("jacketRevealLeft");
        var rightEl = document.getElementById("jacketRevealRight");
        var insideEl = document.getElementById("jacketRevealInside");
        var shadowEl = document.getElementById("jacketRevealShadow");
        var titleEl = document.getElementById("jacketRevealTitle");


        var leftImg = leftEl.querySelector("img");
        var rightImg = rightEl.querySelector("img");

        gsap.registerPlugin(ScrollTrigger);

        var TRAVEL_VW_FRACTION = 0.92;
        var MAX_ROTATION_DEG = 1.5;

        var st = null;
        var tl = null;

        function travelPx() {
            return window.innerWidth * 0.5 * TRAVEL_VW_FRACTION;
        }

        function buildTimeline() {
            var travel = travelPx();

            tl = gsap.timeline({
                defaults: { ease: "none" },
                smoothChildTiming: true
            });

            tl.to(leftEl, { x: -travel, rotation: -MAX_ROTATION_DEG, scale: 0.985, duration: 100 }, 0);
            tl.to(rightEl, { x: travel, rotation: MAX_ROTATION_DEG, scale: 0.985, duration: 100 }, 0);
            tl.to(insideEl, { opacity: 1, scale: 1, duration: 15, ease: "power2.out" }, 5);
            tl.to(shadowEl, { opacity: 1, duration: 5 }, 0);
            tl.to(shadowEl, { opacity: 0, duration: 30, ease: "power2.out" }, 20);
            tl.to(leftImg, { xPercent: -6, duration: 15 }, 85);
            tl.to(rightImg, { xPercent: 6, duration: 15 }, 85);
            tl.to(titleEl, { y: "-120vh", duration: 60, ease: "power2.in" }, 40);

            st = ScrollTrigger.create({
                trigger: section,
                start: "top top",
                end: "+=350%",
                scrub: 1,
                pin: pinWrap,
                pinSpacing: true,
                anticipatePin: 1,
                invalidateOnRefresh: true,
                animation: tl,
                onToggle: function (self) {
                    document.body.classList.toggle("jr-pinned", self.isActive);
                }
            });
        }

        function destroyTimeline() {
            if (st) { st.kill(); st = null; }
            if (tl) { tl.kill(); tl = null; }
            gsap.set([leftEl, rightEl], { clearProps: "transform" });
            gsap.set(insideEl, { clearProps: "transform,opacity" });
            gsap.set(shadowEl, { clearProps: "opacity" });
        }

        var resizeTimer = null;
        function handleResize() {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(function () {
                var progress = st ? st.progress : 0;
                destroyTimeline();
                buildTimeline();
                if (progress > 0 && progress < 1) {
                    st.scroll(st.start + progress * (st.end - st.start));
                }
                ScrollTrigger.refresh();
            }, 150);
        }

        gsap.set(insideEl, { opacity: 0, scale: 1.05 });
        gsap.set(shadowEl, { opacity: 0 });
        gsap.set([leftEl, rightEl], { x: 0, rotation: 0, scale: 1 });

        buildTimeline();
        window.addEventListener("resize", handleResize);

        section.__jacketReveal = {
            destroy: function () {
                window.removeEventListener("resize", handleResize);
                destroyTimeline();
            }
        };
    }

    function preloadImages(urls) {
        return Promise.all(
            urls.map(function (src) {
                return new Promise(function (resolve) {
                    var img = new Image();
                    img.onload = resolve;
                    img.onerror = resolve;
                    img.src = src;
                });
            })
        );
    }

    function start() {
        var left = document.querySelector("#jacketRevealLeft img");
        var right = document.querySelector("#jacketRevealRight img");
        var inside = document.querySelector("#jacketRevealInside img");

        if (!left || !right || !inside) return;

        preloadImages([left.src, right.src, inside.src]).then(function () {
            initJacketReveal();
        });
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", start);
    } else {
        start();
    }
})();