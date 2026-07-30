/* =========================================================
   SHOP PAGE JS — renders the product grid + pagination
   from window.BLEGAB_SHOP_PRODUCTS (see Product-data.js).
   ========================================================= */

// Global state
var currentPage = 1;
var productsPerPage = 9; // Default for desktop

document.addEventListener('DOMContentLoaded', function () {
  calculateProductsPerPage();
  renderProductGrid(currentPage);
  initNewsletterForm();
  initShopFilterPanel();
  initProductModal();
  initPaginationArrows();
  initCustomSelect();
  initClearFilters();
  
  // Recalculate on resize
  var resizeTimer;
  window.addEventListener('resize', function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () {
      var oldProductsPerPage = productsPerPage;
      calculateProductsPerPage();
      if (oldProductsPerPage !== productsPerPage || currentPage > getTotalPages()) {
        currentPage = 1;
        renderProductGrid(currentPage);
      }
    }, 250);
  });
});

function calculateProductsPerPage() {
  var width = window.innerWidth;
  if (width <= 767) {
    productsPerPage = 4; // Mobile
  } else if (width <= 1023) {
    productsPerPage = 6; // Tablet
  } else {
    productsPerPage = 9; // Desktop
  }
}

function getTotalPages() {
  if (!window.BLEGAB_SHOP_PRODUCTS) return 1;
  return Math.ceil(window.BLEGAB_SHOP_PRODUCTS.length / productsPerPage);
}

function getProductsForPage(page) {
  if (!window.BLEGAB_SHOP_PRODUCTS) return [];
  
  var start = (page - 1) * productsPerPage;
  var end = start + productsPerPage;
  return window.BLEGAB_SHOP_PRODUCTS.slice(start, end);
}

function renderProductGrid(page) {
  var grid = document.querySelector('[data-product-grid]');
  var countEl = document.querySelector('[data-results-count]');
  if (!grid || !window.BLEGAB_SHOP_PRODUCTS) return;

  var allProducts = window.BLEGAB_SHOP_PRODUCTS;
  var totalPages = getTotalPages();
  
  // Ensure page is valid
  if (page < 1) page = 1;
  if (page > totalPages) page = totalPages;
  currentPage = page;
  
  var pageProducts = getProductsForPage(currentPage);
  grid.innerHTML = '';

  pageProducts.forEach(function (item) {
    var card = document.createElement('li');
    card.className = 'product-card';
    
    // Build badge HTML if exists
    var badgeHTML = '';
    if (item.badge) {
      badgeHTML = '<span class="product-card__badge">' + item.badge + '</span>';
    }
    
    card.innerHTML = 
      '<a href="#" class="product-card__link" data-open-product="' + item.id + '">' +
        '<div class="product-card__image-wrap">' +
          '<img src="' + item.image + '" alt="' + item.name + '" class="product-card__image" loading="lazy">' +
          badgeHTML +
'<button class="product-card__wishlist' + (window.BLEGAB_WISHLIST && window.BLEGAB_WISHLIST.has(item.id) ? ' is-active' : '') + '" data-wishlist-toggle="' + item.id + '" aria-label="Add to wishlist">' +
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>' +
'</button>' +
        '</div>' +
        '<h3 class="product-card__name">' + item.name + '</h3>' +
        '<p class="product-card__meta">Premium Human Hair</p>' +
        '<span class="product-card__price">$' + Number(item.price).toFixed(2) + '</span>' +
      '</a>' +
      '<button class="btn btn-primary product-card__cta" data-quick-add="' + item.id + '">' +
        '<span class="btn-icon-wrap">' +
          '<svg class="btn-icon btn-icon--bag" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">' +
            '<path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/>' +
          '</svg>' +
          '<svg class="btn-icon btn-icon--arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">' +
            '<path d="M5 12h14M12 5l7 7-7 7"/>' +
          '</svg>' +
        '</span>' +
        '<span class="btn-text">Quick Add</span>' +
      '</button>';
    
    grid.appendChild(card);
  });

  // Add quick add functionality
  var quickAddButtons = grid.querySelectorAll('[data-quick-add]');
  quickAddButtons.forEach(function(btn) {
    btn.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      var productId = this.dataset.quickAdd;
      if (window.BLEGAB_CART && window.BLEGAB_CART.addItem) {
        window.BLEGAB_CART.addItem(productId, 1);
        // Dark background with checkmark when added
        var originalText = this.textContent;
        this.textContent = '✓ Added';
        this.style.backgroundColor = '#1a1a1a';
        this.style.borderColor = '#1a1a1a';
        this.style.color = '#D4AF37';
        setTimeout(function() {
          btn.textContent = originalText;
          btn.style.backgroundColor = '';
          btn.style.borderColor = '';
          btn.style.color = '';
        }, 1500);
      }
    });
  });

  // Wishlist toggle
var wishlistButtons = grid.querySelectorAll('[data-wishlist-toggle]');
wishlistButtons.forEach(function (btn) {
  btn.addEventListener('click', function (e) {
    e.preventDefault();
    e.stopPropagation();
    var productId = this.dataset.wishlistToggle;
    if (window.BLEGAB_WISHLIST) {
      var nowActive = window.BLEGAB_WISHLIST.toggle(productId);
      this.classList.toggle('is-active', nowActive);
    }
  });
});

  // Update results count
  if (countEl) {
    var start = (currentPage - 1) * productsPerPage + 1;
    var end = Math.min(currentPage * productsPerPage, allProducts.length);
    countEl.textContent = 'Showing ' + start + '–' + end + ' of ' + allProducts.length + ' results';
  }

  renderPagination(currentPage);
  updatePaginationArrows();
}

function renderPagination(activePage) {
  var wrap = document.querySelector('[data-page-numbers]');
  if (!wrap || !window.BLEGAB_SHOP_PRODUCTS) return;

  var totalPages = getTotalPages();
  
  // Don't show pagination if only one page
  if (totalPages <= 1) {
    wrap.innerHTML = '';
    return;
  }
  
  wrap.innerHTML = '';

  for (var i = 1; i <= totalPages; i++) {
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'pagination__page' + (i === activePage ? ' is-active' : '');
    btn.textContent = i;
    btn.setAttribute('aria-label', 'Page ' + i);
    btn.setAttribute('aria-current', i === activePage ? 'page' : 'false');
    
    btn.addEventListener('click', function() {
      var page = parseInt(this.textContent);
      if (page !== currentPage) {
        renderProductGrid(page);
        scrollGridIntoView();
      }
    });
    
    wrap.appendChild(btn);
  }
}

function updatePaginationArrows() {
  var prevBtn = document.querySelector('[data-page-prev]');
  var nextBtn = document.querySelector('[data-page-next]');
  var totalPages = getTotalPages();
  
  if (prevBtn) {
    prevBtn.disabled = currentPage <= 1;
    prevBtn.style.opacity = currentPage <= 1 ? '0.3' : '1';
    prevBtn.style.cursor = currentPage <= 1 ? 'not-allowed' : 'pointer';
  }
  
  if (nextBtn) {
    nextBtn.disabled = currentPage >= totalPages;
    nextBtn.style.opacity = currentPage >= totalPages ? '0.3' : '1';
    nextBtn.style.cursor = currentPage >= totalPages ? 'not-allowed' : 'pointer';
  }
}

function scrollGridIntoView() {
  var grid = document.querySelector('[data-product-grid]');
  if (grid) {
    var offset = grid.getBoundingClientRect().top + window.pageYOffset - 100;
    window.scrollTo({ top: offset, behavior: 'smooth' });
  }
}

function initPaginationArrows() {
  var prevBtn = document.querySelector('[data-page-prev]');
  var nextBtn = document.querySelector('[data-page-next]');

  if (prevBtn) {
    prevBtn.addEventListener('click', function () {
      if (currentPage > 1) {
        renderProductGrid(currentPage - 1);
        scrollGridIntoView();
      }
    });
  }
  
  if (nextBtn) {
    nextBtn.addEventListener('click', function () {
      var totalPages = getTotalPages();
      if (currentPage < totalPages) {
        renderProductGrid(currentPage + 1);
        scrollGridIntoView();
      }
    });
  }
}

function initNewsletterForm() {
  var form = document.querySelector('[data-newsletter-form]');
  if (!form) return;

  var input = form.querySelector('.newsletter__input');
  var errorEl = form.querySelector('[data-newsletter-error]');

  form.addEventListener('submit', function (event) {
    event.preventDefault();
    
    // Reset error state
    input.classList.remove('is-error');
    errorEl.classList.remove('is-visible');
    errorEl.textContent = '';

    var email = input.value.trim();

    // Validate
    if (!email) {
      showError('Please enter your email address');
      return;
    }

    if (!isValidEmail(email)) {
      showError('Please enter a valid email address');
      return;
    }

    // Success - replace with real API call later
    alert('Thanks for subscribing!');
    form.reset();
  });

  // Clear error on input
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
    // Trigger reflow for animation
    errorEl.offsetHeight;
    errorEl.classList.add('is-visible');
    input.focus();
  }

  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }
}

function initShopFilterPanel() {
  var trigger = document.querySelector('[data-filter-toggle]');
  var panel = document.querySelector('[data-filter-panel]');
  var overlay = document.querySelector('[data-filter-overlay]');
  var closeBtn = document.querySelector('[data-filter-close]');
  if (!trigger || !panel || !overlay) return;

  function openPanel() {
    panel.classList.add('is-open');
    overlay.classList.add('is-visible');
    trigger.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  }

  function closePanel() {
    panel.classList.remove('is-open');
    overlay.classList.remove('is-visible');
    trigger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  trigger.addEventListener('click', openPanel);
  overlay.addEventListener('click', closePanel);
  if (closeBtn) closeBtn.addEventListener('click', closePanel);

  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape') closePanel();
  });


  // ---- Swipe-to-close (touch devices only) — panel opens from the LEFT, so swipe LEFT to close
  var touchStartX = 0;
  var touchStartY = 0;
  var touchCurrentX = 0;
  var isDragging = false;
  var gestureDirection = null;
  var directionLockThreshold = 10;
  var swipeThreshold = 80;

  panel.addEventListener('touchstart', function (event) {
    touchStartX = event.touches[0].clientX;
    touchStartY = event.touches[0].clientY;
    touchCurrentX = touchStartX;
    isDragging = true;
    gestureDirection = null;
  }, { passive: true });

  panel.addEventListener('touchmove', function (event) {
    if (!isDragging) return;

    touchCurrentX = event.touches[0].clientX;
    var touchCurrentY = event.touches[0].clientY;
    var deltaX = touchCurrentX - touchStartX;
    var deltaY = touchCurrentY - touchStartY;

    if (gestureDirection === null) {
      if (Math.abs(deltaX) > directionLockThreshold || Math.abs(deltaY) > directionLockThreshold) {
        gestureDirection = Math.abs(deltaX) > Math.abs(deltaY) ? 'horizontal' : 'vertical';
        if (gestureDirection === 'horizontal') {
          panel.style.transition = 'none';
        }
      }
    }

    if (gestureDirection !== 'horizontal') return;

    if (deltaX < 0) { // only allow dragging LEFT (toward closed)
      panel.style.transform = 'translateX(' + deltaX + 'px)';
    }
  }, { passive: true });

  panel.addEventListener('touchend', function () {
    if (!isDragging) return;
    isDragging = false;

    if (gestureDirection === 'horizontal') {
      panel.style.transition = '';
      panel.style.transform = '';

      var deltaX = touchCurrentX - touchStartX;
      if (deltaX < -swipeThreshold) {
        closePanel();
      }
    }

    gestureDirection = null;
  });

}

function initProductModal() {
  var overlay = document.querySelector('[data-product-modal-overlay]');
  var modal = document.querySelector('[data-product-modal]');
  if (!overlay || !modal) return;
  

  document.addEventListener('click', function (e) {
    var trigger = e.target.closest('[data-open-product]');
    if (trigger) {
      e.preventDefault();
      var product = window.BLEGAB_SHOP_PRODUCTS.find(p => p.id === trigger.dataset.openProduct);
      if (product) openModal(product);
    }
    if (e.target.closest('[data-product-modal-close]') || e.target === overlay) {
      closeModal();
    }
  });

  function openModal(product) {
    modal.querySelector('[data-modal-name]').textContent = product.name;
    modal.querySelector('[data-modal-price]').textContent = '$' + Number(product.price).toFixed(2);
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

  // option pill toggles
  modal.querySelectorAll('[data-option-group]').forEach(function (group) {
    group.addEventListener('click', function (e) {
      var pill = e.target.closest('.option-pill');
      if (!pill) return;
      group.querySelectorAll('.option-pill').forEach(p => p.classList.remove('is-active'));
      pill.classList.add('is-active');
    });
  });


}


// Custom Select Dropdown
function initCustomSelect() {
  var customSelect = document.querySelector('[data-custom-select]');
  if (!customSelect) return;

  var trigger = customSelect.querySelector('[data-custom-select-trigger]');
  var dropdown = customSelect.querySelector('[data-custom-select-dropdown]');
  var textEl = customSelect.querySelector('[data-custom-select-text]');
  var options = customSelect.querySelectorAll('.custom-select__option');
  var nativeSelect = document.querySelector('[data-sort-select]');

  // Show/hide options based on selection
  function updateDropdownOptions() {
    options.forEach(function (option) {
      if (option.classList.contains('is-selected')) {
        option.style.display = 'none';
      } else {
        option.style.display = '';
      }
    });
  }

  // Initial state
  updateDropdownOptions();

  // Toggle dropdown
  trigger.addEventListener('click', function () {
    updateDropdownOptions();
    customSelect.classList.toggle('is-open');
  });

  // Close dropdown when clicking option
  options.forEach(function (option) {
    option.addEventListener('click', function () {
      var value = this.dataset.value;
      var text = this.textContent;

      // Update custom select
      textEl.textContent = text;
      options.forEach(opt => opt.classList.remove('is-selected'));
      this.classList.add('is-selected');

      // Update native select
      nativeSelect.value = value;
      
      // Trigger change event on native select
      var event = new Event('change', { bubbles: true });
      nativeSelect.dispatchEvent(event);

      // Hide selected option and close dropdown
      updateDropdownOptions();
      customSelect.classList.remove('is-open');
    });
  });

  // Close dropdown when clicking outside
  document.addEventListener('click', function (e) {
    if (!customSelect.contains(e.target)) {
      customSelect.classList.remove('is-open');
    }
  });

  // Close on escape
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      customSelect.classList.remove('is-open');
    }
  });
}



function initClearFilters() {
  var clearBtn = document.querySelector('[data-clear-filters]');
  if (!clearBtn) return;

  clearBtn.addEventListener('click', function () {
    // Uncheck all checkboxes
    var checkboxes = document.querySelectorAll('.shop-filter__checkbox input[type="checkbox"]');
    checkboxes.forEach(function (cb) {
      cb.checked = false;
    });

    // Reset price slider to $100
    var slider = document.querySelector('[data-price-slider]');
    var priceLeft = document.querySelector('.shop-filter__price-left');
    var priceRight = document.querySelector('[data-price-end]');
    if (slider) {
      slider.value = 1;
    }
    if (priceLeft) {
      priceLeft.textContent = '$100';
      priceLeft.classList.remove('is-muted');
    }
    if (priceRight) {
      priceRight.classList.remove('is-active');
    }
  });
}
