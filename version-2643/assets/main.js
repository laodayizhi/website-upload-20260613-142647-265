document.addEventListener("DOMContentLoaded", function () {
  var navToggle = document.querySelector("[data-nav-toggle]");
  var nav = document.querySelector("[data-site-nav]");

  if (navToggle && nav) {
    navToggle.addEventListener("click", function () {
      nav.classList.toggle("is-open");
    });
  }

  var hero = document.querySelector("[data-hero]");

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var current = 0;

    var showSlide = function (index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === current);
      });
    };

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        showSlide(Number(dot.getAttribute("data-hero-dot")) || 0);
      });
    });

    if (slides.length > 1) {
      window.setInterval(function () {
        showSlide(current + 1);
      }, 5800);
    }
  }

  var searchInput = document.querySelector("[data-movie-search]");
  var yearFilter = document.querySelector("[data-year-filter]");
  var cards = Array.prototype.slice.call(document.querySelectorAll("[data-movie-card]"));

  var applyFilters = function () {
    if (!cards.length) {
      return;
    }

    var query = searchInput ? searchInput.value.trim().toLowerCase() : "";
    var year = yearFilter ? yearFilter.value : "";
    var visibleCount = 0;

    cards.forEach(function (card) {
      var text = (card.getAttribute("data-search") || card.getAttribute("data-title") || "").toLowerCase();
      var cardYear = card.getAttribute("data-year") || "";
      var matchesQuery = !query || text.indexOf(query) !== -1;
      var matchesYear = !year || cardYear === year;
      var shouldShow = matchesQuery && matchesYear;

      card.classList.toggle("is-hidden", !shouldShow);

      if (shouldShow) {
        visibleCount += 1;
      }
    });

    document.body.classList.toggle("has-empty-filter", visibleCount === 0);
  };

  if (searchInput) {
    searchInput.addEventListener("input", applyFilters);
  }

  if (yearFilter) {
    yearFilter.addEventListener("change", applyFilters);
  }
});
