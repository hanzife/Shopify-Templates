(function () {
    const hero = document.querySelector("#editorialHero");
    const grid = document.querySelector("#editorialGrid");

    const panel1 = document.querySelector(".editorial-panel--1");
    const panel2 = document.querySelector(".editorial-panel--2");
    const panel3 = document.querySelector(".editorial-panel--3");
    const panel4 = document.querySelector(".editorial-panel--4");
    const panel5 = document.querySelector(".editorial-panel--5");

    if (!hero || !grid || !panel1 || !panel2 || !panel3 || !panel4 || !panel5) return;

    gsap.set(panel1, { xPercent: -100 });
    gsap.set(panel2, { xPercent: 100 });
    gsap.set(panel3, { yPercent: 100 });
    gsap.set(panel4, { xPercent: -100 });
    gsap.set(panel5, { yPercent: 100 });
    gsap.set(grid, { gap: 0 });

    const tl = gsap.timeline({
        defaults: { ease: "power3.inOut" }
    });

    tl.to(panel1, { xPercent: 0, duration: 1.15 })
      .to(panel2, { xPercent: 0, duration: 1.15 }, "-=0.72")
      .to(panel3, { yPercent: 0, duration: 1.15 }, "-=0.72")
      .to(panel4, { xPercent: 0, duration: 1.15 }, "-=0.72")
      .to(panel5, { yPercent: 0, duration: 1.2 }, "-=0.72")
      .to(grid, { gap: 5, duration: 1.2, ease: "power3.inOut" }, "+=0.15");
})();