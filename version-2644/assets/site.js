(function () {
  var menuButton = document.querySelector("[data-menu-button]");
  var mobileNav = document.querySelector("[data-mobile-nav]");

  if (menuButton && mobileNav) {
    menuButton.addEventListener("click", function () {
      mobileNav.classList.toggle("is-open");
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
  var dots = Array.prototype.slice.call(document.querySelectorAll("[data-slide-target]"));
  var currentSlide = 0;

  function setSlide(index) {
    if (!slides.length) {
      return;
    }

    currentSlide = (index + slides.length) % slides.length;

    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle("is-active", slideIndex === currentSlide);
    });

    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle("is-active", dotIndex === currentSlide);
    });
  }

  dots.forEach(function (dot, index) {
    dot.addEventListener("click", function () {
      setSlide(index);
    });
  });

  if (slides.length > 1) {
    window.setInterval(function () {
      setSlide(currentSlide + 1);
    }, 5200);
  }

  var searchPanels = Array.prototype.slice.call(document.querySelectorAll("[data-search-panel]"));

  searchPanels.forEach(function (panel) {
    var input = panel.querySelector("[data-card-search]");
    var chips = Array.prototype.slice.call(panel.querySelectorAll("[data-filter-value]"));
    var scope = panel.parentElement || document;
    var cards = Array.prototype.slice.call(scope.querySelectorAll("[data-movie-card]"));
    var noResult = scope.querySelector("[data-no-result]");
    var activeValue = "all";

    function normalize(value) {
      return String(value || "").toLowerCase().trim();
    }

    function applyFilter() {
      var query = normalize(input ? input.value : "");
      var visible = 0;

      cards.forEach(function (card) {
        var haystack = normalize([
          card.getAttribute("data-title"),
          card.getAttribute("data-genre"),
          card.getAttribute("data-region"),
          card.getAttribute("data-type"),
          card.getAttribute("data-year"),
          card.getAttribute("data-tags")
        ].join(" "));

        var matchQuery = !query || haystack.indexOf(query) !== -1;
        var matchChip = activeValue === "all" || haystack.indexOf(normalize(activeValue)) !== -1;
        var show = matchQuery && matchChip;

        card.style.display = show ? "" : "none";

        if (show) {
          visible += 1;
        }
      });

      if (noResult) {
        noResult.classList.toggle("is-visible", visible === 0);
      }
    }

    if (input) {
      input.addEventListener("input", applyFilter);
    }

    chips.forEach(function (chip) {
      chip.addEventListener("click", function () {
        activeValue = chip.getAttribute("data-filter-value") || "all";

        chips.forEach(function (item) {
          item.classList.toggle("is-active", item === chip);
        });

        applyFilter();
      });
    });

    applyFilter();
  });

  var video = document.querySelector("video[data-hls-src]");

  if (video) {
    var source = video.getAttribute("data-hls-src");
    var playerCard = video.closest(".player-card");
    var overlay = document.querySelector("[data-player-start]");
    var loaded = false;
    var hls = null;

    function loadSource() {
      if (loaded || !source) {
        return;
      }

      loaded = true;

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(source);
        hls.attachMedia(video);
      } else {
        video.src = source;
      }
    }

    function startPlayback() {
      loadSource();

      if (playerCard) {
        playerCard.classList.add("is-ready");
      }

      var playPromise = video.play();

      if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch(function () {});
      }
    }

    if (overlay) {
      overlay.addEventListener("click", startPlayback);
    }

    video.addEventListener("click", function () {
      if (video.paused) {
        startPlayback();
      }
    });

    video.addEventListener("play", function () {
      if (playerCard) {
        playerCard.classList.add("is-ready");
      }
    });

    window.addEventListener("beforeunload", function () {
      if (hls) {
        hls.destroy();
      }
    });
  }
})();
