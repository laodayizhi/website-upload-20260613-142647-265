(function () {
  function selectAll(selector, scope) {
    return Array.prototype.slice.call((scope || document).querySelectorAll(selector));
  }

  function setupMobileNav() {
    var button = document.querySelector('[data-mobile-toggle]');
    var nav = document.querySelector('[data-mobile-nav]');
    if (!button || !nav) {
      return;
    }
    button.addEventListener('click', function () {
      nav.classList.toggle('is-open');
      button.textContent = nav.classList.contains('is-open') ? '×' : '☰';
    });
  }

  function setupHero() {
    var hero = document.querySelector('[data-hero-slider]');
    if (!hero) {
      return;
    }
    var slides = selectAll('[data-hero-slide]', hero);
    var dots = selectAll('[data-hero-dot]', hero);
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    if (!slides.length) {
      return;
    }
    var index = 0;
    var timer = null;
    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    }
    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5600);
    }
    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }
    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        start();
      });
    }
    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        start();
      });
    }
    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
        start();
      });
    });
    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    start();
  }

  function setupLocalSearch() {
    selectAll('[data-card-search]').forEach(function (input) {
      var root = input.closest('main') || document;
      var cards = selectAll('[data-card]', root);
      input.addEventListener('input', function () {
        var query = input.value.trim().toLowerCase();
        cards.forEach(function (card) {
          var haystack = (card.getAttribute('data-search') || '').toLowerCase();
          card.classList.toggle('is-filtered-out', query && haystack.indexOf(query) === -1);
        });
      });
    });
  }

  function escapeHtml(value) {
    return String(value || '').replace(/[&<>"']/g, function (char) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
      }[char];
    });
  }

  function resultCard(movie) {
    return [
      '<article class="movie-card movie-card-wide" data-card>',
      '<a href="' + escapeHtml(movie.url) + '">',
      '<div class="movie-cover movie-cover-wide">',
      '<img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
      '<span class="duration-badge">' + escapeHtml(movie.duration) + '</span>',
      '<span class="play-badge">▶</span>',
      '</div>',
      '<div class="movie-info">',
      '<h3>' + escapeHtml(movie.title) + '</h3>',
      '<p>' + escapeHtml(movie.oneLine) + '</p>',
      '<div class="movie-meta"><span>★ ' + escapeHtml(movie.rating) + '</span><span>' + escapeHtml(movie.year) + '</span><span>' + escapeHtml(movie.region) + '</span></div>',
      '</div>',
      '</a>',
      '</article>'
    ].join('');
  }

  function setupGlobalSearch() {
    var input = document.querySelector('[data-global-search]');
    var form = document.querySelector('[data-global-search-form]');
    var results = document.querySelector('[data-search-results]');
    var title = document.querySelector('[data-search-title]');
    var subtitle = document.querySelector('[data-search-subtitle]');
    if (!input || !results || !window.movieCatalog) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get('q') || '';
    if (initialQuery) {
      input.value = initialQuery;
      render(initialQuery);
    }
    if (form) {
      form.addEventListener('submit', function (event) {
        event.preventDefault();
        render(input.value);
        var url = new URL(window.location.href);
        if (input.value.trim()) {
          url.searchParams.set('q', input.value.trim());
        } else {
          url.searchParams.delete('q');
        }
        window.history.replaceState({}, '', url.toString());
      });
    }
    input.addEventListener('input', function () {
      render(input.value);
    });
    function render(query) {
      var value = query.trim().toLowerCase();
      if (!value) {
        var hot = window.movieCatalog.slice(0, 18);
        results.innerHTML = hot.map(resultCard).join('');
        if (title) {
          title.textContent = '热门内容';
        }
        if (subtitle) {
          subtitle.textContent = '可直接输入关键词筛选片库。';
        }
        return;
      }
      var found = window.movieCatalog.filter(function (movie) {
        return movie.search.indexOf(value) !== -1;
      }).slice(0, 80);
      results.innerHTML = found.map(resultCard).join('') || '<p class="empty-state">没有找到匹配内容</p>';
      if (title) {
        title.textContent = '搜索结果';
      }
      if (subtitle) {
        subtitle.textContent = '关键词：' + query.trim();
      }
    }
  }

  function setupPlayers() {
    selectAll('.movie-player').forEach(function (player) {
      var video = player.querySelector('video');
      var overlay = player.querySelector('.player-overlay');
      if (!video || !overlay) {
        return;
      }
      function play() {
        overlay.classList.add('is-hidden');
        var promise = video.play();
        if (promise && promise.catch) {
          promise.catch(function () {
            overlay.classList.remove('is-hidden');
          });
        }
      }
      function start() {
        var stream = player.getAttribute('data-stream');
        if (!stream) {
          return;
        }
        if (player.getAttribute('data-ready') === '1') {
          play();
          return;
        }
        player.setAttribute('data-ready', '1');
        if (window.Hls && window.Hls.isSupported()) {
          var hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hls.loadSource(stream);
          hls.attachMedia(video);
          hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
            play();
          });
          hls.on(window.Hls.Events.ERROR, function (event, data) {
            if (!data || !data.fatal) {
              return;
            }
            if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
              hls.startLoad();
            } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
              hls.recoverMediaError();
            } else {
              hls.destroy();
              player.removeAttribute('data-ready');
            }
          });
          player.hlsInstance = hls;
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = stream;
          video.addEventListener('loadedmetadata', play, { once: true });
          video.load();
        } else {
          video.src = stream;
          video.load();
          play();
        }
      }
      overlay.addEventListener('click', start);
      video.addEventListener('click', function () {
        if (player.getAttribute('data-ready') !== '1') {
          start();
        }
      });
      video.addEventListener('play', function () {
        overlay.classList.add('is-hidden');
      });
      video.addEventListener('pause', function () {
        if (video.currentTime === 0 || video.ended) {
          overlay.classList.remove('is-hidden');
        }
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    setupMobileNav();
    setupHero();
    setupLocalSearch();
    setupGlobalSearch();
    setupPlayers();
  });
})();
