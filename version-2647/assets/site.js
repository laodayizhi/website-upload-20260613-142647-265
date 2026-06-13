(function () {
    function ready(callback) {
        if (document.readyState !== "loading") {
            callback();
            return;
        }
        document.addEventListener("DOMContentLoaded", callback);
    }

    function setupMenu() {
        var toggle = document.querySelector(".menu-toggle");
        var mobileNav = document.querySelector(".mobile-nav");
        if (!toggle || !mobileNav) {
            return;
        }
        toggle.addEventListener("click", function () {
            var open = mobileNav.classList.toggle("open");
            toggle.setAttribute("aria-expanded", open ? "true" : "false");
        });
    }

    function setupHero() {
        var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dots button"));
        if (!slides.length) {
            return;
        }
        var index = 0;
        function show(next) {
            index = (next + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("active", slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("active", dotIndex === index);
            });
        }
        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener("click", function () {
                show(dotIndex);
            });
        });
        show(0);
        window.setInterval(function () {
            show(index + 1);
        }, 5200);
    }

    function setupSearch() {
        var input = document.getElementById("siteSearch");
        var region = document.getElementById("regionFilter");
        var type = document.getElementById("typeFilter");
        var results = document.getElementById("searchResults");
        if (!input || !results || !window.MOVIE_SEARCH_INDEX) {
            return;
        }
        function match(movie, query, regionValue, typeValue) {
            var hay = [movie.title, movie.oneLine, movie.region, movie.type, movie.year, movie.genre].join(" ").toLowerCase();
            if (query && hay.indexOf(query) === -1) {
                return false;
            }
            if (regionValue && movie.region !== regionValue) {
                return false;
            }
            if (typeValue && movie.type !== typeValue) {
                return false;
            }
            return true;
        }
        function render() {
            var query = input.value.trim().toLowerCase();
            var regionValue = region ? region.value : "";
            var typeValue = type ? type.value : "";
            var list = window.MOVIE_SEARCH_INDEX.filter(function (movie) {
                return match(movie, query, regionValue, typeValue);
            }).slice(0, 16);
            if (!query && !regionValue && !typeValue) {
                results.classList.remove("open");
                results.innerHTML = "";
                return;
            }
            results.classList.add("open");
            results.innerHTML = list.map(function (movie) {
                return "<a class=\"search-result\" href=\"" + movie.url + "\">" +
                    "<img src=\"" + movie.cover + "\" alt=\"" + escapeHtml(movie.title) + "\" loading=\"lazy\">" +
                    "<div><h3>" + escapeHtml(movie.title) + "</h3>" +
                    "<p>" + escapeHtml(movie.oneLine) + "</p>" +
                    "<div class=\"search-meta\"><span>" + escapeHtml(movie.year) + "</span><span>" + escapeHtml(movie.region) + "</span></div></div></a>";
            }).join("");
        }
        [input, region, type].forEach(function (node) {
            if (node) {
                node.addEventListener("input", render);
                node.addEventListener("change", render);
            }
        });
    }

    function setupCategoryFilter() {
        var input = document.getElementById("categorySearch");
        var cards = Array.prototype.slice.call(document.querySelectorAll(".movie-card[data-title]"));
        if (!input || !cards.length) {
            return;
        }
        input.addEventListener("input", function () {
            var query = input.value.trim().toLowerCase();
            cards.forEach(function (card) {
                var hay = [card.dataset.title, card.dataset.region, card.dataset.year, card.dataset.genre].join(" ").toLowerCase();
                card.classList.toggle("hidden", query && hay.indexOf(query) === -1);
            });
        });
    }

    function escapeHtml(value) {
        return String(value || "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    ready(function () {
        setupMenu();
        setupHero();
        setupSearch();
        setupCategoryFilter();
    });
})();

function initMoviePlayer(sourceUrl) {
    var video = document.getElementById("movie-video");
    var overlay = document.getElementById("playerOverlay");
    var message = document.getElementById("playerMessage");
    var hlsInstance = null;

    if (!video || !sourceUrl) {
        return;
    }

    function showMessage(text) {
        if (message) {
            message.textContent = text;
            message.classList.add("show");
        }
    }

    function bindSource() {
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = sourceUrl;
            return;
        }
        if (window.Hls && window.Hls.isSupported()) {
            hlsInstance = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hlsInstance.loadSource(sourceUrl);
            hlsInstance.attachMedia(video);
            hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
                if (data && data.fatal) {
                    showMessage("播放加载失败，请稍后重试。");
                }
            });
            return;
        }
        showMessage("播放加载失败，请稍后重试。");
    }

    function playVideo() {
        if (overlay) {
            overlay.classList.add("hide");
        }
        var promise = video.play();
        if (promise && typeof promise.catch === "function") {
            promise.catch(function () {
                if (overlay) {
                    overlay.classList.remove("hide");
                }
            });
        }
    }

    bindSource();

    if (overlay) {
        overlay.addEventListener("click", playVideo);
    }

    video.addEventListener("play", function () {
        if (overlay) {
            overlay.classList.add("hide");
        }
    });

    video.addEventListener("pause", function () {
        if (overlay && video.currentTime === 0) {
            overlay.classList.remove("hide");
        }
    });

    window.addEventListener("beforeunload", function () {
        if (hlsInstance) {
            hlsInstance.destroy();
        }
    });
}
