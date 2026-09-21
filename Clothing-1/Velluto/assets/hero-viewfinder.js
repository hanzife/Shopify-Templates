(function () {
    'use strict';
    var REVEAL_ORDER = [0, 1, 2, 3, 4];
    var REVEAL_STEP_MS = 180;
    var REVEAL_START_MS = 12;
    var IMAGE_WAIT_MAX_MS = 3000; // never block the reveal longer than this

    var ZOOM_LEVELS = {
        wide: { scale: 0.93 },
        default: { scale: 1, isDefault: true },
        tight: { scale: 1.12 }
    };

    var SCROLL_EXIT = {
        minScale: 0.94,
        minOpacity: 0.55
    };

    var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var isCoarsePointer = window.matchMedia('(hover: none), (pointer: coarse)').matches;

    function initAll(scope) {
        var roots = (scope || document).querySelectorAll('[data-hero-viewfinder]');
        Array.prototype.forEach.call(roots, initHero);
    }

    function initHero(root) {
        if (root.__heroInit) return;
        root.__heroInit = true;

        var grid = root.querySelector('[data-hero-grid]');
        var stage = root.querySelector('[data-hero-stage]');
        var spacer = root.querySelector('.hero-viewfinder__spacer');
        var tiles = Array.prototype.slice.call(root.querySelectorAll('[data-hero-tile]'));
        var zoomButtons = Array.prototype.slice.call(root.querySelectorAll('[data-hero-zoom]'));

        if (!grid || !stage || !tiles.length) return;

        setupReveal(root, tiles);
        setupZoom(grid, zoomButtons);
        setupTileActivation(tiles);
        root.__heroDestroy = setupScrollExit(root, spacer, stage);
    }

    // The 5 tiles share one image, so we only need to wait for the first one.
    function whenImageReady(img, callback) {
        if (!img || (img.complete && img.naturalWidth > 0)) {
            callback();
            return;
        }

        var done = false;
        function finish() {
            if (done) return;
            done = true;
            callback();
        }

        img.addEventListener('load', finish, { once: true });
        img.addEventListener('error', finish, { once: true });
        window.setTimeout(finish, IMAGE_WAIT_MAX_MS);
    }

    function setupReveal(root, tiles) {
        var order = REVEAL_ORDER.filter(function (i) {
            return i >= 0 && i < tiles.length;
        });

        if (order.length !== tiles.length) {
            order = tiles.map(function (_, i) { return i; });
        }

        if (prefersReducedMotion) {
            root.classList.add('is-revealed');
            root.classList.add('is-spaced');
            return;
        }

        order.forEach(function (tileIndex, sequencePosition) {
            var tile = tiles[tileIndex];
            if (!tile) return;
            var hit = tile.querySelector('.hero-tile__hit');
            if (!hit) return;
            var delay = REVEAL_START_MS + sequencePosition * REVEAL_STEP_MS;
            hit.style.setProperty('--hv-reveal-delay', delay + 'ms');
        });

        var firstImg = root.querySelector('[data-hero-tile-img]');

        whenImageReady(firstImg, function () {
            requestAnimationFrame(function () {
                requestAnimationFrame(function () {
                    root.classList.add('is-revealed');
                    var finalDelay = REVEAL_START_MS + (order.length - 1) * REVEAL_STEP_MS + 760;
                    window.setTimeout(function () {
                        root.classList.add('is-spaced');
                    }, finalDelay);
                });
            });
        });
    }

    function setupZoom(grid, buttons) {
        if (!buttons.length) return;

        buttons.forEach(function (button) {
            button.addEventListener('click', function () {
                var id = button.getAttribute('data-zoom-id');
                var level = ZOOM_LEVELS[id];
                if (!level) return;

                grid.style.setProperty('--hv-zoom-scale', level.scale);

                buttons.forEach(function (b) {
                    var active = b === button;
                    b.classList.toggle('hero-camera__stop--active', active);
                    b.setAttribute('aria-pressed', active ? 'true' : 'false');
                });
            });
        });
    }

    function setupTileActivation(tiles) {
        if (!isCoarsePointer) return;

        tiles.forEach(function (tile) {
            var hit = tile.querySelector('.hero-tile__hit');
            if (!hit) return;

            hit.addEventListener('click', function (event) {
                var alreadyActive = hit.classList.contains('is-active');

                tiles.forEach(function (other) {
                    var otherHit = other.querySelector('.hero-tile__hit');
                    if (otherHit) otherHit.classList.remove('is-active');
                });

                if (!alreadyActive) {
                    hit.classList.add('is-active');
                    event.preventDefault();
                }
            });
        });
    }

    function setupScrollExit(root, spacer, stage) {
        if (!spacer || prefersReducedMotion) return function () {};

        var ticking = false;
        var spacerTop = 0;
        var runway = 0;
        var active = false;

        function measure() {
            var rect = spacer.getBoundingClientRect();
            spacerTop = rect.top + window.scrollY;
            var pinHeight = window.innerHeight;
            runway = Math.max(rect.height - pinHeight, 1);
        }

        function update() {
            ticking = false;
            var progress = (window.scrollY - spacerTop) / runway;
            progress = Math.max(0, Math.min(1, progress));

            var scale = 1 - (1 - SCROLL_EXIT.minScale) * progress;
            var opacity = 1 - (1 - SCROLL_EXIT.minOpacity) * progress;

            stage.style.setProperty('--hv-stage-scale', scale.toFixed(4));
            stage.style.setProperty('--hv-stage-opacity', opacity.toFixed(4));
        }

        function onScroll() {
            if (ticking) return;
            ticking = true;
            requestAnimationFrame(update);
        }

        function onResize() {
            measure();
            if (active) update();
        }

        measure();

        var observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting && !active) {
                    active = true;
                    measure();
                    window.addEventListener('scroll', onScroll, { passive: true });
                    update();
                } else if (!entry.isIntersecting && active) {
                    active = false;
                    window.removeEventListener('scroll', onScroll);
                }
            });
        }, { threshold: [0, 0.01, 0.99, 1] });

        observer.observe(spacer);
        window.addEventListener('resize', onResize);

        // Cleanup, used when the section is re-rendered in the theme editor
        return function destroy() {
            observer.disconnect();
            window.removeEventListener('scroll', onScroll);
            window.removeEventListener('resize', onResize);
        };
    }

    initAll();

    // Shopify theme editor: re-init when the section is re-rendered (e.g. image changed)
    document.addEventListener('shopify:section:load', function (event) {
        initAll(event.target);
    });

    document.addEventListener('shopify:section:unload', function (event) {
        var roots = event.target.querySelectorAll('[data-hero-viewfinder]');
        Array.prototype.forEach.call(roots, function (root) {
            if (typeof root.__heroDestroy === 'function') root.__heroDestroy();
        });
    });
})();