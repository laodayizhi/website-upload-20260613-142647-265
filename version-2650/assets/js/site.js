(function () {
    function all(selector, scope) {
        return Array.prototype.slice.call((scope || document).querySelectorAll(selector));
    }

    var menuButton = document.querySelector('[data-mobile-menu-button]');
    var menu = document.querySelector('[data-mobile-menu]');
    if (menuButton && menu) {
        menuButton.addEventListener('click', function () {
            menu.classList.toggle('is-open');
        });
    }

    var hero = document.querySelector('[data-hero]');
    if (hero) {
        var slides = all('[data-hero-slide]', hero);
        var dots = all('[data-hero-dot]', hero);
        var current = 0;
        var showSlide = function (next) {
            if (!slides.length) {
                return;
            }
            current = (next + slides.length) % slides.length;
            slides.forEach(function (slide, index) {
                slide.classList.toggle('is-active', index === current);
            });
            dots.forEach(function (dot, index) {
                dot.classList.toggle('is-active', index === current);
            });
        };
        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                showSlide(index);
            });
        });
        showSlide(0);
        window.setInterval(function () {
            showSlide(current + 1);
        }, 5200);
    }

    all('[data-filter-panel]').forEach(function (panel) {
        var input = panel.querySelector('[data-filter-input]');
        var region = panel.querySelector('[data-filter-region]');
        var year = panel.querySelector('[data-filter-year]');
        var targetSelector = panel.getAttribute('data-filter-panel');
        var target = targetSelector ? document.querySelector(targetSelector) : panel.nextElementSibling;
        if (!target) {
            return;
        }
        var cards = all('[data-search]', target);
        var empty = document.querySelector('[data-empty-for="' + target.id + '"]');
        var apply = function () {
            var keyword = input ? input.value.trim().toLowerCase() : '';
            var regionValue = region ? region.value.trim().toLowerCase() : '';
            var yearValue = year ? year.value.trim().toLowerCase() : '';
            var visible = 0;
            cards.forEach(function (card) {
                var text = (card.getAttribute('data-search') || '').toLowerCase();
                var matchKeyword = !keyword || text.indexOf(keyword) !== -1;
                var matchRegion = !regionValue || text.indexOf(regionValue) !== -1;
                var matchYear = !yearValue || text.indexOf(yearValue) !== -1;
                var show = matchKeyword && matchRegion && matchYear;
                card.style.display = show ? '' : 'none';
                if (show) {
                    visible += 1;
                }
            });
            if (empty) {
                empty.classList.toggle('is-visible', visible === 0);
            }
        };
        [input, region, year].forEach(function (control) {
            if (control) {
                control.addEventListener('input', apply);
                control.addEventListener('change', apply);
            }
        });
    });

    window.initializePlayer = function (url) {
        var video = document.getElementById('movie-player');
        var overlay = document.getElementById('play-overlay');
        if (!video || !overlay || !url) {
            return;
        }
        var attached = false;
        var hlsInstance = null;
        var attach = function () {
            if (attached) {
                return;
            }
            attached = true;
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = url;
            } else if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hlsInstance.loadSource(url);
                hlsInstance.attachMedia(video);
            } else {
                video.src = url;
            }
        };
        var play = function () {
            attach();
            overlay.classList.add('is-hidden');
            var promise = video.play();
            if (promise && promise.catch) {
                promise.catch(function () {
                    overlay.classList.remove('is-hidden');
                });
            }
        };
        overlay.addEventListener('click', play);
        video.addEventListener('click', function () {
            if (video.paused) {
                play();
            }
        });
        video.addEventListener('play', function () {
            overlay.classList.add('is-hidden');
        });
        video.addEventListener('ended', function () {
            overlay.classList.remove('is-hidden');
        });
        window.addEventListener('beforeunload', function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    };
})();
