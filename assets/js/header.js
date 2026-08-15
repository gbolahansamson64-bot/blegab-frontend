/* =========================================================
   HEADER (self-contained, no fetch, no server required)

   The header markup lives right here as a JS string. When this
   script runs, it immediately replaces <div data-site-header></div>
   with the real header. This runs synchronously the moment the
   browser reaches this <script> tag in the HTML — no network
   request, no waiting, no race condition.

   TO ADD THE HEADER TO A NEW PAGE:
     1. Put <div data-site-header></div> where you want it (top of <body>)
     2. Right after it, add: <script src="assets/js/header.js"></script>
     3. Load assets/css/header.css in that page's <head>
     4. Load assets/js/main.js after this script (it wires up clicks)

   TO EDIT THE HEADER: change the HTML string below, ONE place,
   and it updates on every page that includes this file.
   ========================================================= */

(function () {
  var mount = document.querySelector('[data-site-header]');
  if (!mount) return;

  mount.outerHTML = `  <header class="site-header">

<div class="announcement-bar" data-announcement-bar>
  <div class="announcement-bar__marquee">
    <div class="announcement-bar__track">

      <!-- Group 1 (visible) -->
      <div class="announcement-bar__group">
        <span class="announcement-bar__item">
          <svg class="announcement-bar__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
            <path d="M3 7h11v9H3z" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M14 10h4l3 3v3h-7z" stroke-linecap="round" stroke-linejoin="round"/>
            <circle cx="7" cy="18" r="1.6"/>
            <circle cx="17.5" cy="18" r="1.6"/>
          </svg>
          Free Shipping On All Orders Over $500
        </span>
        <span class="announcement-bar__dot"></span>

        <span class="announcement-bar__item">Free Shipping On All Orders Over $500</span>
        <span class="announcement-bar__dot"></span>

        <span class="announcement-bar__item">Free Shipping On All Orders Over $500</span>
        <span class="announcement-bar__dot"></span>

        <span class="announcement-bar__item">Free Shipping On All Orders Over $500</span>
        <span class="announcement-bar__dot"></span>

        <span class="announcement-bar__item">Free Shipping On All Orders Over $500</span>
        <span class="announcement-bar__dot"></span>
      </div>

      <!-- Group 2 (exact duplicate, hidden from screen readers, makes the loop seamless) -->
      <div class="announcement-bar__group" aria-hidden="true">
        <span class="announcement-bar__item">Free Shipping On All Orders Over $500</span>
        <span class="announcement-bar__dot"></span>

        <span class="announcement-bar__item">Free Shipping On All Orders Over $500</span>
        <span class="announcement-bar__dot"></span>

        <span class="announcement-bar__item">Free Shipping On All Orders Over $500</span>
        <span class="announcement-bar__dot"></span>

        <span class="announcement-bar__item">Free Shipping On All Orders Over $500</span>
        <span class="announcement-bar__dot"></span>

        <span class="announcement-bar__item">Free Shipping On All Orders Over $500</span>
        <span class="announcement-bar__dot"></span>
      </div>

    </div>
  </div>
  <button type="button" class="announcement-bar__close" data-announcement-close aria-label="Dismiss announcement">

        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
          <path d="M6 6l12 12M18 6L6 18" stroke-linecap="round"/>
        </svg>
      </button>
    </div>

    <!-- Main header row -->
    <div class="main-header">
      <div class="container main-header__inner">

        <!-- Mobile menu toggle -->
        <button type="button" class="menu-toggle" data-menu-toggle aria-expanded="false" aria-controls="primary-nav" aria-label="Open menu">
          <span class="menu-toggle__bar"></span>
          <span class="menu-toggle__bar"></span>
          <span class="menu-toggle__bar"></span>
        </button>

        <a href="index.html" class="site-logo" aria-label="Blegab Luxury Wigs — Home">
            <img src="assets/images/logo.png" alt="Blegab Luxury Wigs" class="site-logo__image" />
          </a>

        <!-- Primary navigation — fixed slide-in drawer on mobile/tablet,
             inline bar in the header row on desktop (see header.css) -->
        <nav class="primary-nav" id="primary-nav" data-primary-nav aria-label="Primary">
      <div class="primary-nav__header">
        <span class="primary-nav__title">Menus</span>
        <button type="button" class="primary-nav__close" data-nav-close aria-label="Close menu">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
            <path d="M6 6l12 12M18 6L6 18" stroke-linecap="round"/>
          </svg>
        </button>
      </div>

      <ul class="nav-list">
        <li class="nav-item">
          <a href="index.html" class="nav-link">Home</a>
        </li>

        <li class="nav-item">
          <a href="shop.html" class="nav-link">Shop</a>
        </li>


        <li class="nav-item">
          <a href="about-us.html" class="nav-link">About Us</a>
        </li>

<li class="nav-item">
          <a href="contact-us.html" class="nav-link">Contact Us</a>
        </li>

<li class="nav-item has-dropdown nav-item--account">
          <a href="account.html" class="nav-link">
            <span class="nav-link__label-group">
              <svg class="nav-link__icon nav-link__icon--outline" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                <circle cx="12" cy="8" r="4"/>
                <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke-linecap="round"/>
              </svg>
              <svg class="nav-link__icon nav-link__icon--filled" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <circle cx="12" cy="8" r="4"/>
                <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
              </svg>
              Account
            </span>
            <svg class="nav-link__caret" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
              <path d="M6 9l6 6 6-6" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </a>
          <ul class="nav-dropdown nav-dropdown--account">
            <li data-account-guest>
              <a href="login.html" class="nav-dropdown__link nav-dropdown__link--signin">
                <svg class="nav-dropdown__link-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                  <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M10 17l5-5-5-5" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M15 12H3" stroke-linecap="round"/>
                </svg>
                Sign In
              </a>
            </li>
            <li data-account-guest>
              <a href="signup.html" class="nav-dropdown__link nav-dropdown__link--signup">
                <svg class="nav-dropdown__link-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                  <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M10 17l5-5-5-5" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M15 12H3" stroke-linecap="round"/>
                </svg>
                Sign Up
              </a>
            </li>
            <li data-account-signed-in hidden>
              <p class="nav-dropdown__greeting" data-account-user></p>
            </li>
            <li data-account-signed-in hidden>
              <a href="my-orders.html" class="nav-dropdown__link">
                <svg class="nav-dropdown__link-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                  <path d="M6 2h12v20H6z" stroke-linejoin="round"/>
                  <path d="M9 6h6" stroke-linecap="round"/>
                  <path d="M9 10h6" stroke-linecap="round"/>
                  <path d="M9 14h4" stroke-linecap="round"/>
                </svg>
                My Orders
              </a>
            </li>
            <li data-account-signed-in hidden>
              <a href="profile.html" class="nav-dropdown__link nav-dropdown__link--profile">
                <span class="profile-btn__icon-circle">
                  <svg class="nav-dropdown__link-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                    <circle cx="12" cy="8" r="4"/>
                    <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke-linecap="round"/>
                  </svg>
                </span>
                Profile
              </a>
            </li>
            <li data-account-signed-in hidden>
              <button type="button" class="nav-dropdown__link nav-dropdown__link--logout" data-account-signout>
                <svg class="nav-dropdown__link-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M16 17l5-5-5-5" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M21 12H9" stroke-linecap="round"/>
                </svg>
                Sign Out
              </button>
            </li>
          </ul>
        </li>
      </ul>
    </nav>

        <!-- Search (tablet/desktop) -->
          <!-- Search (tablet/desktop) -->
          <div class="header-search" data-desktop-search>
            <button type="button" class="header-search__toggle" data-desktop-search-toggle aria-label="Search" aria-expanded="false">
              <svg class="header-action__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                <circle cx="11" cy="11" r="7"/>
                <path d="M21 21l-4.35-4.35" stroke-linecap="round"/>
              </svg>
            </button>
            <form class="header-search__field" id="desktop-search-form" role="search" action="/search" method="get">
              <input type="search" name="q" id="desktop-search-input" class="header-search__input" data-search placeholder="Search for wigs, collections..." aria-label="Search for wigs, collections" autocomplete="off" />
              <button type="submit" class="header-search__submit" aria-label="Submit search">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                  <circle cx="11" cy="11" r="7"/>
                  <path d="M21 21l-4.35-4.35" stroke-linecap="round"/>
                </svg>
              </button>
            </form>
            <div class="search-results" data-search-results hidden></div>
          </div>

        <!-- Actions: search icon (mobile) / account / cart -->
<div class="header-actions">
  <div class="search-expand" data-search-expand>
    <form class="search-expand__field" id="mobile-search-form" role="search" action="/search" method="get">
      <input type="search" name="q" id="mobile-search-input" class="search-expand__input" data-search placeholder="Search for wigs, collections..." aria-label="Search for wigs, collections" autocomplete="off" />
    </form>
    <div class="search-results" data-search-results hidden></div>
    <button type="button" class="search-expand__icon" data-search-toggle aria-label="Search" aria-expanded="false">
      <svg class="header-action__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
        <circle cx="11" cy="11" r="7"/>
        <path d="M21 21l-4.35-4.35" stroke-linecap="round"/>
      </svg>
    </button>
  </div>

<div class="account-menu" data-account-menu>
    <button type="button" class="header-action account-menu__trigger" data-account-toggle aria-haspopup="true" aria-expanded="false" aria-label="Account menu">
      <svg class="header-action__icon account-menu__icon--outline" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
        <circle cx="12" cy="8" r="4"/>
        <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke-linecap="round"/>
      </svg>
      <svg class="header-action__icon account-menu__icon--filled" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <circle cx="12" cy="8" r="4"/>
        <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
      </svg>
      <span class="header-action__label">Account</span>
    </button>

    <div class="account-dropdown" data-account-dropdown>
      <a href="login.html" class="account-dropdown__item" data-account-guest id="account-login-link">
        <svg class="account-dropdown__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
          <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M10 17l5-5-5-5" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M15 12H3" stroke-linecap="round"/>
        </svg>
        Sign In
      </a>

      <a href="signup.html" class="account-dropdown__item" data-account-guest id="account-link">
        <svg class="account-dropdown__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
          <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M10 17l5-5-5-5" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M15 12H3" stroke-linecap="round"/>
        </svg>
        Sign Up
      </a>

      <p class="account-dropdown__greeting" data-account-user data-account-signed-in hidden></p>

      <a
  href="my-orders.html"
  class="account-dropdown__item"
  data-account-signed-in
  hidden
>
  <svg
    class="account-dropdown__icon"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    aria-hidden="true"
  >
    <path
      d="M6 2h12v20H6z"
      stroke-linejoin="round"
    />
    <path
      d="M9 6h6"
      stroke-linecap="round"
    />
    <path
      d="M9 10h6"
      stroke-linecap="round"
    />
    <path
      d="M9 14h4"
      stroke-linecap="round"
    />
  </svg>

  My Orders
</a>

      <a href="profile.html" class="account-dropdown__item account-dropdown__item--profile" data-account-signed-in hidden>
        <span class="profile-btn__icon-circle">
          <svg class="account-dropdown__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
            <circle cx="12" cy="8" r="4"/>
            <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke-linecap="round"/>
          </svg>
        </span>
        Profile
      </a>

      <button type="button" class="account-dropdown__item account-dropdown__item--logout" data-account-signout data-account-signed-in hidden>
        <svg class="account-dropdown__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M16 17l5-5-5-5" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M21 12H9" stroke-linecap="round"/>
        </svg>
        Sign Out
      </button>
    </div>
  </div>

  <button type="button" class="header-action cart-menu__trigger" data-cart-toggle aria-haspopup="true" aria-expanded="false" aria-label="Cart">
    <svg class="header-action__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
      <path d="M6 8h12l-1.2 11H7.2z" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M9 8V6a3 3 0 0 1 6 0v2" stroke-linecap="round"/>
    </svg>
    <span class="header-action__label">Cart</span>
    <span class="header-action__count" data-cart-count>0</span>
  </button>
</div>

      </div>
    </div>

    <!-- Overlay for mobile nav drawer -->
    <div class="nav-overlay" data-nav-overlay></div>

    <!-- Overlay for cart drawer -->
    <div class="cart-overlay" data-cart-overlay></div>

    <!-- Cart drawer -->
    <aside class="cart-drawer" data-cart-drawer aria-label="Shopping cart">
      <div class="cart-drawer__header">
        <span class="cart-drawer__title">Your Cart</span>
        <button type="button" class="cart-drawer__close" data-cart-close aria-label="Close cart">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
            <path d="M6 6l12 12M18 6L6 18" stroke-linecap="round"/>
          </svg>
        </button>
      </div>

      <div class="cart-drawer__body" data-cart-body>
       <p class="cart-drawer__empty">Your cart is empty</p>
      </div>

      <div class="cart-drawer__footer">


    <a
        href="cart.html"
        class="btn btn-primary cart-drawer__cta"
    >

        View Cart

    </a>

</div>
    </aside>

    <!-- Primary navigation -->

  </header>`;

  setActiveNavItem();
  initDesktopSearchToggle();
})();

function initDesktopSearchToggle() {
  var header = document.querySelector('.site-header');
  var wrap = document.querySelector('[data-desktop-search]');
  var toggle = document.querySelector('[data-desktop-search-toggle]');
  if (!header || !wrap || !toggle) return;

  toggle.addEventListener('click', function (e) {
    e.stopPropagation();
    var isOpen = wrap.classList.toggle('is-open');
    header.classList.toggle('search-active', isOpen);
    toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    if (isOpen) {
      var input = wrap.querySelector('.header-search__input');
      if (input) input.focus();
    }
  });

  document.addEventListener('click', function (e) {
    if (wrap.classList.contains('is-open') && !wrap.contains(e.target)) {
      wrap.classList.remove('is-open');
      header.classList.remove('search-active');
      toggle.setAttribute('aria-expanded', 'false');
    }
  });
}

/* -----------------------------
   Mark the current page's nav tab as active.
   Runs once, right after the header markup is injected above.

   Matching strategy (in priority order):
     1. Exact match: a nav-item's OWN top-level link (the direct
        <a class="nav-link">) equals the full current URL
        (pathname + search) — handles query-based tabs correctly.
     2. Exact match on pathname + search against ANY link inside
        the item, including dropdown links — so a dropdown pick
        like shop.html?category=bob still highlights its parent tab.
     3. Fallback: filename-only match (ignores query string) on the
        item's own top-level link — handles plain pages like
        about-us.html, contact-us.html, index.html.
   ----------------------------- */
function setActiveNavItem() {
  var navItems = document.querySelectorAll('.nav-item');
  if (!navItems.length) return;

  var currentPath = window.location.pathname.split('/').pop() || 'index.html';
  var currentFull = currentPath + window.location.search; // e.g. "shop.html?category=bob"

  navItems.forEach(function (item) {
    item.classList.remove('is-active');
  });

  var matched = null;

  // Pass 1: exact full match on the item's own top-level link
  navItems.forEach(function (item) {
    if (matched) return;
    var ownLink = item.querySelector(':scope > a.nav-link');
    if (!ownLink) return;
    var ownHref = ownLink.getAttribute('href').split('/').pop();
    if (ownHref === currentFull) matched = item;
  });

  // Pass 2: exact full match on any link inside the item (covers dropdowns)
  if (!matched) {
    navItems.forEach(function (item) {
      if (matched) return;
      var links = item.querySelectorAll('a[href]');
      links.forEach(function (link) {
        var href = link.getAttribute('href').split('/').pop();
        if (href === currentFull) matched = item;
      });
    });
  }

  // Pass 3: filename-only fallback on the item's own top-level link
  if (!matched) {
    navItems.forEach(function (item) {
      if (matched) return;
      var ownLink = item.querySelector(':scope > a.nav-link');
      if (!ownLink) return;
      var ownHref = ownLink.getAttribute('href').split('?')[0].split('/').pop();
      if (ownHref === currentPath) matched = item;
    });
  }

  if (matched) matched.classList.add('is-active');
}


/* ===========================================================
   API
=========================================================== */

const API = "https://backend-6j62.onrender.com/api";

/* ===========================================================
   Helpers
=========================================================== */

async function fetchAPI(endpoint, options = {}) {

    const response = await fetch(`${API}${endpoint}`, {
        credentials: "include",
        ...options
    });

    const data = await response.json();

    return {
        response,
        data
    };

}

/* ===========================================================
   CART
=========================================================== */



/* ===========================================================
   ACCOUNT
=========================================================== */

async function loadCurrentUser() {

    try {

        const { response, data } = await fetchAPI("/auth/me");

        if (!response.ok || !data.success) {

            showGuestUI();

            return;

        }

        showLoggedInUI(data.user);

        startHeartbeat();

    } catch (error) {

        console.error(error);

        showGuestUI();

    }

}

function showGuestUI() {

    document.querySelectorAll("[data-account-guest]").forEach(el => {

        el.hidden = false;

    });

    document.querySelectorAll("[data-account-signed-in]").forEach(el => {

        el.hidden = true;

    });

}

function showLoggedInUI(user) {

    document.querySelectorAll("[data-account-guest]").forEach(el => {

        el.hidden = true;

    });

    document.querySelectorAll("[data-account-signed-in]").forEach(el => {

        el.hidden = false;

    });

    document.querySelectorAll("[data-account-user]").forEach(el => {

        el.textContent = `Hi, ${user.firstName || user.firstname}`;

    });

}

async function logoutUser() {

    try {

        const { response, data } = await fetchAPI("/auth/logout", {

            method: "POST"

        });

        if (!response.ok || !data.success) return;

        showGuestUI();

        if (window.BLEGAB_CART) {
            await window.BLEGAB_CART.renderBadge();
            await window.BLEGAB_CART.renderDrawer();
        }

        window.location.href = "index.html";

    } catch (error) {

        console.error(error);

    }

}

async function loadHeaderCategories() {

    try {

        const { response, data } = await fetchAPI("/categories");

        if (!response.ok || !data.success) return;

        const shopDropdown =
            document.getElementById("shop-dropdown");

        const collectionsDropdown =
            document.getElementById("collections-dropdown");

        if (shopDropdown) {

            shopDropdown.innerHTML = `
                <li>
                    <a href="shop.html"
                       class="nav-dropdown__link">
                        All Wigs
                    </a>
                </li>
            `;

            data.categories.forEach(category => {

                shopDropdown.innerHTML += `
                    <li>
                        <a
                           href="shop.html?category=${category.slug}"
                           class="nav-dropdown__link">

                           ${category.name}

                        </a>
                    </li>
                `;

            });

        }

        if (collectionsDropdown) {

            collectionsDropdown.innerHTML = "";

            data.categories.forEach(category => {

                collectionsDropdown.innerHTML += `
                    <li>
                        <a
                           href="shop.html?category=${category.slug}"
                           class="nav-dropdown__link">

                           ${category.name}

                        </a>
                    </li>
                `;

            });

        }

    }

    catch (error) {

        console.error(error);

    }

}

/* ===========================================================
   INITIALIZE HEADER
=========================================================== */

document.addEventListener("DOMContentLoaded", () => {

    loadHeaderCategories();

    loadCurrentUser();

    initializeSearch();

    document.querySelectorAll("[data-account-signout]").forEach(button => {

        button.addEventListener("click", logoutUser);

    });

});

/* ===========================================================
   LIVE SEARCH
=========================================================== */

let searchTimeout;

function debounce(callback, delay = 300) {

    clearTimeout(searchTimeout);

    searchTimeout = setTimeout(callback, delay);

}

async function searchProducts(keyword, resultsBox) {

    if (!keyword.trim()) {

        resultsBox.hidden = true;
        resultsBox.innerHTML = "";

        return;

    }

    try {

        const { data } = await fetchAPI(`/products?keyword=${encodeURIComponent(keyword)}&limit=5`);

        if (!data.success) return;

        renderSearchResults(data.products, resultsBox);

    }

    catch (error) {

        console.error(error);

    }

}

function renderSearchResults(products, resultsBox) {

    if (!products.length) {

        resultsBox.innerHTML = `

            <div class="search-results__empty">

                No products found

            </div>

        `;

        resultsBox.hidden = false;

        return;

    }

    resultsBox.innerHTML = products.map(product => `

        <a
            href="product.html?slug=${product.slug}"
            class="search-result"
        >

            <img
                src="https://backend-6j62.onrender.com${product.images[0]}"
                alt="${product.name}"
            >

            <div>

                <h4>${product.name}</h4>

                <p>$${product.price}</p>

            </div>

        </a>

    `).join("");

    resultsBox.hidden = false;

}

function initializeSearch() {

    const forms = document.querySelectorAll("form[role='search']");

    forms.forEach(form => {

        const input = form.querySelector("input");

        const results = form.parentElement.querySelector("[data-search-results]");

        input.addEventListener("input", () => {

            debounce(() => {

                searchProducts(input.value, results);

            });

        });

        form.addEventListener("submit", e => {

            e.preventDefault();

            const keyword = input.value.trim();

            if (!keyword) return;

            window.location.href =
                `shop.html?keyword=${encodeURIComponent(keyword)}`;

        });

        document.addEventListener("click", e => {

            if (!form.contains(e.target)) {

                results.hidden = true;
                results.scrollTop = 0;

            }

        });

    });

}


/* =========================================================
   CUSTOMER ONLINE HEARTBEAT
   ========================================================= */

let heartbeatTimer = null;

async function sendHeartbeat() {
    try {
        const { response, data } = await fetchAPI("/auth/heartbeat", {
            method: "POST"
        });

        if (!response.ok || !data.success) {
            console.log("Heartbeat failed");
            return;
        }

        console.log("Customer heartbeat sent");

    } catch (error) {
        console.error("Heartbeat error:", error);
    }
}

function startHeartbeat() {

    // Send immediately
    sendHeartbeat();

    // Then send every 30 seconds
    heartbeatTimer = setInterval(() => {
        sendHeartbeat();
    }, 30000);
}