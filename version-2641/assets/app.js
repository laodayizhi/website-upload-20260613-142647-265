(function () {
  function selectAll(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function initMenu() {
    var toggle = document.querySelector('[data-menu-toggle]');
    var links = document.querySelector('[data-nav-links]');
    if (!toggle || !links) {
      return;
    }
    toggle.addEventListener('click', function () {
      links.classList.toggle('open');
    });
  }

  function initHero() {
    var slides = selectAll('.hero-slide');
    var dots = selectAll('.hero-dot');
    if (!slides.length) {
      return;
    }
    var current = 0;
    function show(index) {
      current = index % slides.length;
      if (current < 0) {
        current = slides.length - 1;
      }
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === current);
      });
    }
    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        show(index);
      });
    });
    show(0);
    window.setInterval(function () {
      show(current + 1);
    }, 5200);
  }

  function initHeroSearch() {
    var forms = selectAll('[data-site-search-form]');
    forms.forEach(function (form) {
      form.addEventListener('submit', function (event) {
        event.preventDefault();
        var input = form.querySelector('input[name="q"]');
        var value = input ? input.value.trim() : '';
        var target = './search.html';
        if (value) {
          target += '?q=' + encodeURIComponent(value);
        }
        window.location.href = target;
      });
    });
  }

  function initFilters() {
    var cards = selectAll('[data-movie-card]');
    if (!cards.length) {
      return;
    }
    var queryInput = document.querySelector('[data-filter-query]');
    var yearSelect = document.querySelector('[data-filter-year]');
    var typeSelect = document.querySelector('[data-filter-type]');
    var regionSelect = document.querySelector('[data-filter-region]');
    var emptyState = document.querySelector('[data-empty-state]');
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get('q');
    if (initialQuery && queryInput) {
      queryInput.value = initialQuery;
    }
    function getValue(element) {
      return element ? element.value.trim().toLowerCase() : '';
    }
    function applyFilters() {
      var query = getValue(queryInput);
      var year = getValue(yearSelect);
      var type = getValue(typeSelect);
      var region = getValue(regionSelect);
      var visible = 0;
      cards.forEach(function (card) {
        var text = (card.getAttribute('data-title') + ' ' + card.getAttribute('data-summary') + ' ' + card.getAttribute('data-tags')).toLowerCase();
        var cardYear = (card.getAttribute('data-year') || '').toLowerCase();
        var cardType = (card.getAttribute('data-type') || '').toLowerCase();
        var cardRegion = (card.getAttribute('data-region') || '').toLowerCase();
        var matched = true;
        if (query && text.indexOf(query) === -1) {
          matched = false;
        }
        if (year && cardYear !== year) {
          matched = false;
        }
        if (type && cardType !== type) {
          matched = false;
        }
        if (region && cardRegion !== region) {
          matched = false;
        }
        card.style.display = matched ? '' : 'none';
        if (matched) {
          visible += 1;
        }
      });
      if (emptyState) {
        emptyState.style.display = visible ? 'none' : 'block';
      }
    }
    [queryInput, yearSelect, typeSelect, regionSelect].forEach(function (element) {
      if (element) {
        element.addEventListener('input', applyFilters);
        element.addEventListener('change', applyFilters);
      }
    });
    applyFilters();
  }

  window.initMoviePlayer = function (url) {
    var video = document.querySelector('[data-movie-video]');
    var overlay = document.querySelector('[data-player-overlay]');
    if (!video || !url) {
      return;
    }
    var started = false;
    function startPlayback() {
      if (started) {
        video.play().catch(function () {});
        return;
      }
      started = true;
      if (overlay) {
        overlay.classList.add('hidden');
      }
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = url;
        video.play().catch(function () {});
        return;
      }
      if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(url);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          video.play().catch(function () {});
        });
        hls.on(window.Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal) {
            video.setAttribute('data-player-state', 'error');
          }
        });
        return;
      }
      video.src = url;
      video.play().catch(function () {});
    }
    if (overlay) {
      overlay.addEventListener('click', startPlayback);
    }
    video.addEventListener('click', function () {
      if (!started) {
        startPlayback();
      }
    });
  };

  document.addEventListener('DOMContentLoaded', function () {
    initMenu();
    initHero();
    initHeroSearch();
    initFilters();
  });
})();
