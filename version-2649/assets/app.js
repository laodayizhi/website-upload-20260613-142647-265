(function () {
  function selectAll(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function normalise(value) {
    return String(value || '').toLowerCase().trim();
  }

  function initMenu() {
    var button = document.querySelector('[data-menu-toggle]');
    var nav = document.querySelector('[data-mobile-nav]');
    if (!button || !nav) {
      return;
    }
    button.addEventListener('click', function () {
      nav.classList.toggle('open');
      button.classList.toggle('open');
    });
  }

  function initHero() {
    var hero = document.querySelector('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = selectAll('[data-hero-slide]', hero);
    var dots = selectAll('[data-hero-dot]', hero);
    if (!slides.length) {
      return;
    }
    var current = 0;
    var timer = null;
    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === current);
      });
    }
    function start() {
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }
    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }
    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
        start();
      });
    });
    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function initSliders() {
    selectAll('[data-slider]').forEach(function (slider) {
      var track = slider.querySelector('[data-slider-track]');
      var prev = slider.querySelector('[data-slider-prev]');
      var next = slider.querySelector('[data-slider-next]');
      if (!track) {
        return;
      }
      var amount = function () {
        return Math.max(260, Math.floor(track.clientWidth * 0.82));
      };
      if (prev) {
        prev.addEventListener('click', function () {
          track.scrollBy({ left: -amount(), behavior: 'smooth' });
        });
      }
      if (next) {
        next.addEventListener('click', function () {
          track.scrollBy({ left: amount(), behavior: 'smooth' });
        });
      }
    });
  }

  function cardMatches(card, query, year) {
    var haystack = normalise([
      card.getAttribute('data-title'),
      card.getAttribute('data-tags'),
      card.getAttribute('data-year'),
      card.getAttribute('data-region'),
      card.getAttribute('data-type')
    ].join(' '));
    var yearValue = card.getAttribute('data-year') || '';
    var queryOk = !query || haystack.indexOf(query) !== -1;
    var yearOk = !year || yearValue === year;
    return queryOk && yearOk;
  }

  function initFilters() {
    selectAll('.filter-scope').forEach(function (scope) {
      var input = scope.querySelector('[data-card-search]');
      var year = scope.querySelector('[data-year-filter]');
      var empty = scope.querySelector('[data-empty-state]');
      var cards = selectAll('.movie-card, .rank-card', scope);
      if (!cards.length) {
        return;
      }
      function apply() {
        var query = normalise(input ? input.value : '');
        var yearValue = year ? year.value : '';
        var visible = 0;
        cards.forEach(function (card) {
          var matched = cardMatches(card, query, yearValue);
          card.hidden = !matched;
          if (matched) {
            visible += 1;
          }
        });
        if (empty) {
          empty.classList.toggle('show', visible === 0);
        }
      }
      if (input) {
        input.addEventListener('input', apply);
      }
      if (year) {
        year.addEventListener('change', apply);
      }
      var params = new URLSearchParams(window.location.search);
      var q = params.get('q');
      if (q && input) {
        input.value = q;
      }
      apply();
    });
  }

  function readMovieConfig() {
    var node = document.getElementById('movie-config');
    if (!node) {
      return null;
    }
    try {
      return JSON.parse(node.textContent || '{}');
    } catch (error) {
      return null;
    }
  }

  function getHlsClass() {
    if (window.Hls) {
      return Promise.resolve(window.Hls);
    }
    if (typeof import !== 'function') {
      return Promise.resolve(null);
    }
    return import('./hls.js').then(function (module) {
      return module.H || module.default || null;
    }).catch(function () {
      return null;
    });
  }

  function initPlayer() {
    var video = document.getElementById('movie-player');
    var overlay = document.getElementById('playOverlay');
    var config = readMovieConfig();
    if (!video || !config || !config.src) {
      return;
    }
    var ready = false;
    var loading = null;
    function load() {
      if (ready) {
        return Promise.resolve();
      }
      if (loading) {
        return loading;
      }
      loading = new Promise(function (resolve) {
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = config.src;
          ready = true;
          resolve();
          return;
        }
        getHlsClass().then(function (HlsClass) {
          if (HlsClass && HlsClass.isSupported && HlsClass.isSupported()) {
            var hls = new HlsClass({ enableWorker: true, lowLatencyMode: true });
            hls.loadSource(config.src);
            hls.attachMedia(video);
            ready = true;
            resolve();
            return;
          }
          video.src = config.src;
          ready = true;
          resolve();
        });
      });
      return loading;
    }
    function play() {
      load().then(function () {
        var result = video.play();
        if (result && result.catch) {
          result.catch(function () {});
        }
      });
    }
    load();
    if (overlay) {
      overlay.addEventListener('click', function () {
        overlay.classList.add('is-hidden');
        play();
      });
    }
    video.addEventListener('play', function () {
      if (overlay) {
        overlay.classList.add('is-hidden');
      }
    });
    video.addEventListener('pause', function () {
      if (overlay && video.currentTime === 0) {
        overlay.classList.remove('is-hidden');
      }
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initMenu();
    initHero();
    initSliders();
    initFilters();
    initPlayer();
  });
})();
