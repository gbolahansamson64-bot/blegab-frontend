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
          Free Shipping On All Orders Over $200
        </span>
        <span class="announcement-bar__dot"></span>

        <span class="announcement-bar__item">Free Shipping On All Orders Over $200</span>
        <span class="announcement-bar__dot"></span>

        <span class="announcement-bar__item">Free Shipping On All Orders Over $200</span>
        <span class="announcement-bar__dot"></span>

        <span class="announcement-bar__item">Free Shipping On All Orders Over $200</span>
        <span class="announcement-bar__dot"></span>

        <span class="announcement-bar__item">Free Shipping On All Orders Over $200</span>
        <span class="announcement-bar__dot"></span>
      </div>

      <!-- Group 2 (exact duplicate, hidden from screen readers, makes the loop seamless) -->
      <div class="announcement-bar__group" aria-hidden="true">
        <span class="announcement-bar__item">Free Shipping On All Orders Over $200</span>
        <span class="announcement-bar__dot"></span>

        <span class="announcement-bar__item">Free Shipping On All Orders Over $200</span>
        <span class="announcement-bar__dot"></span>

        <span class="announcement-bar__item">Free Shipping On All Orders Over $200</span>
        <span class="announcement-bar__dot"></span>

        <span class="announcement-bar__item">Free Shipping On All Orders Over $200</span>
        <span class="announcement-bar__dot"></span>

        <span class="announcement-bar__item">Free Shipping On All Orders Over $200</span>
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

        <!-- Logo -->
          <a href="index.html" class="site-logo" aria-label="Blegab Luxury Wigs — Home">
            <img src="assets/images/logo.png" alt="Blegab Luxury Wigs" class="site-logo__image" />
          </a>

        <!-- Search (tablet/desktop) -->
          <div class="header-search">
            <form class="header-search__field" id="desktop-search-form" role="search" action="/search" method="get">
              <input type="search" name="q" id="desktop-search-input" class="header-search__input" placeholder="Search for wigs, collections..." aria-label="Search for wigs, collections" autocomplete="off" />
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
      <input type="search" name="q" id="mobile-search-input" class="search-expand__input" placeholder="Search for wigs, collections..." aria-label="Search for wigs, collections" autocomplete="off" />
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
      <a href="login.html" class="account-dropdown__item" data-account-guest>
        <svg class="account-dropdown__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
          <circle cx="12" cy="8" r="4"/>
          <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke-linecap="round"/>
        </svg>
        Sign In
      </a>
      <a href="signup.html" class="account-dropdown__item" data-account-guest>
        <svg class="account-dropdown__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
          <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M10 17l5-5-5-5" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M15 12H3" stroke-linecap="round"/>
        </svg>
        Sign Up
      </a>

      <p class="account-dropdown__greeting" data-account-user data-account-signed-in hidden></p>

      <button type="button" class="account-dropdown__item account-dropdown__item--logout" data-account-signout data-account-signed-in hidden>
        <svg class="account-dropdown__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M16 17l5-5-5-5" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M21 12H9" stroke-linecap="round"/>
        </svg>
        Sign Out
      </button>

      <a href="profile.html" class="account-dropdown__item account-dropdown__item--profile" data-account-signed-in hidden>
        <span class="profile-btn__icon-circle">
          <svg class="account-dropdown__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
            <circle cx="12" cy="8" r="4"/>
            <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke-linecap="round"/>
          </svg>
        </span>
        Profile
      </a>
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

      <div class="cart-drawer__body">
        <p class="cart-drawer__empty">Your cart is empty</p>
      </div>

      <div class="cart-drawer__footer">
        <a href="cart.html" class="btn btn-primary cart-drawer__cta">View Cart</a>
      </div>
    </aside>

    <!-- Primary navigation -->
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

        <li class="nav-item has-dropdown">
          <a href="shop.html" class="nav-link">
            Shop
            <svg class="nav-link__caret" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
              <path d="M6 9l6 6 6-6" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </a>
          <ul class="nav-dropdown">
            <li><a href="shop.html" class="nav-dropdown__link">All Wigs</a></li>
            <li><a href="shop.html?filter=new-arrivals" class="nav-dropdown__link">New Arrivals</a></li>
            <li><a href="shop.html?filter=best-sellers" class="nav-dropdown__link">Best Sellers</a></li>
          </ul>
        </li>

        <li class="nav-item has-dropdown">
          <a href="shop.html" class="nav-link">
            Collections
            <svg class="nav-link__caret" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
              <path d="M6 9l6 6 6-6" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </a>
          <ul class="nav-dropdown">
            <li><a href="shop.html" class="nav-dropdown__link">Body Wave Wigs</a></li>
            <li><a href="shop.html" class="nav-dropdown__link">Deep Wave Wigs</a></li>
            <li><a href="shop.html" class="nav-dropdown__link">Highlight Wigs</a></li>
            <li><a href="shop.html" class="nav-dropdown__link">Bob Wigs</a></li>
          </ul>
        </li>

        <li class="nav-item has-dropdown">
          <a href="shop.html" class="nav-link">
            Lace Wigs
            <svg class="nav-link__caret" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
              <path d="M6 9l6 6 6-6" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </a>
          <ul class="nav-dropdown">
            <li><a href="shop.html" class="nav-dropdown__link">Lace Front</a></li>
            <li><a href="shop.html" class="nav-dropdown__link">Full Lace</a></li>
            <li><a href="shop.html" class="nav-dropdown__link">HD Lace</a></li>
          </ul>
        </li>

        <li class="nav-item">
          <a href="shop.html" class="nav-link">Custom Wigs</a>
        </li>

        <li class="nav-item">
          <a href="shop.html" class="nav-link">Bone Straight</a>
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
            <a href="login.html" class="nav-dropdown__link nav-dropdown__link--signup">
              <svg class="nav-dropdown__link-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                <circle cx="12" cy="8" r="4"/>
                <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke-linecap="round"/>
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
              <button type="button" class="nav-dropdown__link nav-dropdown__link--logout" data-account-signout>
                <svg class="nav-dropdown__link-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M16 17l5-5-5-5" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M21 12H9" stroke-linecap="round"/>
                </svg>
                Sign Out
              </button>
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
          </ul>
        </li>
      </ul>
    </nav>

  </header>`;

  setActiveNavItem();
})();

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