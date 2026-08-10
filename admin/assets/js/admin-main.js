/* =========================================================
   BLEGAB LUXURY WIGS — MAIN JS (general/shared, loads on every page)
   Header interactions: nav, search, account menu, cart.
   Runs directly on page load — the header lives right in the
   page's HTML, no fetching or injecting.
   ========================================================= */
   

document.addEventListener('DOMContentLoaded', function () {
  initMobileNav();
  initNavDropdowns();
  initDesktopDropdowns();
  initAnnouncementBar();
  initMobileSearch();
  initSearch();
  initAccountMenu();
  initCartDrawer();
  initHeaderScroll();
  initHeaderProductModal();
});

const API_URL = "http://localhost:5000/api";



/* -----------------------------
   Account auth state (mock, frontend-only for now).
   Once real sign-in (Google etc.) is wired up, call:
     BLEGAB_AUTH.signIn({ name: 'Jane Doe' })   // on successful login
     BLEGAB_AUTH.signOut()                      // on logout
   and the header will update itself everywhere automatically.
   ----------------------------- */
const BLEGAB_AUTH = {

    user: null,

    async getUser() {

        try {

            const response = await  fetch(`${API_URL}/auth/me`,
                {
                    method: "GET",
                    credentials: "include"
                }
            );

            if (!response.ok) {

                this.user = null;

                return null;

            }

            const data = await response.json();

            this.user = data.user;

            return data.user;

        } catch (error) {

            console.error(error);

            this.user = null;

            return null;

        }

    },

    async logout() {

    try {

        await fetch(`${API_URL}/auth/logout`, {

            method: "POST",

            credentials: "include"

        });

        await window.BLEGAB_CART.renderBadge();

        await window.BLEGAB_CART.renderDrawer();

        await window.BLEGAB_WISHLIST.renderBadge();

    } catch (error) {

        console.error(error);

    }

    window.location.href = "login.html";

}

};



window.BLEGAB_CART = {

    async getItems() {

        try {

            const response = await fetch(`${API_URL}/cart`, {
                credentials: "include"
            });

            if (!response.ok) return [];

            const data = await response.json();

            return data.cart.items || [];

        } catch (error) {

            console.error(error);

            return [];

        }

    },

    async addItem(productId, quantity = 1) {

        try {

            const response = await fetch(`${API_URL}/cart/add`, {

                method: "POST",

                credentials: "include",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    productId,
                    quantity
                })

            });

            const data = await response.json();

            if (!response.ok) {

                alert(data.message);

                return;

            }

            await this.renderBadge();

            await this.renderDrawer();

            if (typeof window.BLEGAB_RENDER_CART_PAGE === "function") {

                window.BLEGAB_RENDER_CART_PAGE();

            }

        } catch (error) {

            console.error(error);

        }

    },

    async setQty(productId, quantity) {

        try {

            const response = await fetch(`${API_URL}/cart/update/${productId}`, {

                method: "PUT",

                credentials: "include",

                headers: {

                    "Content-Type": "application/json"

                },

                body: JSON.stringify({
                    quantity
                })

            });

            const data = await response.json();

            if (!response.ok) {

                alert(data.message);

                return;

            }

            await this.renderBadge();

            await this.renderDrawer();

            if (typeof window.BLEGAB_RENDER_CART_PAGE === "function") {

                window.BLEGAB_RENDER_CART_PAGE();

            }

        } catch (error) {

            console.error(error);

        }

    },

    async removeItem(productId) {

        try {

            await fetch(`${API_URL}/cart/remove/${productId}`, {

                method: "DELETE",

                credentials: "include"

            });

            await this.renderBadge();

            await this.renderDrawer();

            if (typeof window.BLEGAB_RENDER_CART_PAGE === "function") {

                window.BLEGAB_RENDER_CART_PAGE();

            }

        } catch (error) {

            console.error(error);

        }

    },

    async clearCart() {

        try {

            await fetch(`${API_URL}/cart/clear`, {

                method: "DELETE",

                credentials: "include"

            });

            await this.renderBadge();

            await this.renderDrawer();

            if (typeof window.BLEGAB_RENDER_CART_PAGE === "function") {

                window.BLEGAB_RENDER_CART_PAGE();

            }

        } catch (error) {

            console.error(error);

        }

    },

    async renderBadge() {

        try {

            const response = await fetch(`${API_URL}/cart/count`, {

                credentials: "include"

            });

            if (!response.ok) return;

            const data = await response.json();

            document
                .querySelectorAll("[data-cart-count]")
                .forEach(element => {

                    element.textContent = data.count;

                });

        } catch (error) {

            console.error(error);

        }

    },

    async renderDrawer() {

    const body = document.querySelector(".cart-drawer__body");

    if (!body) return;

    try {

        const items = await this.getItems();

        if (!items.length) {

            body.innerHTML =
                `<p class="cart-drawer__empty">
                    Your cart is empty
                </p>`;

            return;

        }

        body.innerHTML = items.map(item => {

            const product = item.product;

            if (!product) return "";

            return `

<div class="cart-drawer__item">

<a href="#" class="cart-drawer__item-image-link"
data-open-product="${product._id}">

<img
src="${product.images[0]}"
alt="${product.name}"
class="cart-drawer__item-image">

</a>

<div class="cart-drawer__item-info">

<a href="#"
class="cart-drawer__item-name"
data-open-product="${product._id}">

${product.name}

</a>

<span class="cart-drawer__item-price">

$${Number(product.price).toFixed(2)}

</span>

<div class="cart-drawer__item-qty">

<button
class="cart-drawer__qty-btn"
data-cart-decrease="${product._id}">

−

</button>

<span class="cart-drawer__qty-value">

${item.quantity}

</span>

<button
class="cart-drawer__qty-btn"
data-cart-increase="${product._id}">

+

</button>

</div>

</div>

<div class="cart-drawer__item-actions">

<button
class="cart-drawer__item-delete"
data-cart-remove="${product._id}">

✕

</button>

</div>

</div>

`;

        }).join("");

    }

    catch (error) {

        console.error(error);

    }

}

};

window.BLEGAB_WISHLIST = {

    async getItems() {

        try {

            const response = await fetch(`${API_URL}/wishlist`, {

                credentials: "include"

            });

            if (!response.ok) return [];

            const data = await response.json();

            return data.wishlist.products || [];

        } catch (error) {

            console.error(error);

            return [];

        }

    },

    async toggle(productId) {

        try {

            const response = await fetch(`${API_URL}/wishlist/toggle`, {

                method: "POST",

                credentials: "include",

                headers: {

                    "Content-Type": "application/json"

                },

                body: JSON.stringify({

                    productId

                })

            });

            const data = await response.json();

            if (!response.ok) {

                alert(data.message);

                return false;

            }

            await this.renderBadge();

            return data.wishlisted;

        }

        catch (error) {

            console.error(error);

            return false;

        }

    },

    async has(productId) {

        try {

            const response = await fetch(
                `${API_URL}/wishlist/check/${productId}`,
                {
                    credentials: "include"
                }
            );

            if (!response.ok) return false;

            const data = await response.json();

            return data.wishlisted;

        }

        catch (error) {

            console.error(error);

            return false;

        }

    },

    async clear() {

        try {

            await fetch(`${API_URL}/wishlist/clear`, {

                method: "DELETE",

                credentials: "include"

            });

            await this.renderBadge();

        }

        catch (error) {

            console.error(error);

        }

    },

    async renderBadge() {

        try {

            const response = await fetch(`${API_URL}/wishlist/count`, {

                credentials: "include"

            });

            if (!response.ok) return;

            const data = await response.json();

            document
                .querySelectorAll("[data-wishlist-count]")
                .forEach(element => {

                    element.textContent = data.count;

                });

        }

        catch (error) {

            console.error(error);

        }

    }

};

// Delegated clicks for qty +/- and remove — works even though items are added to the DOM after page load
document.addEventListener("click", async function (event) {

    const decreaseBtn = event.target.closest("[data-cart-decrease]");
    const increaseBtn = event.target.closest("[data-cart-increase]");
    const removeBtn = event.target.closest("[data-cart-remove]");
    const resetBtn = event.target.closest("[data-cart-reset]");
    const viewBtn = event.target.closest("[data-cart-add]");

    if (decreaseBtn) {

        const id = decreaseBtn.dataset.cartDecrease;

        const items = await window.BLEGAB_CART.getItems();

        const item = items.find(i => i.product._id === id);

        if (item) {

            await window.BLEGAB_CART.setQty(id, item.quantity - 1);

        }

        return;

    }

    if (increaseBtn) {

        const id = increaseBtn.dataset.cartIncrease;

        const items = await window.BLEGAB_CART.getItems();

        const item = items.find(i => i.product._id === id);

        if (item) {

            await window.BLEGAB_CART.setQty(id, item.quantity + 1);

        }

        return;

    }

    if (resetBtn) {

        await window.BLEGAB_CART.setQty(
            resetBtn.dataset.cartReset,
            1
        );

        return;

    }

    if (removeBtn) {

        await window.BLEGAB_CART.removeItem(
            removeBtn.dataset.cartRemove
        );

        return;

    }

    if (viewBtn) {

        window.location.href = "cart.html";

    }

});

document.addEventListener("change", async function (event) {

    const qtyInput = event.target.closest("[data-cart-qty-input]");

    if (!qtyInput) return;

    const id = qtyInput.dataset.cartQtyInput;

    let newQty = parseInt(qtyInput.value);

    if (isNaN(newQty) || newQty < 1) {

        newQty = 1;

        qtyInput.value = 1;

    }

    await window.BLEGAB_CART.setQty(id, newQty);

});

// window.BLEGAB_CART.renderBadge();
// window.BLEGAB_CART.renderDrawer();



async function renderAccountState() {

    const user = await BLEGAB_AUTH.getUser();
    await window.BLEGAB_CART.renderBadge();
    await window.BLEGAB_CART.renderDrawer();
    await window.BLEGAB_WISHLIST.renderBadge();
    const header = document.querySelector(".site-header");

    if (header) {

        header.classList.toggle("is-signed-in", !!user);

    }

    document
        .querySelectorAll("[data-account-guest]")
        .forEach(function (element) {

            element.hidden = !!user;

        });

    document
        .querySelectorAll("[data-account-signed-in]")
        .forEach(function (element) {

            element.hidden = !user;

        });

    document
        .querySelectorAll("[data-account-user]")
        .forEach(function (element) {

            element.textContent = user
                ? "Hi, " + user.name
                : "";

        });

}

window.BLEGAB_CART.renderBadge();
window.BLEGAB_CART.renderDrawer();
window.BLEGAB_WISHLIST.renderBadge();

document.addEventListener("click", function (event) {

    if (event.target.closest("[data-account-signout]")) {

        BLEGAB_AUTH.logout();

    }

});

document.addEventListener('DOMContentLoaded', renderAccountState);



function initMobileNav() {
  var menuToggle = document.querySelector('[data-menu-toggle]');
  var primaryNav = document.querySelector('[data-primary-nav]');
  var navOverlay = document.querySelector('[data-nav-overlay]');
  var navClose = document.querySelector('[data-nav-close]');

  if (!menuToggle || !primaryNav || !navOverlay) return;

  function openNav() {
    primaryNav.classList.add('is-open');
    navOverlay.classList.add('is-visible');
    menuToggle.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  }

  function closeNav() {
    primaryNav.classList.remove('is-open');
    navOverlay.classList.remove('is-visible');
    menuToggle.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
    // Reset any inline transform from dragging
    primaryNav.style.transform = '';
    primaryNav.classList.remove('is-dragging');
  }

  menuToggle.addEventListener('click', function () {
    var isOpen = primaryNav.classList.contains('is-open');
    isOpen ? closeNav() : openNav();
  });

  navOverlay.addEventListener('click', closeNav);
  if (navClose) navClose.addEventListener('click', closeNav);

  // ---- Swipe-to-close for nav (opens from RIGHT, swipe RIGHT to close) ----
  var touchStartX = 0;
  var touchStartY = 0;
  var touchCurrentX = 0;
  var isDragging = false;
  var gestureDirection = null;
  var directionLockThreshold = 10;
  var swipeThreshold = 80;

  primaryNav.addEventListener('touchstart', function (event) {
    touchStartX = event.touches[0].clientX;
    touchStartY = event.touches[0].clientY;
    touchCurrentX = touchStartX;
    isDragging = true;
    gestureDirection = null;
  }, { passive: true });

  primaryNav.addEventListener('touchmove', function (event) {
    if (!isDragging) return;

    touchCurrentX = event.touches[0].clientX;
    var touchCurrentY = event.touches[0].clientY;
    var deltaX = touchCurrentX - touchStartX;
    var deltaY = touchCurrentY - touchStartY;

    if (gestureDirection === null) {
      if (Math.abs(deltaX) > directionLockThreshold || Math.abs(deltaY) > directionLockThreshold) {
        gestureDirection = Math.abs(deltaX) > Math.abs(deltaY) ? 'horizontal' : 'vertical';
        if (gestureDirection === 'horizontal') {
          primaryNav.classList.add('is-dragging');
        }
      }
    }

    if (gestureDirection !== 'horizontal') return;

    // Only allow dragging RIGHT (toward closed position)
    if (deltaX > 0) {
      primaryNav.style.transform = 'translateX(' + deltaX + 'px)';
    }
  }, { passive: true });

  primaryNav.addEventListener('touchend', function () {
    if (!isDragging) return;
    isDragging = false;

    if (gestureDirection === 'horizontal') {
      primaryNav.classList.remove('is-dragging');
      primaryNav.style.transform = '';

      var deltaX = touchCurrentX - touchStartX;
      if (deltaX > swipeThreshold) {
        closeNav();
      }
    }

    gestureDirection = null;
  });

  // Close the drawer automatically if the viewport grows into desktop size
  window.addEventListener('resize', function () {
    if (window.innerWidth >= 1024) {
      closeNav();
      document.querySelectorAll('.nav-item.has-dropdown.is-open').forEach(function (item) {
        item.classList.remove('is-open');
      });
    }
  });
}

/* -----------------------------
   Nav dropdowns (SHOP / COLLECTIONS / LACE WIGS)
   - Accordion behaviour on mobile/tablet (click to expand)
   - Hover/focus behaviour on desktop is handled purely in CSS
   ----------------------------- */
function initNavDropdowns() {
  var dropdownItems = document.querySelectorAll('.nav-item.has-dropdown');

  dropdownItems.forEach(function (item) {
    var trigger = item.querySelector('.nav-link');

    trigger.addEventListener('click', function (event) {
      if (window.innerWidth >= 1024) return; // desktop uses hover, let the link behave normally

      event.preventDefault();
      var isOpen = item.classList.contains('is-open');

      dropdownItems.forEach(function (other) {
        other.classList.remove('is-open');
      });

      if (!isOpen) item.classList.add('is-open');
    });
  });
}

/* -----------------------------
   Announcement bar dismiss
   ----------------------------- */
function initAnnouncementBar() {
  var bar = document.querySelector('[data-announcement-bar]');
  var closeBtn = document.querySelector('[data-announcement-close]');

  if (!bar || !closeBtn) return;

  closeBtn.addEventListener('click', function () {
    bar.style.display = 'none';
    document.body.classList.add('announcement-dismissed');
  });
}

/* -----------------------------
   Mobile search
   ----------------------------- */
function initMobileSearch() {
  var wrapper = document.querySelector('[data-search-expand]');
  var toggle = document.querySelector('[data-search-toggle]');
  var form = document.getElementById('mobile-search-form');
  var input = document.getElementById('mobile-search-input');
  if (!wrapper || !toggle || !form) return;

  toggle.addEventListener('click', function () {
    var isOpen = wrapper.classList.contains('is-open');

    if (!isOpen) {
      wrapper.classList.add('is-open');
      toggle.setAttribute('aria-expanded', 'true');
      if (input) input.focus();
      return;
    }

    form.requestSubmit(); // hands off to the shared search logic below
  });

  document.addEventListener('click', function (event) {
    if (wrapper.classList.contains('is-open') && !wrapper.contains(event.target)) {
      wrapper.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
    }
  });
}

function initSearch() {
  setupSearchWidget(
    document.getElementById('desktop-search-input'),
    document.getElementById('desktop-search-form'),
    document.querySelectorAll('[data-search-results]')[0]
  );

  setupSearchWidget(
    document.getElementById('mobile-search-input'),
    document.getElementById('mobile-search-form'),
    document.querySelectorAll('[data-search-results]')[1]
  );
}

function setupSearchWidget(input, form, resultsBox) {
  if (!input || !form || !resultsBox) return;

  input.addEventListener('input', function () {
    renderSearchResults(input.value, resultsBox);
  });

  input.addEventListener('focus', function () {
    if (input.value.trim() !== '') renderSearchResults(input.value, resultsBox);
  });

  form.addEventListener('submit', function (event) {
    event.preventDefault();

    var query = input.value.trim();
    if (query === '') return; // nothing typed — do nothing, as requested

    // Always hand off to the shop page — it reads ?search= from the URL
    // and filters itself, so there's only ever one shop page to maintain.
    window.location.href = 'shop.html?search=' + encodeURIComponent(query);
  });

  document.addEventListener('click', function (event) {
    if (!form.contains(event.target) && !resultsBox.contains(event.target)) {
      resultsBox.hidden = true;
    }
  });
}

function findProductMatches(query) {

    const normalized = query.trim().toLowerCase();

    if (!normalized) return [];

    const products = window.BLEGAB_SHOP_PRODUCTS || [];

    return products.filter(product =>
        product.name.toLowerCase().includes(normalized)
    );

}

function renderSearchResults(query, resultsBox) {
  var trimmed = query.trim();

  if (trimmed === '') {
    resultsBox.hidden = true;
    resultsBox.innerHTML = '';
    return;
  }

  var matches = findProductMatches(trimmed);
  resultsBox.innerHTML = '';

  if (matches.length === 0) {
    var empty = document.createElement('p');
    empty.className = 'search-results__empty';
    empty.textContent = 'No match found for "' + trimmed + '"';
    resultsBox.appendChild(empty);
  } else {
    matches.forEach(function (product) {
      var link = document.createElement('a');
      link.href = "#";
      link.dataset.openProduct = product._id;
      link.className = 'search-results__item';
      link.textContent = product.name;
      resultsBox.appendChild(link);
    });
  }

  resultsBox.hidden = false;
}

function initDesktopDropdowns() {
  var dropdownItems = document.querySelectorAll('.nav-item.has-dropdown');
  var closeTimer;

  dropdownItems.forEach(function (item) {
    item.addEventListener('mouseenter', function () {
      if (window.innerWidth < 1024) return; // desktop/tablet-hover only
      clearTimeout(closeTimer);
      item.classList.add('is-open');
    });

    item.addEventListener('mouseleave', function () {
      if (window.innerWidth < 1024) return;
      closeTimer = setTimeout(function () {
        item.classList.remove('is-open');
      }, 300); // grace period to cross the gap into the dropdown
    });
  });
}


function initAccountMenu() {
  var wrapper = document.querySelector('[data-account-menu]');
  var toggle = document.querySelector('[data-account-toggle]');
  var dropdown = document.querySelector('[data-account-dropdown]');
  if (!wrapper || !toggle || !dropdown) return;

  toggle.addEventListener('click', function (event) {
    event.stopPropagation();
    var isOpen = dropdown.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded', isOpen);
  });

  document.addEventListener('click', function (event) {
    if (!wrapper.contains(event.target)) {
      dropdown.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
    }
  });

  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape') {
      dropdown.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
    }
  });
}

function initCartDrawer() {
  var toggle = document.querySelector('[data-cart-toggle]');
  var drawer = document.querySelector('[data-cart-drawer]');
  var overlay = document.querySelector('[data-cart-overlay]');
  var closeBtn = document.querySelector('[data-cart-close]');
  if (!toggle || !drawer || !overlay) return;

  function openDrawer() {
    drawer.classList.add('is-open');
    overlay.classList.add('is-visible');
    toggle.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  }

  function closeDrawer() {
    drawer.classList.remove('is-open');
    overlay.classList.remove('is-visible');
    toggle.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  toggle.addEventListener('click', function () {
    var isOpen = drawer.classList.contains('is-open');
    isOpen ? closeDrawer() : openDrawer();
  });

  overlay.addEventListener('click', closeDrawer);
  if (closeBtn) closeBtn.addEventListener('click', closeDrawer);

  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape') closeDrawer();
  });

  // ---- Swipe-to-close (touch devices only) ----
  var touchStartX = 0;
  var touchStartY = 0;
  var touchCurrentX = 0;
  var isDragging = false;
  var gestureDirection = null; // 'horizontal' | 'vertical' | null (undecided)
  var directionLockThreshold = 10; // px of movement before we decide the gesture's direction
  var swipeThreshold = 80; // px — how far right they need to drag before it counts as "close"

  drawer.addEventListener('touchstart', function (event) {
    touchStartX = event.touches[0].clientX;
    touchStartY = event.touches[0].clientY;
    touchCurrentX = touchStartX;
    isDragging = true;
    gestureDirection = null;
  }, { passive: true });

  drawer.addEventListener('touchmove', function (event) {
    if (!isDragging) return;

    touchCurrentX = event.touches[0].clientX;
    var touchCurrentY = event.touches[0].clientY;
    var deltaX = touchCurrentX - touchStartX;
    var deltaY = touchCurrentY - touchStartY;

    if (gestureDirection === null) {
      if (Math.abs(deltaX) > directionLockThreshold || Math.abs(deltaY) > directionLockThreshold) {
        gestureDirection = Math.abs(deltaX) > Math.abs(deltaY) ? 'horizontal' : 'vertical';
        if (gestureDirection === 'horizontal') {
          drawer.style.transition = 'none';
        }
      }
    }

    if (gestureDirection !== 'horizontal') return;

    if (deltaX > 0) {
      drawer.style.transform = 'translateX(' + deltaX + 'px)';
    }
  }, { passive: true });

  drawer.addEventListener('touchend', function () {
    if (!isDragging) return;
    isDragging = false;

    if (gestureDirection === 'horizontal') {
      drawer.style.transition = '';
      drawer.style.transform = '';

      var deltaX = touchCurrentX - touchStartX;
      if (deltaX > swipeThreshold) {
        closeDrawer();
      }
    }

    gestureDirection = null;
  });
}


/* -----------------------------
   Header background — transparent at top, solid on scroll
   ----------------------------- */
function initHeaderScroll() {
  var header = document.querySelector('.site-header');
  if (!header) return;

  window.addEventListener('scroll', function () {
    if (window.scrollY > 40) {
      header.classList.add('is-scrolled');
    } else {
      header.classList.remove('is-scrolled');
    }
  }, { passive: true });
}

function initHeaderProductModal() {
  var overlay = document.querySelector('[data-product-modal-overlay]');
  var modal = document.querySelector('[data-product-modal]');
  if (!overlay || !modal || !window.BLEGAB_SHOP_PRODUCTS) return;

  var qty = 1;

  document.addEventListener('click', function (e) {
    var trigger = e.target.closest('[data-open-product]');
    if (trigger) {
      e.preventDefault();
     var product = window.BLEGAB_SHOP_PRODUCTS.find(function (p) {
      return p._id === trigger.dataset.openProduct;
    });
      if (product) openModal(product);
    }
    if (e.target.closest('[data-product-modal-close]') || e.target === overlay) {
      closeModal();
    }
  });

  function openModal(product) {
    modal.querySelector('[data-modal-name]').textContent = product.name;
    modal.querySelector('[data-modal-price]').textContent = '$' + Number(product.price).toFixed(2);
    modal.querySelector('[data-modal-main-image]').src =
    product.images?.[0] || "assets/images/placeholder.png";
    modal.querySelector('[data-modal-main-image]').alt = product.name;

    var badge = modal.querySelector('[data-modal-badge]');
    if (badge) {
      badge.hidden = !product.badge;
      if (product.badge) badge.textContent = product.badge;
    }

    modal.dataset.activeProduct = product._id;
    qty = 1;
    modal.querySelector('[data-qty-value]').textContent = qty;
    modal.classList.add('is-open');
    overlay.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    modal.classList.remove('is-open');
    overlay.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  modal.querySelectorAll('[data-option-group]').forEach(function (group) {
    group.addEventListener('click', function (e) {
      var pill = e.target.closest('.option-pill');
      if (!pill) return;
      group.querySelectorAll('.option-pill').forEach(function (p) { p.classList.remove('is-active'); });
      pill.classList.add('is-active');
    });
  });

  var qtyIncrease = modal.querySelector('[data-qty-increase]');
  var qtyDecrease = modal.querySelector('[data-qty-decrease]');
  var qtyValue = modal.querySelector('[data-qty-value]');

  if (qtyIncrease) {
    qtyIncrease.addEventListener('click', function () {
      qty++;
      qtyValue.textContent = qty;
    });
  }

  if (qtyDecrease) {
    qtyDecrease.addEventListener('click', function () {
      qty = Math.max(1, qty - 1);
      qtyValue.textContent = qty;
    });
  }

  var addToCartBtn = modal.querySelector('[data-modal-add-to-cart]');
  if (addToCartBtn && window.BLEGAB_CART) {
    addToCartBtn.addEventListener('click', async function () {
     await window.BLEGAB_CART.addItem(
       modal.dataset.activeProduct,
       qty
     );

      closeModal();
    });
  }

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && modal.classList.contains('is-open')) {
      closeModal();
    }
  });
}

// document.addEventListener('change', function (event) {
//   var qtyInput = event.target.closest('[data-cart-qty-input]');
//   if (!qtyInput) return;
//   var id = qtyInput.dataset.cartQtyInput;
//   var newQty = parseInt(qtyInput.value, 10);
//   if (isNaN(newQty) || newQty < 1) {
//     newQty = 1;
//     qtyInput.value = 1;
//   }
//   window.BLEGAB_CART.setQty(id, newQty);
// });

function formatQtyDisplay(num) {
  if (num >= 1e9) return (num / 1e9).toFixed(1).replace(/\.0$/, '') + 'B';
  if (num >= 1e6) return (num / 1e6).toFixed(1).replace(/\.0$/, '') + 'M';
  if (num >= 1e3) return (num / 1e3).toFixed(1).replace(/\.0$/, '') + 'K';
  return num.toString();
}

/* =========================================================
   GLOBAL VIEWPORT WALL
   Watches the entire page for ANY element that opens (gains
   .is-open or .is-visible) and, if it would stick out past the
   left/right edge of the screen, shifts it back in. This is
   automatic and site-wide — no per-dropdown wiring needed, and
   any new dropdown/panel added later is protected for free as
   long as it follows the existing is-open / is-visible pattern.

   Deliberately skips: sidebars, full-screen overlays, and
   centered modals — those are already positioned correctly by
   design and clamping them would fight their own transforms.
   ========================================================= */
(function () {
  var MARGIN = 10;
  var SKIP_SELECTOR = [
    '.admin-sidebar',
    '.admin-sidebar-overlay',
    '.admin-notif-overlay',
    '.admin-notif-modal-overlay',
    '.admin-notif-modal',
    '.prd-modal-overlay',
    '.prd-modal',
    '.cart-drawer',
    '.cart-drawer-overlay',
    '.nav-overlay'
  ].join(', ');

  function isClampable(el) {
    if (el.matches(SKIP_SELECTOR)) return false;
    var pos = getComputedStyle(el).position;
    return pos === 'absolute' || pos === 'fixed';
  }

  function clamp(el) {
    el.style.transform = '';
    requestAnimationFrame(function () {
      var stillOpen = el.classList.contains('is-open') || el.classList.contains('is-visible');
      if (!stillOpen) return;

      var rect = el.getBoundingClientRect();
      var shift = 0;

      if (rect.right > window.innerWidth - MARGIN) {
        shift = (window.innerWidth - MARGIN) - rect.right;
      } else if (rect.left < MARGIN) {
        shift = MARGIN - rect.left;
      }

      if (shift !== 0) el.style.transform = 'translateX(' + shift + 'px)';
    });
  }

  function reset(el) {
    el.style.transform = '';
  }

  var observer = new MutationObserver(function (mutations) {
    mutations.forEach(function (m) {
      if (m.type !== 'attributes' || m.attributeName !== 'class') return;
      var el = m.target;
      if (!isClampable(el)) return;

      var isOpenNow = el.classList.contains('is-open') || el.classList.contains('is-visible');
      isOpenNow ? clamp(el) : reset(el);
    });
  });

  observer.observe(document.body, {
    attributes: true,
    attributeFilter: ['class'],
    subtree: true
  });

  // Re-check anything currently open if the screen rotates/resizes
  window.addEventListener('resize', function () {
    document.querySelectorAll('.is-open, .is-visible').forEach(function (el) {
      if (isClampable(el)) clamp(el);
    });
  });
})();