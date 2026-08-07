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
  var introTimer = setTimeout(endIntro, 900);
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

  /* Dialogs cover the toast's corner, so clear it rather than let it peek out. */
  function hideToast() {
    if (!toast) return;
    clearTimeout(toastTimer);
    toast.classList.remove("is-visible");
  }

  /* ---------- Shop reveal ---------- */
  var shopSection = document.getElementById("shop");
  var shopGrid = document.getElementById("shopGrid");

  /* A trigger may name a range to jump straight into; without one the shop
     opens on the range chooser. */
  function openShop(category) {
    if (!shopSection) return;
    var wasHidden = shopSection.hasAttribute("hidden");
    shopSection.removeAttribute("hidden");

    if (category && CATEGORY_NAMES[category]) {
      showRange(category);
    } else {
      showRanges();
    }

    // Wait a frame so the newly shown section has a real offsetTop.
    requestAnimationFrame(function () {
      var top = shopSection.getBoundingClientRect().top + window.scrollY - 70;
      window.scrollTo({ top: top, behavior: "smooth" });
    });

    if (wasHidden) {
      // Only stock that can actually be bought counts as ready to ship — the rest
      // of the grid is slots marked "coming soon".
      var ready = shopGrid
        ? shopGrid.querySelectorAll(".shop-card:not([data-placeholder])").length
        : 0;
      showToast(
        "Welcome to the Adorn store — " + ready + " piece" +
        (ready === 1 ? "" : "s") + " ready to ship, more on the loom."
      );
    }
  }

  document.querySelectorAll("[data-shop-open]").forEach(function (trigger) {
    trigger.addEventListener("click", function (e) {
      e.preventDefault();
      openShop(trigger.getAttribute("data-shop-open"));
    });
  });

  /* ---------- Product photos ----------
     Each card ships with an <img> pointing at assets/products/<id>.jpg. Until that
     file exists the image fails to load, so we remove it and the woven CSS pattern
     underneath stays on show. Drop a photo in with the matching name and it appears. */
  document.querySelectorAll(".shop-photo").forEach(function (img) {
    img.addEventListener("error", function () {
      img.remove();
    });
  });

  /* ---------- Product galleries ----------
     Products shot from several angles carry a thumbnail strip that swaps the main photo. */
  document.querySelectorAll(".shop-gallery").forEach(function (gallery) {
    gallery.addEventListener("click", function (e) {
      var thumbBtn = e.target.closest("button");
      if (!thumbBtn) return;

      var main = gallery.parentElement.querySelector(".shop-photo");
      if (!main || main.getAttribute("src") === thumbBtn.dataset.src) return;

      main.classList.add("is-swapping");
      var next = new Image();
      next.onload = function () {
        main.src = thumbBtn.dataset.src;
        main.classList.remove("is-swapping");
      };
      next.onerror = function () {
        main.classList.remove("is-swapping");
      };
      next.src = thumbBtn.dataset.src;

      gallery.querySelectorAll("button").forEach(function (b) {
        b.classList.toggle("is-active", b === thumbBtn);
      });
    });
  });

  /* ---------- Ranges ----------
     The shop opens on the ranges rather than a wall of products; picking one
     swaps in just that range's pieces. */
  var categoryGrid = document.getElementById("categoryGrid");
  var shopProducts = document.getElementById("shopProducts");
  var shopEmpty = document.getElementById("shopEmpty");
  var shopNote = document.getElementById("shopNote");
  var shopHeading = document.getElementById("shopHeading");
  var shopSub = document.getElementById("shopSub");
  var backToCategories = document.getElementById("backToCategories");

  var CATEGORY_NAMES = {
    bedsheets: "Bed Sheets",
    carpets: "Carpets"
  };
  var HEADING_DEFAULT = shopHeading ? shopHeading.textContent : "";
  var SUB_DEFAULT = shopSub ? shopSub.textContent : "";

  var cards = shopGrid
    ? Array.prototype.slice.call(shopGrid.querySelectorAll(".shop-card"))
    : [];

  function countIn(category) {
    return cards.filter(function (card) {
      return card.dataset.category === category;
    }).length;
  }

  function readyIn(category) {
    return cards.filter(function (card) {
      return card.dataset.category === category && !card.hasAttribute("data-placeholder");
    }).length;
  }

  // Say what is actually in each range, so a tile never oversells itself.
  if (categoryGrid) {
    categoryGrid.querySelectorAll("[data-count-for]").forEach(function (meta) {
      var category = meta.dataset.countFor;
      var total = countIn(category);
      var ready = readyIn(category);
      if (!total) {
        meta.textContent = "Coming soon";
      } else if (ready && total > ready) {
        meta.textContent = ready + " ready to ship \u00b7 " + (total - ready) + " more";
      } else if (ready) {
        meta.textContent = ready + " ready to ship";
      } else {
        meta.textContent = total + " on the way";
      }
    });
  }

  function showRange(category) {
    var shown = 0;
    cards.forEach(function (card) {
      var match = card.dataset.category === category;
      card.classList.toggle("is-filtered", !match);
      if (match) card.style.setProperty("--i", shown++);
    });

    // One or two pieces look stranded across a four-column grid, so narrow and centre it.
    if (shopGrid) {
      shopGrid.classList.toggle("is-sparse", shown > 0 && shown < 3);
      shopGrid.hidden = shown === 0;
      // Restart the staggered entrance so each range animates in as it is chosen.
      shopGrid.classList.remove("is-open");
      void shopGrid.offsetWidth;
      shopGrid.classList.add("is-open");
    }
    if (shopEmpty) shopEmpty.hidden = shown > 0;
    // Shipping and tax terms only mean something once there is something to buy.
    if (shopNote) shopNote.hidden = shown === 0;
    if (shopHeading) shopHeading.textContent = CATEGORY_NAMES[category] || HEADING_DEFAULT;
    if (shopSub) shopSub.hidden = true;

    if (categoryGrid) categoryGrid.hidden = true;
    if (shopProducts) shopProducts.hidden = false;
  }

  function showRanges() {
    if (categoryGrid) categoryGrid.hidden = false;
    if (shopProducts) shopProducts.hidden = true;
    if (shopHeading) shopHeading.textContent = HEADING_DEFAULT;
    if (shopSub) {
      shopSub.textContent = SUB_DEFAULT;
      shopSub.hidden = false;
    }
  }

  if (categoryGrid) {
    categoryGrid.addEventListener("click", function (e) {
      var tile = e.target.closest(".category-tile");
      if (!tile) return;
      showRange(tile.dataset.category);
    });
  }

  if (backToCategories) backToCategories.addEventListener("click", showRanges);

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

  function addProductToCart(card, qty) {
    var id = card.dataset.id;
    var thumb = card.querySelector(".shop-thumb");
    // Null once a missing photo has been dropped, so the bag falls back to the weave too.
    var photo = card.querySelector(".shop-photo");

    if (cart[id]) {
      cart[id].qty += qty;
    } else {
      cart[id] = {
        name: card.dataset.name,
        price: parseInt(card.dataset.price, 10),
        weave: thumb ? thumb.classList[1] : "",
        image: photo ? photo.getAttribute("src") : "",
        qty: qty
      };
    }

    renderCart();
    bumpCount();
    showToast(card.dataset.name + (qty > 1 ? " × " + qty : "") + " added to your bag.");
  }

  /* A slot with no price yet can't go in a bag, so it routes to the enquiry form. */
  function enquireAbout(card) {
    var messageField = document.querySelector("#contactForm [name=message]");
    var subjectField = document.querySelector("#contactForm [name=subject]");
    var contact = document.getElementById("contact");

    if (messageField) {
      messageField.value = "I'd like to know more about: " + card.dataset.name +
        "\n\nCould you send sizes, colours and pricing?";
    }
    if (subjectField) {
      var subjects = { bedsheets: "Bed Sheets Order", carpets: "Carpet Order" };
      subjectField.value = subjects[card.dataset.category] || "General Enquiry";
    }

    closeProduct();
    if (contact) contact.scrollIntoView({ behavior: "smooth" });
    showToast("Tell us what you need — the form below is ready.");
  }

  if (shopGrid) {
    shopGrid.addEventListener("click", function (e) {
      var enquireBtn = e.target.closest("[data-enquire]");
      if (enquireBtn) {
        enquireAbout(enquireBtn.closest(".shop-card"));
        return;
      }

      var btn = e.target.closest("[data-add]");
      if (btn) {
        var card = btn.closest(".shop-card");
        addProductToCart(card, 1);
        btn.classList.add("added");
        btn.textContent = "Added ✓";
        setTimeout(function () {
          btn.classList.remove("added");
          btn.textContent = "Add to Bag";
        }, 1600);
        return;
      }
      // The thumbnail strip has its own handler — don't treat those as a card click.
      if (e.target.closest(".shop-gallery")) return;

      var openCard = e.target.closest(".shop-card");
      if (openCard) openProduct(openCard);
    });
  }

  /* Cards open the quick view, so they need to behave like buttons for keyboards too. */
  document.querySelectorAll(".shop-card").forEach(function (card) {
    card.tabIndex = 0;
    card.setAttribute("role", "button");
    card.setAttribute("aria-label", "Quick view: " + card.dataset.name);
    card.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        openProduct(card);
      }
    });
  });

  /* ---------- Product quick view ---------- */
  var productModal = document.getElementById("productModal");
  var productOverlay = document.getElementById("productOverlay");
  var pmClose = document.getElementById("pmClose");
  var pmMain = document.getElementById("pmMain");
  var pmThumbs = document.getElementById("pmThumbs");
  var pmCat = document.getElementById("pmCat");
  var pmTitle = document.getElementById("pmTitle");
  var pmDetail = document.getElementById("pmDetail");
  var pmPrice = document.getElementById("pmPrice");
  var pmQty = document.getElementById("pmQty");
  var pmQtyRow = document.getElementById("pmQtyRow");
  var pmMinus = document.getElementById("pmMinus");
  var pmPlus = document.getElementById("pmPlus");
  var pmAdd = document.getElementById("pmAdd");

  var activeCard = null;
  var lastFocused = null;
  var quantity = 1;
  var MAX_QTY = 20;

  function setQty(n) {
    quantity = Math.min(MAX_QTY, Math.max(1, n));
    if (pmQty) pmQty.textContent = quantity;
    if (pmMinus) pmMinus.disabled = quantity <= 1;
    if (pmPlus) pmPlus.disabled = quantity >= MAX_QTY;
  }

  function swapMainPhoto(mainImg, src) {
    if (mainImg.getAttribute("src") === src) return;
    mainImg.classList.add("is-swapping");
    var pre = new Image();
    pre.onload = function () {
      mainImg.src = src;
      mainImg.classList.remove("is-swapping");
    };
    pre.onerror = function () {
      mainImg.classList.remove("is-swapping");
    };
    pre.src = src;
  }

  function buildModalMedia(card) {
    var thumb = card.querySelector(".shop-thumb");
    pmMain.className = "pm-main " + (thumb ? thumb.classList[1] : "");
    pmMain.innerHTML = "";
    pmThumbs.innerHTML = "";

    // Prefer the gallery's full set; otherwise whatever single photo survived loading.
    var sources = [];
    var galleryBtns = card.querySelectorAll(".shop-gallery button");
    if (galleryBtns.length) {
      galleryBtns.forEach(function (b) { sources.push(b.dataset.src); });
    } else {
      var single = card.querySelector(".shop-photo");
      if (single) sources.push(single.getAttribute("src"));
    }
    // No photos yet: the woven pattern on .pm-main stands in on its own.
    if (!sources.length) return;

    var main = document.createElement("img");
    main.src = sources[0];
    main.alt = card.dataset.name;
    pmMain.appendChild(main);

    if (sources.length < 2) return;

    sources.forEach(function (src, i) {
      var b = document.createElement("button");
      b.type = "button";
      b.setAttribute("aria-label", "View photo " + (i + 1) + " of " + sources.length);
      if (i === 0) b.classList.add("is-active");
      var im = document.createElement("img");
      im.src = src;
      im.alt = "";
      b.appendChild(im);
      b.addEventListener("click", function () {
        swapMainPhoto(main, src);
        pmThumbs.querySelectorAll("button").forEach(function (c) {
          c.classList.toggle("is-active", c === b);
        });
      });
      pmThumbs.appendChild(b);
    });
  }

  function openProduct(card) {
    if (!productModal) return;
    activeCard = card;
    lastFocused = document.activeElement;

    var tag = card.querySelector(".tag");
    var detail = card.querySelector(".shop-info p");
    var price = card.querySelector(".price");
    var isPlaceholder = card.hasAttribute("data-placeholder");

    pmCat.textContent = tag ? tag.textContent : "";
    pmTitle.textContent = card.dataset.name;
    pmDetail.textContent = detail ? detail.textContent : "";

    // A slot without a price offers an enquiry rather than a quantity and a bag.
    pmPrice.textContent = isPlaceholder
      ? "Price on request"
      : (price ? price.textContent : rupees(parseInt(card.dataset.price, 10)));
    pmPrice.classList.toggle("is-tbc", isPlaceholder);
    if (pmQtyRow) pmQtyRow.hidden = isPlaceholder;
    pmAdd.textContent = isPlaceholder ? "Enquire About This Piece" : "Add to Bag";

    buildModalMedia(card);
    setQty(1);
    hideToast();

    productOverlay.removeAttribute("hidden");
    productModal.removeAttribute("hidden");
    requestAnimationFrame(function () {
      productOverlay.classList.add("is-visible");
      productModal.classList.add("is-open");
    });
    // Locking the html element rather than body keeps the page scroll position.
    document.documentElement.classList.add("modal-open");
    pmClose.focus();
  }

  function closeProduct() {
    if (!productModal || productModal.hasAttribute("hidden")) return;
    productOverlay.classList.remove("is-visible");
    productModal.classList.remove("is-open");
    document.documentElement.classList.remove("modal-open");
    setTimeout(function () {
      productModal.setAttribute("hidden", "");
      productOverlay.setAttribute("hidden", "");
    }, 400);
    if (lastFocused && lastFocused.focus) lastFocused.focus();
    activeCard = null;
  }

  if (pmMinus) pmMinus.addEventListener("click", function () { setQty(quantity - 1); });
  if (pmPlus) pmPlus.addEventListener("click", function () { setQty(quantity + 1); });
  if (pmClose) pmClose.addEventListener("click", closeProduct);
  if (productOverlay) productOverlay.addEventListener("click", closeProduct);

  if (pmAdd) {
    pmAdd.addEventListener("click", function () {
      if (!activeCard) return;
      if (activeCard.hasAttribute("data-placeholder")) {
        enquireAbout(activeCard);
        return;
      }
      addProductToCart(activeCard, quantity);
      closeProduct();
    });
  }

  /* Keep Tab inside the dialog while it is open. */
  if (productModal) {
    productModal.addEventListener("keydown", function (e) {
      if (e.key !== "Tab") return;
      var focusables = productModal.querySelectorAll("button:not(:disabled)");
      if (!focusables.length) return;
      var first = focusables[0];
      var last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    });
  }

  /* ---------- Cart drawer ---------- */
  function setDrawer(open) {
    if (!cartDrawer || !drawerOverlay) return;
    // The bag itself shows what was just added, so the toast would only overlap the footer.
    if (open) hideToast();
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
    if (e.key !== "Escape") return;
    closeProduct();
    setDrawer(false);
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
