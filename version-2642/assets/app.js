(function () {
  function ready(fn) {
    if (document.readyState !== 'loading') {
      fn();
      return;
    }
    document.addEventListener('DOMContentLoaded', fn);
  }

  function setupMenu() {
    var toggle = document.querySelector('[data-menu-toggle]');
    var menu = document.querySelector('[data-mobile-menu]');
    if (!toggle || !menu) {
      return;
    }
    toggle.addEventListener('click', function () {
      menu.classList.toggle('is-open');
    });
  }

  function setupHero() {
    var root = document.querySelector('[data-hero]');
    if (!root) {
      return;
    }
    var slides = Array.prototype.slice.call(root.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(root.querySelectorAll('[data-hero-dot]'));
    var prev = root.querySelector('[data-hero-prev]');
    var next = root.querySelector('[data-hero-next]');
    if (!slides.length) {
      return;
    }
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, itemIndex) {
        slide.classList.toggle('hero-slide-active', itemIndex === index);
      });
      dots.forEach(function (dot, itemIndex) {
        dot.classList.toggle('is-active', itemIndex === index);
      });
    }

    function start() {
      stop();
      timer = setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        clearInterval(timer);
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

    dots.forEach(function (dot, itemIndex) {
      dot.addEventListener('click', function () {
        show(itemIndex);
        start();
      });
    });

    root.addEventListener('mouseenter', stop);
    root.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function setupFilters() {
    var panels = Array.prototype.slice.call(document.querySelectorAll('[data-filter-panel]'));
    panels.forEach(function (panel) {
      var input = panel.querySelector('[data-filter-input]');
      var select = panel.querySelector('[data-year-select]');
      var grid = document.querySelector('[data-filter-grid]');
      if (!grid) {
        return;
      }
      var cards = Array.prototype.slice.call(grid.querySelectorAll('[data-card]'));

      function apply() {
        var query = input ? input.value.trim().toLowerCase() : '';
        var year = select ? select.value : '';
        cards.forEach(function (card) {
          var haystack = [
            card.getAttribute('data-title') || '',
            card.getAttribute('data-year') || '',
            card.getAttribute('data-region') || '',
            card.getAttribute('data-tags') || ''
          ].join(' ').toLowerCase();
          var matchQuery = !query || haystack.indexOf(query) !== -1;
          var matchYear = !year || card.getAttribute('data-year') === year;
          card.classList.toggle('is-hidden', !(matchQuery && matchYear));
        });
      }

      if (input) {
        input.addEventListener('input', apply);
      }
      if (select) {
        select.addEventListener('change', apply);
      }
    });
  }

  function setupSearchPage() {
    var results = document.querySelector('[data-search-results]');
    if (!results || !window.SEARCH_MOVIES) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var keyword = (params.get('q') || '').trim();
    var input = document.getElementById('search-q');
    var title = document.querySelector('[data-search-title]');
    var count = document.querySelector('[data-search-count]');
    if (input) {
      input.value = keyword;
    }
    var pool = window.SEARCH_MOVIES;
    var matches = pool;
    if (keyword) {
      var lower = keyword.toLowerCase();
      matches = pool.filter(function (movie) {
        return [movie.title, movie.year, movie.region, movie.type, movie.genre, movie.tags].join(' ').toLowerCase().indexOf(lower) !== -1;
      });
    } else {
      matches = pool.slice(0, 24);
    }
    if (title) {
      title.textContent = keyword ? '搜索：' + keyword : '推荐内容';
    }
    if (count) {
      count.textContent = '共找到 ' + matches.length + ' 部影片';
    }
    results.innerHTML = matches.slice(0, 120).map(function (movie) {
      var tags = movie.tags.split(' ').filter(Boolean).slice(0, 3).map(function (tag) {
        return '<span>' + escapeHtml(tag) + '</span>';
      }).join('');
      return [
        '<article class="movie-card">',
        '<a class="card-poster" href="' + movie.url + '" aria-label="' + escapeHtml(movie.title) + ' 在线观看">',
        '<img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
        '<span class="card-year">' + escapeHtml(movie.year) + '</span>',
        '<span class="card-play">播放</span>',
        '</a>',
        '<div class="card-body">',
        '<div class="card-meta"><span>' + escapeHtml(movie.region) + '</span><span>' + escapeHtml(movie.type) + '</span></div>',
        '<h3><a href="' + movie.url + '">' + escapeHtml(movie.title) + '</a></h3>',
        '<p>' + escapeHtml(movie.oneLine) + '</p>',
        '<div class="tag-row">' + tags + '</div>',
        '</div>',
        '</article>'
      ].join('');
    }).join('');
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, function (char) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
      }[char];
    });
  }

  window.bindMoviePlayer = function (streamUrl) {
    var video = document.getElementById('moviePlayer');
    var overlay = document.getElementById('playOverlay');
    if (!video || !streamUrl) {
      return;
    }
    var loaded = false;
    var hls = null;

    function attach() {
      if (loaded) {
        return;
      }
      loaded = true;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = streamUrl;
        return;
      }
      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          maxBufferLength: 45,
          enableWorker: true
        });
        hls.loadSource(streamUrl);
        hls.attachMedia(video);
        return;
      }
      video.src = streamUrl;
    }

    function play() {
      attach();
      var promise = video.play();
      if (promise && typeof promise.catch === 'function') {
        promise.catch(function () {});
      }
    }

    if (overlay) {
      overlay.addEventListener('click', play);
    }

    video.addEventListener('click', function () {
      if (video.paused) {
        play();
      }
    });

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

    window.addEventListener('pagehide', function () {
      if (hls) {
        hls.destroy();
      }
    });
  };

  ready(function () {
    setupMenu();
    setupHero();
    setupFilters();
    setupSearchPage();
  });
})();
