(function () {
  function basePath(path) {
    var base = window.SITE_BASE || '.';
    if (base === '.') {
      return './' + path;
    }
    return base.replace(/\/$/, '') + '/' + path;
  }

  function normalize(text) {
    return String(text || '').toLowerCase().trim();
  }

  var menuButton = document.querySelector('[data-menu-toggle]');
  var mobilePanel = document.querySelector('[data-mobile-panel]');
  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', function () {
      mobilePanel.classList.toggle('active');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
  if (slides.length > 1) {
    var current = 0;
    var showSlide = function (index) {
      current = index % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === current);
      });
    };
    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        showSlide(i);
      });
    });
    window.setInterval(function () {
      showSlide(current + 1);
    }, 5200);
  }

  var searchBoxes = Array.prototype.slice.call(document.querySelectorAll('[data-search-box]'));
  searchBoxes.forEach(function (box) {
    var wrap = box.parentElement;
    var results = wrap ? wrap.querySelector('[data-search-results]') : null;
    if (!results) {
      results = box.nextElementSibling;
    }
    var render = function () {
      var q = normalize(box.value);
      if (!q) {
        results.classList.remove('active');
        results.innerHTML = '';
        return;
      }
      var data = window.SEARCH_INDEX || [];
      var matches = data.filter(function (item) {
        var bag = [item.title, item.region, item.type, item.year, item.category, (item.tags || []).join(' ')].join(' ');
        return normalize(bag).indexOf(q) !== -1;
      }).slice(0, 10);
      if (!matches.length) {
        results.innerHTML = '<div class="search-result-item"><span><strong class="search-result-title">未找到匹配影片</strong><span class="search-result-meta">可尝试输入其他片名或题材</span></span></div>';
        results.classList.add('active');
        return;
      }
      results.innerHTML = matches.map(function (item) {
        return '<a class="search-result-item" href="' + basePath(item.href) + '"><img src="' + basePath(item.cover) + '" alt="' + item.title.replace(/"/g, '&quot;') + '"><span><strong class="search-result-title">' + item.title + '</strong><span class="search-result-meta">' + item.region + ' · ' + item.type + ' · ' + item.year + '</span></span></a>';
      }).join('');
      results.classList.add('active');
    };
    box.addEventListener('input', render);
    box.addEventListener('focus', render);
    document.addEventListener('click', function (event) {
      if (!box.contains(event.target) && !results.contains(event.target)) {
        results.classList.remove('active');
      }
    });
  });

  var cardSearch = document.querySelector('[data-card-search]');
  var regionFilter = document.querySelector('[data-filter-region]');
  var typeFilter = document.querySelector('[data-filter-type]');
  var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card]'));
  var emptyState = document.querySelector('[data-empty-state]');
  if (cards.length && (cardSearch || regionFilter || typeFilter)) {
    var filterCards = function () {
      var q = normalize(cardSearch ? cardSearch.value : '');
      var region = regionFilter ? regionFilter.value : '';
      var type = typeFilter ? typeFilter.value : '';
      var visible = 0;
      cards.forEach(function (card) {
        var text = [card.dataset.title, card.dataset.region, card.dataset.type, card.dataset.year, card.dataset.tags].join(' ');
        var ok = true;
        if (q && normalize(text).indexOf(q) === -1) {
          ok = false;
        }
        if (region && card.dataset.region !== region) {
          ok = false;
        }
        if (type && card.dataset.type !== type) {
          ok = false;
        }
        card.style.display = ok ? '' : 'none';
        if (ok) {
          visible += 1;
        }
      });
      if (emptyState) {
        emptyState.classList.toggle('active', visible === 0);
      }
    };
    [cardSearch, regionFilter, typeFilter].forEach(function (node) {
      if (node) {
        node.addEventListener('input', filterCards);
        node.addEventListener('change', filterCards);
      }
    });
  }
})();
