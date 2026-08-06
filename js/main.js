/* Adorn — main.js */
(function () {
  "use strict";

  var body = document.body;

  /* ---------- Intro animation ---------- */
  var intro = document.getElementById("intro");
  body.classList.add("lock-scroll");

  function endIntro() {
    if (!intro) return;
    intro.classList.add("intro-hide");
    body.classList.remove("lock-scroll");
    intro.addEventListener("transitionend", function handler() {
      intro.remove();
      intro.removeEventListener("transitionend", handler);
    });
  }

  // Auto-dismiss after the animation has had time to play,
  // or immediately on click/keypress for impatient visitors.
  var introTimer = setTimeout(endIntro, 2600);
  if (intro) {
    intro.addEventListener("click", function () {
      clearTimeout(introTimer);
      endIntro();
    });
  }

  /* ---------- Header scroll state ---------- */
  var header = document.getElementById("header");
  function onScroll() {
    if (window.scrollY > 20) {
      header.classList.add("scrolled");
    } else {
      header.classList.remove("scrolled");
    }
  }
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  /* ---------- Mobile nav toggle ---------- */
  var navToggle = document.getElementById("navToggle");
  var mainNav = document.getElementById("main-nav");
  if (navToggle && mainNav) {
    navToggle.addEventListener("click", function () {
      var isOpen = mainNav.classList.toggle("open");
      navToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });
    mainNav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        mainNav.classList.remove("open");
        navToggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* ---------- Scroll reveal ---------- */
  var revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry, index) {
          if (entry.isIntersecting) {
            setTimeout(function () {
              entry.target.classList.add("in-view");
            }, (index % 6) * 80);
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    revealEls.forEach(function (el) {
      io.observe(el);
    });
  } else {
    revealEls.forEach(function (el) {
      el.classList.add("in-view");
    });
  }

  /* ---------- Testimonial slider ---------- */
  var track = document.getElementById("testimonialTrack");
  var dotsWrap = document.getElementById("testimonialDots");
  if (track && dotsWrap) {
    var slides = Array.prototype.slice.call(track.children);
    var current = 0;
    var sliderTimer;

    slides.forEach(function (_, i) {
      var dot = document.createElement("button");
      dot.setAttribute("aria-label", "Show testimonial " + (i + 1));
      dot.addEventListener("click", function () {
        goTo(i);
        restart();
      });
      dotsWrap.appendChild(dot);
    });
    var dots = Array.prototype.slice.call(dotsWrap.children);

    function goTo(index) {
      slides[current].classList.remove("active");
      dots[current].classList.remove("active");
      current = (index + slides.length) % slides.length;
      slides[current].classList.add("active");
      dots[current].classList.add("active");
    }

    function restart() {
      clearInterval(sliderTimer);
      sliderTimer = setInterval(function () {
        goTo(current + 1);
      }, 5500);
    }

    goTo(0);
    restart();
  }

  /* ---------- Forms (front-end only demo handling) ---------- */
  var contactForm = document.getElementById("contactForm");
  var formNote = document.getElementById("formNote");
  if (contactForm && formNote) {
    contactForm.addEventListener("submit", function (e) {
      e.preventDefault();
      formNote.textContent = "Thank you! Your message has been noted — our team will reach out shortly.";
      contactForm.reset();
    });
  }

  var newsletterForm = document.getElementById("newsletterForm");
  if (newsletterForm) {
    newsletterForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var input = newsletterForm.querySelector("input[type=email]");
      var btn = newsletterForm.querySelector("button");
      btn.textContent = "Subscribed ✓";
      input.value = "";
      setTimeout(function () {
        btn.textContent = "Subscribe";
      }, 3000);
    });
  }

  /* ---------- Footer year ---------- */
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();
})();
