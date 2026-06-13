(function () {
  var header = document.querySelector('.site-header');
  var navToggle = document.querySelector('.nav-toggle');

  if (header && navToggle) {
    navToggle.addEventListener('click', function () {
      var isOpen = header.classList.toggle('is-open');
      navToggle.setAttribute('aria-expanded', String(isOpen));
    });
  }

  document.querySelectorAll('img').forEach(function (image) {
    image.addEventListener('error', function () {
      image.classList.add('is-missing');
      image.setAttribute('aria-hidden', 'true');
    }, { once: true });
  });

  var carousel = document.querySelector('[data-hero-carousel]');

  if (carousel) {
    var slides = Array.prototype.slice.call(carousel.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll('.hero-dot'));
    var activeIndex = 0;
    var timer = null;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }

      activeIndex = (index + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === activeIndex);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === activeIndex);
      });
    }

    function startAutoPlay() {
      stopAutoPlay();
      timer = window.setInterval(function () {
        showSlide(activeIndex + 1);
      }, 5200);
    }

    function stopAutoPlay() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        showSlide(Number(dot.dataset.slide || 0));
        startAutoPlay();
      });
    });

    carousel.addEventListener('mouseenter', stopAutoPlay);
    carousel.addEventListener('mouseleave', startAutoPlay);
    startAutoPlay();
  }

  var filterPanel = document.querySelector('.filter-panel');

  if (filterPanel) {
    var textInput = filterPanel.querySelector('[data-filter="text"]');
    var yearSelect = filterPanel.querySelector('[data-filter="year"]');
    var categorySelect = filterPanel.querySelector('[data-filter="category"]');
    var resetButton = filterPanel.querySelector('.reset-filter');
    var resultLine = filterPanel.querySelector('.filter-result');
    var searchableItems = Array.prototype.slice.call(document.querySelectorAll('.movie-card, .searchable-row'));
    var params = new URLSearchParams(window.location.search);
    var queryFromUrl = params.get('q');

    if (queryFromUrl && textInput) {
      textInput.value = queryFromUrl;
    }

    function getItemText(item) {
      return [
        item.dataset.title,
        item.dataset.year,
        item.dataset.region,
        item.dataset.type,
        item.dataset.category,
        item.dataset.tags,
        item.textContent
      ].join(' ').toLowerCase();
    }

    function applyFilters() {
      var query = textInput ? textInput.value.trim().toLowerCase() : '';
      var year = yearSelect ? yearSelect.value : '';
      var category = categorySelect ? categorySelect.value : '';
      var visibleCount = 0;

      searchableItems.forEach(function (item) {
        var text = getItemText(item);
        var yearMatched = !year || item.dataset.year === year;
        var categoryMatched = !category || item.dataset.category === category;
        var textMatched = !query || text.indexOf(query) !== -1;
        var isVisible = yearMatched && categoryMatched && textMatched;

        item.classList.toggle('is-hidden', !isVisible);

        if (isVisible) {
          visibleCount += 1;
        }
      });

      if (resultLine) {
        resultLine.textContent = '当前显示 ' + visibleCount + ' 条结果';
      }
    }

    [textInput, yearSelect, categorySelect].forEach(function (control) {
      if (control) {
        control.addEventListener('input', applyFilters);
        control.addEventListener('change', applyFilters);
      }
    });

    if (resetButton) {
      resetButton.addEventListener('click', function () {
        if (textInput) {
          textInput.value = '';
        }
        if (yearSelect) {
          yearSelect.value = '';
        }
        if (categorySelect) {
          categorySelect.value = '';
        }
        applyFilters();
      });
    }

    applyFilters();
  }
})();
