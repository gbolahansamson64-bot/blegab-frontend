/* =========================================================
   CHECKOUT MODAL JS
   Opens from the cart page's "Proceed to Checkout" button.
   Step 1: shipping info + payment method choice.
   Step 2: shows the panel matching whichever method was
   selected in step 1 (card fields / GPay / Stripe / Apple Pay / AfterPay).
   ========================================================= */

document.addEventListener('DOMContentLoaded', function () {
  initCheckoutModal();
});

function initCheckoutModal() {
  var overlay = document.querySelector('[data-checkout-modal-overlay]');
  var modal = document.querySelector('[data-checkout-modal]');
  var checkoutBtn = document.querySelector('[data-checkout]');
  if (!overlay || !modal || !checkoutBtn) return;

  var selectedMethod = 'card';
  var currentStep = 1;

  var continueBtn = modal.querySelector('[data-checkout-continue]');
  var backBtn = modal.querySelector('[data-checkout-back]');
  var closeBtns = modal.querySelectorAll('[data-checkout-modal-close]');
  var stepIndicators = modal.querySelectorAll('[data-checkout-step-indicator]');
  var stepPanels = modal.querySelectorAll('[data-checkout-step-panel]');
  var paymentPanels = modal.querySelectorAll('[data-payment-panel]');
  var methodOptions = modal.querySelectorAll('.checkout-payment-option');

  checkoutBtn.addEventListener('click', function () {
    if (window.BLEGAB_CART && window.BLEGAB_CART.getCount() === 0) return;
    renderOrderSummary();
    goToStep(1);
    openModal();
  });

  closeBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var isMobileOrTablet = window.matchMedia('(max-width: 1024px)').matches;
      if (isMobileOrTablet && currentStep === 2) {
        goToStep(1);
      } else {
        closeModal();
      }
    });
  });
  overlay.addEventListener('click', closeModal);

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && modal.classList.contains('is-open')) closeModal();
  });

  // Payment method selection (step 1)
  methodOptions.forEach(function (option) {
    option.addEventListener('click', function () {
      methodOptions.forEach(function (o) { o.classList.remove('is-active'); });
      option.classList.add('is-active');
      var radio = option.querySelector('input[type="radio"]');
      if (radio) radio.checked = true;
      selectedMethod = option.dataset.paymentMethod;
    });
  });

  continueBtn.addEventListener('click', function () {
    if (currentStep === 1) {
      if (!validateShippingFields()) return;
      goToStep(2);
    } else {
      // No real payment backend yet — placeholder confirmation.
      alert('Order placed! (demo — connect a real payment processor here)');
      closeModal();
      window.location.href = 'index.html';
    }
  });

  backBtn.addEventListener('click', function () {
    goToStep(1);
  });

  ['checkout-first-name', 'checkout-last-name', 'checkout-email', 'checkout-phone', 'checkout-country', 'checkout-address', 'checkout-city', 'checkout-state', 'checkout-zip'].forEach(function (id) {
    var input = modal.querySelector('#' + id);
    if (!input) return;
    var eventName = input.tagName === 'SELECT' ? 'change' : 'input';
    input.addEventListener(eventName, function () {
      var wrapper = input.closest('.checkout-field');
      var errorEl = wrapper ? wrapper.querySelector('.checkout-field-error') : null;
      if (input.value.trim() !== '') {
        if (wrapper) wrapper.classList.remove('checkout-field--invalid');
        if (errorEl) errorEl.classList.remove('is-visible');
      }
    });
  });

  function validateShippingFields() {
    var fields = [
      { input: modal.querySelector('#checkout-first-name'), key: 'first-name', message: 'First name is required.' },
      { input: modal.querySelector('#checkout-last-name'), key: 'last-name', message: 'Last name is required.' },
      { input: modal.querySelector('#checkout-email'), key: 'email', message: 'Email address is required.' },
      { input: modal.querySelector('#checkout-country'), key: 'country', message: 'Country / region is required.' },
      { input: modal.querySelector('#checkout-address'), key: 'address', message: 'Street address is required.' },
      { input: modal.querySelector('#checkout-city'), key: 'city', message: 'City is required.' },
      { input: modal.querySelector('#checkout-state'), key: 'state', message: 'State is required.' },
      { input: modal.querySelector('#checkout-zip'), key: 'zip', message: 'ZIP code is required.' }
    ];

    var allFilled = true;
    var firstInvalidInput = null;

    fields.forEach(function (field) {
      var errorEl = modal.querySelector('[data-field-error="' + field.key + '"]');
      var wrapper = field.input ? field.input.closest('.checkout-field') : null;
      var isEmpty = !field.input || field.input.value.trim() === '';

      if (isEmpty) {
        allFilled = false;
        if (!firstInvalidInput) firstInvalidInput = field.input;
        if (errorEl) {
          errorEl.textContent = field.message;
          errorEl.classList.add('is-visible');
        }
        if (wrapper) wrapper.classList.add('checkout-field--invalid');
      } else {
        if (errorEl) errorEl.classList.remove('is-visible');
        if (wrapper) wrapper.classList.remove('checkout-field--invalid');
      }
    });

    if (!allFilled && firstInvalidInput) {
      firstInvalidInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
      firstInvalidInput.focus({ preventScroll: true });
    }

    return allFilled;
  }

  function goToStep(step) {
    currentStep = step;

    modal.classList.toggle('checkout-modal--step-2', step === 2);

    stepPanels.forEach(function (panel) {
      panel.hidden = panel.dataset.checkoutStepPanel !== String(step);
    });

    stepIndicators.forEach(function (indicator) {
      var num = indicator.dataset.checkoutStepIndicator;
      indicator.classList.toggle('is-active', num === String(step));
      indicator.classList.toggle('is-done', Number(num) < step);
    });

    if (step === 1) {
      backBtn.hidden = true;
      continueBtn.querySelector('.btn-text') ? (continueBtn.querySelector('.btn-text').textContent = 'Continue to Payment') : (continueBtn.textContent = 'Continue to Payment');
    } else {
      backBtn.hidden = false;
      paymentPanels.forEach(function (panel) {
        panel.hidden = panel.dataset.paymentPanel !== selectedMethod;
      });
      updateAfterpayBreakdown();
      var label = selectedMethod === 'card' ? 'Complete Order' : 'Confirm & Pay';
      continueBtn.querySelector('.btn-text') ? (continueBtn.querySelector('.btn-text').textContent = label) : (continueBtn.textContent = label);
    }

    var modalBody = modal.querySelector('.checkout-modal__body');
    if (modalBody) {
      modalBody.scrollTop = 0;
      modalBody.scrollLeft = 0;
    }
  }

  function openModal() {
    modal.classList.add('is-open');
    overlay.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    var modalBody = modal.querySelector('.checkout-modal__body');
    if (modalBody) modalBody.scrollLeft = 0;
  }

  function closeModal() {
    modal.classList.remove('is-open');
    overlay.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  function formatMoney(amount) {
    var fixed = Number(amount).toFixed(2);
    var parts = fixed.split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return '$' + parts.join('.');
  }

  function updateAfterpayBreakdown() {
    var el = modal.querySelector('[data-afterpay-breakdown]');
    if (!el || !window.BLEGAB_CART) return;
    var items = window.BLEGAB_CART.getItems();
    var products = window.BLEGAB_SHOP_PRODUCTS || [];
    var total = items.reduce(function (sum, item) {
      var product = products.find(function (p) { return p.id === item.id; });
      return product ? sum + product.price * item.qty : sum;
    }, 0);
    var installment = total / 4;
    el.innerHTML = [1, 2, 3, 4].map(function (n) {
      return '<div><span class="label">Payment ' + n + '</span><span class="amount">' + formatMoney(installment) + '</span></div>';
    }).join('');
  }

  function renderOrderSummary() {
    var itemsEl = modal.querySelector('[data-checkout-summary-items]');
    var subtotalEl = modal.querySelector('[data-checkout-summary-subtotal]');
    var totalEl = modal.querySelector('[data-checkout-summary-total]');
    var countEl = modal.querySelector('[data-checkout-summary-count]');
    var ctaTotalEl = modal.querySelector('[data-checkout-cta-total]');
    if (!itemsEl || !window.BLEGAB_CART) return;

    var items = window.BLEGAB_CART.getItems();
    var products = window.BLEGAB_SHOP_PRODUCTS || [];
    var subtotal = 0;

    itemsEl.innerHTML = items.map(function (item) {
      var product = products.find(function (p) { return p.id === item.id; });
      if (!product) return '';
      var lineTotal = product.price * item.qty;
      subtotal += lineTotal;
      return '' +
        '<div class="checkout-summary__item">' +
          '<img src="' + product.image + '" alt="' + product.name + '" />' +
          '<div class="checkout-summary__item-info">' +
            '<span class="name">' + product.name + '</span>' +
            '<span class="meta">&times;' + item.qty + '</span>' +
          '</div>' +
          '<span class="checkout-summary__item-price">' + formatMoney(lineTotal) + '</span>' +
        '</div>';
    }).join('');

    if (subtotalEl) subtotalEl.textContent = formatMoney(subtotal);
    if (totalEl) totalEl.textContent = formatMoney(subtotal);
    if (countEl) countEl.textContent = window.BLEGAB_CART.getCount();
    if (ctaTotalEl) ctaTotalEl.textContent = formatMoney(subtotal);
  }
}