/* =============================================================
   HOME PAGE JS — all homepage-only behavior in one file
   (hero dots/counters, collections grid data + render,
   brand essence video).
   Load order: main.js -> header-loader.js -> home.js
   ============================================================= */

   const API_URL = "https://api.blegab.com/api";

document.addEventListener('DOMContentLoaded', function () {
  initHeroDots();
  initCounters();
  initCollections()
  initBrandEssence();
  initTestimonials();
  initCollectionsScrollHint();
  initSocialGallery();
  initScrollReveal(); 
});

/* -----------------------------
   Scroll entrance — fades/rises each section in once,
   the first time it scrolls into view
   ----------------------------- */
function initScrollReveal() {
  var sections = document.querySelectorAll('.reveal-up');
  if (!sections.length) return;

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target); // only ever runs once
      }
    });
  }, { threshold: 0.15 });

  sections.forEach(function (section) {
    observer.observe(section);
  });
}


/* -----------------------------
   Hero pagination dots
   (visual only for now — wire up to a real slider
   once additional hero slides/images are supplied)
   ----------------------------- */
function initHeroDots() {
  var dots = document.querySelectorAll('[data-hero-dot]');
  if (!dots.length) return;

  dots.forEach(function (dot, index) {
    dot.addEventListener('click', function () {
      dots.forEach(function (d) {
        d.classList.remove('is-active');
      });
      dot.classList.add('is-active');
    });
  });
}

function initCounters() {
  var counters = document.querySelectorAll('[data-count-to]');
  if (!counters.length) return;

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        animateCount(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(function (counter) {
    observer.observe(counter);
  });
}

function animateCount(el) {
  var target = parseInt(el.getAttribute('data-count-to'), 10);
  var duration = 1400; // ms — readable pace, not instant, not sluggish
  var startTime = null;

  function step(timestamp) {
    if (!startTime) startTime = timestamp;
    var progress = Math.min((timestamp - startTime) / duration, 1);
    el.textContent = Math.floor(progress * target);
    if (progress < 1) {
      requestAnimationFrame(step);
    } else {
      el.textContent = target;
    }
  }

  requestAnimationFrame(step);
}


/* =========================================================
   COLLECTIONS DATA — powers the "Find Your Perfect Fit" grid
   on the homepage.

   TO REPLACE LATER (once the dashboard/backend is ready), swap
   this static array for a live fetch, e.g.
     fetch('/api/collections')
       .then(res => res.json())
       .then(data => {
         window.BLEGAB_COLLECTIONS = data;
         initCollections();
       });

   Each item needs:
     id     - unique string
     name   - product/collection name shown on the card
     price  - number, rendered as "From $X.00"
     image  - path to the image (drop your own images into
              assets/images/collections/ and update the path)
     alt    - alt text for the image
     url    - where "Order Now" and the card link go
   ========================================================= */

// window.BLEGAB_COLLECTIONS = [
//   { id: 'body-wave',      name: 'Body Wave Wigs',      price: 320, image: 'assets/images/collections/bodywavehomeproductimage.webp',      alt: 'Body Wave Wig',      url: 'shop.html?category=body-wave' },
//   { id: 'bone-straight',  name: 'Bone Straight Wigs',  price: 300, image: 'assets/images/collections/bonestraighthomeproductimage.webp',  alt: 'Bone Straight Wig',  url: 'shop.html?category=bone-straight' },
//   { id: 'deep-wave',      name: 'Deep Wave Wigs',      price: 320, image: 'assets/images/collections/deepwavehomeproductimage.webp',      alt: 'Deep Wave Wig',      url: 'shop.html?category=deep-wave' },
//   { id: 'highlight',      name: 'Highlight Wigs',      price: 350, image: 'assets/images/collections/highlighthomeproductimage.webp',      alt: 'Highlight Wig',      url: 'shop.html?category=highlight' },
//   { id: 'custom-colored', name: 'Custom Colored Wigs', price: 380, image: 'assets/images/collections/customcoloredhomeproductimage.webp', alt: 'Custom Colored Wig', url: 'shop.html?category=custom-colored' },
//   { id: 'bob',            name: 'Bob Wigs',            price: 280, image: 'assets/images/collections/bobhomeproductimage.webp',           alt: 'Bob Wig',            url: 'shop.html?category=bob' }
// ];

async function loadCollections() {

    try {

        const response = await fetch(
            API_URL + "/products?limit=6"
        );

        const data = await response.json();

        if (!data.success) return;

        window.BLEGAB_COLLECTIONS = data.products;

        initCollections();

    } catch (error) {

        console.error(error);

    }

}


/* -----------------------------
   Collections grid — renders cards from window.BLEGAB_COLLECTIONS
   ----------------------------- */

async function initCollections() {

    const grid = document.querySelector("[data-collections-grid]");

    if (!grid) return;

    grid.innerHTML = `
        <p class="collections__loading">
            Loading collections...
        </p>
    `;

    try {

        const response = await fetch(
            `${API_URL}/products?limit=6`
            // Later change to:
            // `${API_URL}/products?badge=Featured&limit=6`
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message);
        }

        grid.innerHTML = "";

        data.products.forEach(function (product) {

            const image = product.images?.length
                ? product.images[0]
                : "assets/images/no-image.webp";

            const badge = product.badge
                ? `<span class="collection-card__badge">${product.badge}</span>`
                : "";

            const li = document.createElement("li");

            li.className = "collection-card";

            li.innerHTML = `

<a href="shop.html?slug=${product.slug}" class="collection-card__link">

    <span class="collection-card__image-wrap">

        ${badge}

        <img
            src="${image}"
            alt="${product.name}"
            class="collection-card__image"
            loading="lazy"
        >

    </span>

    <h3 class="collection-card__name">
        ${product.name}
    </h3>

    <p class="collection-card__price">
        $${Number(product.price).toFixed(2)}
    </p>

</a>

<a
    href="shop.html?slug=${product.slug}"
    class="btn btn-primary btn--card"
>

    <span class="btn-icon-wrap">

        <svg
            class="btn-icon btn-icon--bag"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
        >
            <path
                d="M6 8h12l-1.2 11H7.2z"
                stroke-linecap="round"
                stroke-linejoin="round"
            />
            <path
                d="M9 8V6a3 3 0 0 1 6 0v2"
                stroke-linecap="round"
            />
        </svg>

        <svg
            class="btn-icon btn-icon--arrow"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
        >
            <path
                d="M5 12h14M13 6l6 6-6 6"
                stroke-linecap="round"
                stroke-linejoin="round"
            />
        </svg>

    </span>

    <span class="btn-text">
        Order Now
    </span>

</a>

`;

            grid.appendChild(li);

        });

    } catch (error) {

        console.error(error);

        grid.innerHTML = `
            <p class="collections__loading">
                Unable to load products.
            </p>
        `;

    }

}

/* -----------------------------
   Brand Essence video — autoplay background on mobile/tablet,
   click-to-play thumbnail on desktop.
   ----------------------------- */
function initBrandEssence() {
  var video = document.querySelector('[data-brand-video]');
  if (!video) return;

  video.muted = true;
  var playPromise = video.play();
  if (playPromise && playPromise.catch) {
    playPromise.catch(function () {});
  }
}

/* -----------------------------
   Testimonials carousel — 1-at-a-time on mobile/tablet,
   static 3-column on desktop (CSS disables the transform there)
   ----------------------------- */
function initTestimonials() {
  var track = document.querySelector('[data-testimonial-track]');
  var prevBtn = document.querySelector('[data-testimonial-prev]');
  var nextBtn = document.querySelector('[data-testimonial-next]');
  var dotsWrap = document.querySelector('[data-testimonial-dots]');
  if (!track || !dotsWrap) return;

  var inner = track.querySelector('.testimonials__track-inner');
  var cards = track.querySelectorAll('.testimonial-card');
  var current = 0;

  cards.forEach(function (card, index) {
    var dot = document.createElement('button');
    dot.type = 'button';
    dot.className = 'testimonials__dot';
    dot.setAttribute('aria-label', 'Go to testimonial ' + (index + 1));
    if (index === 0) dot.classList.add('is-active');
    dot.addEventListener('click', function () {
      goTo(index);
    });
    dotsWrap.appendChild(dot);
  });

  var dots = dotsWrap.querySelectorAll('.testimonials__dot');

  function goTo(index) {
    current = (index + cards.length) % cards.length;
    inner.style.transform = 'translateX(-' + (current * 100) + '%)';
    dots.forEach(function (d, i) {
      d.classList.toggle('is-active', i === current);
    });
  }

  if (prevBtn) prevBtn.addEventListener('click', function () { goTo(current - 1); });
  if (nextBtn) nextBtn.addEventListener('click', function () { goTo(current + 1); });
}


/* -----------------------------
   Collections scroll hint arrow — tablet/mobile only
   Fades out once the user starts scrolling
   ----------------------------- */
function initCollectionsScrollHint() {
  var grid = document.querySelector('[data-collections-grid]');
  if (!grid) return;

  // Only inject on mobile/tablet
  if (window.innerWidth >= 1024) return;

  var hint = document.createElement('div');
  hint.className = 'collections__scroll-hint';
  hint.setAttribute('aria-hidden', 'true');
  hint.innerHTML =
    '<span class="collections__scroll-hint-text">Swipe</span>' +
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="collections__scroll-hint-icon" aria-hidden="true">' +
      '<path d="M9 6l6 6-6 6" stroke-linecap="round" stroke-linejoin="round"/>' +
    '</svg>';

  grid.parentElement.style.position = 'relative';
  grid.parentElement.appendChild(hint);

  grid.addEventListener('scroll', function () {
    if (grid.scrollLeft > 20) {
      hint.classList.add('is-hidden');
    }
  }, { passive: true });
}

/* -----------------------------
   Social gallery dots — synced to scroll position
   ----------------------------- */
function initSocialGallery() {
  var grid = document.querySelector('[data-social-grid]');
  var dotsWrap = document.querySelector('[data-social-dots]');
  if (!grid || !dotsWrap) return;

  var items = grid.querySelectorAll('.social-gallery__item');
  var total = items.length;
  var dots = [];

  for (var i = 0; i < total; i++) {
    var dot = document.createElement('button');
    dot.type = 'button';
    dot.className = 'social-gallery__dot' + (i === 0 ? ' is-active' : '');
    dot.setAttribute('aria-label', 'Go to photo ' + (i + 1));
    (function (index) {
      dot.addEventListener('click', function () {
        var itemWidth = items[0].offsetWidth + parseInt(getComputedStyle(grid).gap || 0);
        grid.scrollTo({ left: index * itemWidth, behavior: 'smooth' });
      });
    })(i);
    dotsWrap.appendChild(dot);
    dots.push(dot);
  }

  grid.addEventListener('scroll', function () {
    var itemWidth = items[0].offsetWidth + parseInt(getComputedStyle(grid).gap || 0);
    var current = Math.round(grid.scrollLeft / itemWidth);
    dots.forEach(function (d, i) {
      d.classList.toggle('is-active', i === current);
    });
  }, { passive: true });
}