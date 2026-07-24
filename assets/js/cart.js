/* =========================================================
   CART PAGE JS
   Renders the cart table/cards + order summary from
   window.BLEGAB_CART (main.js) + window.BLEGAB_SHOP_PRODUCTS
   (Product-data.js). Also drives the shared product detail
   modal (same markup/behavior as shop.html) and the
   newsletter form.
   ========================================================= */

document.addEventListener('DOMContentLoaded', function () {
  renderCartPage();
  initCartPageQtyAndDelete();
  initProductModal();
  initNewsletterForm();

  // So main.js's BLEGAB_CART.saveItems() can re-render this page
  // automatically after ANY cart change — from the row buttons here,
  // from the header cart drawer, or from the product modal's
  // "Add to Cart" button.
  window.BLEGAB_RENDER_CART_PAGE = renderCartPage;
});

/* -----------------------------
   Money formatting — "$1,600.00"
   ----------------------------- */
function formatMoney(amount) {
  var fixed = Number(amount).toFixed(2);
  var parts = fixed.split('.');
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return '$' + parts.join('.');
}

function formatQtyDisplay(num) {
  if (num >= 1e9) return (num / 1e9).toFixed(1).replace(/\.0$/, '') + 'B';
  if (num >= 1e6) return (num / 1e6).toFixed(1).replace(/\.0$/, '') + 'M';
  if (num >= 1e3) return (num / 1e3).toFixed(1).replace(/\.0$/, '') + 'K';
  return num.toString();
}

/* -----------------------------
   Main render — rebuilds the row list + summary numbers
   ----------------------------- */
function renderCartPage() {
  var listEl = document.querySelector('[data-cart-page-list]');
  var emptyEl = document.querySelector('[data-cart-page-empty]');
  var tableHead = document.querySelector('.cart-page__table-head');
  var summaryEl = document.querySelector('.cart-page__summary');
  var headingCountEl = document.querySelector('[data-cart-count-heading]');
  if (!listEl || !window.BLEGAB_CART) return;

  var items = window.BLEGAB_CART.getItems();
  var products = window.BLEGAB_SHOP_PRODUCTS || [];
  var itemCount = window.BLEGAB_CART.getCount();

  if (headingCountEl) headingCountEl.textContent = itemCount;

  if (items.length === 0) {
    listEl.innerHTML = '';
    if (emptyEl) emptyEl.hidden = false;
    if (tableHead) tableHead.style.display = 'none';
    if (summaryEl) summaryEl.hidden = true;
    return;
  }

  if (emptyEl) emptyEl.hidden = true;
  if (summaryEl) summaryEl.hidden = false;
  if (tableHead) tableHead.style.display = '';

  var subtotal = 0;

  listEl.innerHTML = items.map(function (item) {
var product = products.find(function (p) { return p.id === item.id; });
if (!product) {
  console.warn('Cart item has no matching product:', item.id);
  return '';
}

    var lineTotal = product.price * item.qty;
    subtotal += lineTotal;

return '' +
  '<div class="cart-page__row" data-cart-page-row="' + item.id + '">' +
    '<div class="cart-page__row-product">' +
      '<a href="#" class="cart-page__row-image-link" data-open-product="' + item.id + '">' +
        '<img src="' + product.image + '" alt="' + product.name + '" class="cart-page__row-image" />' +
      '</a>' +
      '<div class="cart-page__row-info">' +
        '<a href="#" class="cart-page__row-name" data-open-product="' + item.id + '">' + product.name + '</a>' +
        '<p class="cart-page__row-meta">Premium Human Hair</p>' +
        '<span class="cart-page__row-mobile-price">' + formatMoney(product.price) + '</span>' +
      '</div>' +
    '</div>' +

    '<div class="cart-page__row-price">' + formatMoney(product.price) + '</div>' +

    '<div class="cart-page__row-actions">' +
'<div class="cart-page__qty-stepper">' +
  '<button type="button" class="cart-page__qty-btn" data-cart-page-decrease="' + item.id + '" aria-label="Decrease quantity">&minus;</button>' +
  '<input type="number" class="cart-page__qty-value" value="' + item.qty + '" min="1" data-cart-page-qty-input="' + item.id + '" />' +
  '<button type="button" class="cart-page__qty-btn" data-cart-page-increase="' + item.id + '" aria-label="Increase quantity">+</button>' +
  '<button type="button" class="cart-page__reset-btn" data-cart-page-reset="' + item.id + '" aria-label="Reset quantity">' +
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">' +
      '<path d="M21 12a9 9 0 1 1-3.4-7.02" stroke-linecap="round"/>' +
      '<path d="M21 3v5h-5" stroke-linecap="round" stroke-linejoin="round"/>' +
    '</svg>' +
  '</button>' +
'</div>' +
      '<button type="button" class="cart-page__row-delete" data-cart-page-remove="' + item.id + '" aria-label="Remove item">' +
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">' +
          '<path d="M4 7h16M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2m2 0-1 13a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 7" stroke-linecap="round" stroke-linejoin="round"/>' +
        '</svg>' +
      '</button>' +
      '<span class="cart-page__row-total">' + formatMoney(lineTotal) + '</span>' +
    '</div>' +
  '</div>';
  }).join('');

  // Summary numbers
  var subtotalEl = document.querySelector('[data-summary-subtotal]');
  var totalEl = document.querySelector('[data-summary-total]');
  var countEl = document.querySelector('[data-summary-count]');
  var afterpayEl = document.querySelector('[data-summary-afterpay]');

  if (subtotalEl) subtotalEl.textContent = formatMoney(subtotal);
  if (totalEl) totalEl.textContent = formatMoney(subtotal); // shipping is free, so total = subtotal
  if (countEl) countEl.textContent = itemCount;
  if (afterpayEl) afterpayEl.textContent = formatMoney(subtotal / 4);
}

/* -----------------------------
   Qty +/- and delete — delegated, since rows are re-rendered
   ----------------------------- */
function initCartPageQtyAndDelete() {
  document.addEventListener('click', function (event) {
    var decreaseBtn = event.target.closest('[data-cart-page-decrease]');
    var increaseBtn = event.target.closest('[data-cart-page-increase]');
    var removeBtn = event.target.closest('[data-cart-page-remove]');
    var resetBtn = event.target.closest('[data-cart-page-reset]');
if (resetBtn) {
  window.BLEGAB_CART.setQty(resetBtn.dataset.cartPageReset, 1);
  return;
}
    if (!decreaseBtn && !increaseBtn && !removeBtn) return;
    if (!window.BLEGAB_CART) return;

if (decreaseBtn) {
  var idDec = decreaseBtn.dataset.cartPageDecrease;
  var itemDec = window.BLEGAB_CART.getItems().find(function (i) { return i.id === idDec; });
  if (itemDec && itemDec.qty > 1) window.BLEGAB_CART.setQty(idDec, itemDec.qty - 1);
}

    if (increaseBtn) {
      var idInc = increaseBtn.dataset.cartPageIncrease;
      var itemInc = window.BLEGAB_CART.getItems().find(function (i) { return i.id === idInc; });
      if (itemInc) window.BLEGAB_CART.setQty(idInc, itemInc.qty + 1);
    }

    if (removeBtn) {
      window.BLEGAB_CART.removeItem(removeBtn.dataset.cartPageRemove);
    }
    // No manual re-render call needed here — BLEGAB_CART.saveItems()
    // already calls window.BLEGAB_RENDER_CART_PAGE() for us.
  });

  document.addEventListener('change', function (event) {
    var qtyInput = event.target.closest('[data-cart-page-qty-input]');
    if (!qtyInput) return;
    var id = qtyInput.dataset.cartPageQtyInput;
    var newQty = parseInt(qtyInput.value, 10);
    if (isNaN(newQty) || newQty < 1) {
      newQty = 1;
    }
    qtyInput.value = formatQtyDisplay(newQty);
    window.BLEGAB_CART.setQty(id, newQty);
  });
}

/* -----------------------------
   Product detail modal — same behavior as shop.html's version,
   opened by clicking a cart row's product name
   ----------------------------- */
function initProductModal() {
  var overlay = document.querySelector('[data-product-modal-overlay]');
  var modal = document.querySelector('[data-product-modal]');
  if (!overlay || !modal || !window.BLEGAB_SHOP_PRODUCTS) return;

  var qty = 1;

  document.addEventListener('click', function (e) {
    var trigger = e.target.closest('[data-open-product]');
    if (trigger) {
      e.preventDefault();
      var product = window.BLEGAB_SHOP_PRODUCTS.find(function (p) { return p.id === trigger.dataset.openProduct; });
      if (product) openModal(product);
    }
    if (e.target.closest('[data-product-modal-close]') || e.target === overlay) {
      closeModal();
    }
  });

  function openModal(product) {
    modal.querySelector('[data-modal-name]').textContent = product.name;
    modal.querySelector('[data-modal-price]').textContent = formatMoney(product.price);
    modal.querySelector('[data-modal-main-image]').src = product.image;
    modal.querySelector('[data-modal-main-image]').alt = product.name;

    var badge = modal.querySelector('[data-modal-badge]');
    if (badge) {
      badge.hidden = !product.badge;
      if (product.badge) badge.textContent = product.badge;
    }

    modal.dataset.activeProduct = product.id;
    qty = 1;
    modal.querySelector('[data-qty-value]').textContent = qty;
    modal.classList.add('is-open');
    overlay.classList.add('is-open');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    modal.classList.remove('is-open');
    overlay.classList.remove('is-open');
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
    addToCartBtn.addEventListener('click', function () {
      window.BLEGAB_CART.addItem(modal.dataset.activeProduct, qty);
      closeModal();
    });
  }

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && modal.classList.contains('is-open')) {
      closeModal();
    }
  });
}

/* -----------------------------
   Newsletter form — same behavior as shop.html's version
   ----------------------------- */
function initNewsletterForm() {
  var form = document.querySelector('[data-newsletter-form]');
  if (!form) return;

  var input = form.querySelector('.newsletter__input');
  var errorEl = form.querySelector('[data-newsletter-error]');

  form.addEventListener('submit', function (event) {
    event.preventDefault();

    input.classList.remove('is-error');
    errorEl.classList.remove('is-visible');
    errorEl.textContent = '';

    var email = input.value.trim();

    if (!email) {
      showError('Please enter your email address');
      return;
    }

    if (!isValidEmail(email)) {
      showError('Please enter a valid email address');
      return;
    }

    alert('Thanks for subscribing!');
    form.reset();
  });

  input.addEventListener('input', function () {
    if (input.classList.contains('is-error')) {
      input.classList.remove('is-error');
      errorEl.classList.remove('is-visible');
      errorEl.textContent = '';
    }
  });

  function showError(message) {
    input.classList.add('is-error');
    errorEl.textContent = message;
    errorEl.offsetHeight;
    errorEl.classList.add('is-visible');
    input.focus();
  }

  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }
}
