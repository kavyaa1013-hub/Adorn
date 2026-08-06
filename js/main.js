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

  /* ---------- Toast ---------- */
  var toast = document.getElementById("toast");
  var toastTimer;
  function showToast(message) {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add("is-visible");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toast.classList.remove("is-visible");
    }, 2600);
  }

  /* ---------- Shop reveal ---------- */
  var shopSection = document.getElementById("shop");
  var shopGrid = document.getElementById("shopGrid");

  function openShop() {
    if (!shopSection) return;
    var wasHidden = shopSection.hasAttribute("hidden");
    shopSection.removeAttribute("hidden");
    if (shopGrid) shopGrid.classList.add("is-open");

    // Wait a frame so the newly shown section has a real offsetTop.
    requestAnimationFrame(function () {
      var top = shopSection.getBoundingClientRect().top + window.scrollY - 70;
      window.scrollTo({ top: top, behavior: "smooth" });
    });

    if (wasHidden) showToast("Welcome to the Adorn store — 8 pieces ready to ship.");
  }

  document.querySelectorAll("[data-shop-open]").forEach(function (trigger) {
    trigger.addEventListener("click", function (e) {
      e.preventDefault();
      openShop();
    });
  });

  /* ---------- Product photos ----------
     Each card ships with an <img> pointing at assets/products/<id>.jpg. Until that
     file exists the image fails to load, so we remove it and the woven CSS pattern
     underneath stays on show. Drop a photo in with the matching name and it appears. */
  document.querySelectorAll(".shop-thumb img").forEach(function (img) {
    img.addEventListener("error", function () {
      img.remove();
    });
  });

  /* ---------- Category filters ---------- */
  var shopFilters = document.getElementById("shopFilters");
  if (shopFilters && shopGrid) {
    var cards = Array.prototype.slice.call(shopGrid.querySelectorAll(".shop-card"));
    shopFilters.addEventListener("click", function (e) {
      var chip = e.target.closest(".filter-chip");
      if (!chip) return;
      var filter = chip.dataset.filter;

      shopFilters.querySelectorAll(".filter-chip").forEach(function (c) {
        c.classList.toggle("is-active", c === chip);
      });

      var shown = 0;
      cards.forEach(function (card) {
        var match = filter === "all" || card.dataset.category === filter;
        card.classList.toggle("is-filtered", !match);
        if (match) card.style.setProperty("--i", shown++);
      });
    });
  }

  /* ---------- Cart ---------- */
  var cart = {};
  var cartBtn = document.getElementById("cartBtn");
  var cartDrawer = document.getElementById("cartDrawer");
  var drawerOverlay = document.getElementById("drawerOverlay");
  var cartClose = document.getElementById("cartClose");
  var cartBody = document.getElementById("cartBody");
  var cartCount = document.getElementById("cartCount");
  var cartTotal = document.getElementById("cartTotal");
  var cartCheckout = document.getElementById("cartCheckout");

  function rupees(amount) {
    return "₹" + amount.toLocaleString("en-IN");
  }

  function renderCart() {
    if (!cartBody) return;
    var ids = Object.keys(cart);
    var units = 0;
    var total = 0;

    ids.forEach(function (id) {
      units += cart[id].qty;
      total += cart[id].qty * cart[id].price;
    });

    cartBody.innerHTML = "";
    if (!ids.length) {
      var empty = document.createElement("p");
      empty.className = "cart-empty";
      empty.textContent = "Your bag is empty. Browse the store to add a piece.";
      cartBody.appendChild(empty);
    } else {
      ids.forEach(function (id) {
        var item = cart[id];
        var row = document.createElement("div");
        row.className = "cart-item";
        row.innerHTML =
          '<div class="cart-thumb ' + item.weave + '"></div>' +
          "<div><h4></h4><span class=\"cart-price\"></span></div>" +
          '<div class="qty">' +
          '<button type="button" data-step="-1" aria-label="Decrease quantity">&minus;</button>' +
          "<span></span>" +
          '<button type="button" data-step="1" aria-label="Increase quantity">+</button>' +
          "</div>";
        if (item.image) {
          var thumbImg = document.createElement("img");
          thumbImg.src = item.image;
          thumbImg.alt = "";
          row.querySelector(".cart-thumb").appendChild(thumbImg);
        }
        row.querySelector("h4").textContent = item.name;
        row.querySelector(".cart-price").textContent = rupees(item.price);
        row.querySelector(".qty span").textContent = item.qty;
        row.querySelectorAll(".qty button").forEach(function (btn) {
          btn.addEventListener("click", function () {
            changeQty(id, parseInt(btn.dataset.step, 10));
          });
        });
        cartBody.appendChild(row);
      });
    }

    if (cartTotal) cartTotal.textContent = rupees(total);
    if (cartCheckout) cartCheckout.disabled = !ids.length;
    if (cartCount) {
      cartCount.textContent = units;
      cartCount.classList.toggle("has-items", units > 0);
    }
  }

  function changeQty(id, step) {
    if (!cart[id]) return;
    cart[id].qty += step;
    if (cart[id].qty <= 0) {
      var removed = cart[id].name;
      delete cart[id];
      showToast(removed + " removed from your bag.");
    }
    renderCart();
  }

  function bumpCount() {
    if (!cartCount) return;
    cartCount.classList.remove("bump");
    void cartCount.offsetWidth; // restart the animation
    cartCount.classList.add("bump");
  }

  if (shopGrid) {
    shopGrid.addEventListener("click", function (e) {
      var btn = e.target.closest("[data-add]");
      if (!btn) return;
      var card = btn.closest(".shop-card");
      var id = card.dataset.id;
      var thumb = card.querySelector(".shop-thumb");
      // Null once a missing photo has been dropped, so the bag falls back to the weave too.
      var photo = card.querySelector(".shop-thumb img");

      if (cart[id]) {
        cart[id].qty += 1;
      } else {
        cart[id] = {
          name: card.dataset.name,
          price: parseInt(card.dataset.price, 10),
          weave: thumb ? thumb.classList[1] : "",
          image: photo ? photo.getAttribute("src") : "",
          qty: 1
        };
      }

      renderCart();
      bumpCount();
      showToast(card.dataset.name + " added to your bag.");

      btn.classList.add("added");
      btn.textContent = "Added ✓";
      setTimeout(function () {
        btn.classList.remove("added");
        btn.textContent = "Add to Bag";
      }, 1600);
    });
  }

  /* ---------- Cart drawer ---------- */
  function setDrawer(open) {
    if (!cartDrawer || !drawerOverlay) return;
    // The bag itself shows what was just added, so the toast would only overlap the footer.
    if (open && toast) {
      clearTimeout(toastTimer);
      toast.classList.remove("is-visible");
    }
    cartDrawer.classList.toggle("is-open", open);
    cartDrawer.setAttribute("aria-hidden", open ? "false" : "true");
    if (open) {
      drawerOverlay.removeAttribute("hidden");
      requestAnimationFrame(function () {
        drawerOverlay.classList.add("is-visible");
      });
      if (cartClose) cartClose.focus();
    } else {
      drawerOverlay.classList.remove("is-visible");
      setTimeout(function () {
        drawerOverlay.setAttribute("hidden", "");
      }, 400);
    }
  }

  if (cartBtn) cartBtn.addEventListener("click", function () { setDrawer(true); });
  if (cartClose) cartClose.addEventListener("click", function () { setDrawer(false); });
  if (drawerOverlay) drawerOverlay.addEventListener("click", function () { setDrawer(false); });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") setDrawer(false);
  });

  /* Checkout hands off to the contact form — there is no payment backend. */
  if (cartCheckout) {
    cartCheckout.addEventListener("click", function () {
      var lines = Object.keys(cart).map(function (id) {
        return "• " + cart[id].name + " × " + cart[id].qty;
      });
      if (!lines.length) return;

      var messageField = document.querySelector("#contactForm [name=message]");
      var subjectField = document.querySelector("#contactForm [name=subject]");
      if (messageField) {
        messageField.value = "I'd like to order:\n" + lines.join("\n") + "\n\nTotal: " +
          (cartTotal ? cartTotal.textContent : "");
      }
      if (subjectField) subjectField.value = "General Enquiry";

      setDrawer(false);
      document.getElementById("contact").scrollIntoView({ behavior: "smooth" });
      showToast("Your order has been added to the enquiry form below.");
    });
  }

  renderCart();

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
