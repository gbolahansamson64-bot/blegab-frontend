/* =========================================================
   SHOP PAGE JS — renders the product grid + pagination
   from window.BLEGAB_SHOP_PRODUCTS (see Product-data.js).
   ========================================================= */

// Global state
var currentPage = 1;

var productsPerPage = 9;

var allProducts = [];

var totalPages = 1;

var totalProducts = 0;

var keyword = "";

var selectedCategory = "";

var selectedSort = "";

var minPrice = "";

var maxPrice = "";

var selectedLength = "";
var selectedTexture = "";
var selectedCapSize = "";
var selectedLaceType = "";

var allCategories = [];
var wishlistProducts = [];

const API_URL = "http://localhost:5000/api/products";

const CATEGORY_URL = "http://localhost:5000/api/categories";

const CART_URL = "http://localhost:5000/api/cart";

const WISHLIST_URL = "http://localhost:5000/api/wishlist";


function getProductImage(image) {
    if (!image) {
        return "assets/images/no-image.webp";
    }

    // Already a complete URL
    if (
        image.startsWith("http://") ||
        image.startsWith("https://")
    ) {
        return image;
    }

    // Images stored by backend such as /uploads/products/...
    return "http://localhost:5000" + (
        image.startsWith("/") ? image : "/" + image
    );
}

async function fetchProducts() {

    try {

        var grid = document.querySelector("[data-product-grid]");

        if (grid) {

            grid.innerHTML = `
                <p class="shop-loading">
                    Loading products...
                </p>
            `;

        }
       var params = new URLSearchParams(window.location.search);

         keyword = params.get("keyword") || "";

         selectedCategory = params.get("category") || "";

         selectedSort = params.get("sort") || "";

         minPrice = params.get("minPrice") || "";

         maxPrice = params.get("maxPrice") || "";

         selectedLength = params.get("length") || "";

         selectedTexture = params.get("texture") || "";

         selectedCapSize = params.get("capSize") || "";

         selectedLaceType = params.get("laceType") || "";

        var url =
            API_URL +
            "?page=" + currentPage +
            "&limit=" + productsPerPage;

        if (keyword) {
          url += "&keyword=" + encodeURIComponent(keyword);
        }

        if (selectedCategory) {
         url += "&category=" + encodeURIComponent(selectedCategory);
        }

        if (selectedSort) {
          url += "&sort=" + encodeURIComponent(selectedSort);
        }

        if (minPrice) {
          url += "&minPrice=" + encodeURIComponent(minPrice);
        }

        if (maxPrice) {
          url += "&maxPrice=" + encodeURIComponent(maxPrice);
        }

        if (selectedLength) {
    url += "&length=" + encodeURIComponent(selectedLength);
}

if (selectedTexture) {
    url += "&texture=" + encodeURIComponent(selectedTexture);
}

if (selectedCapSize) {
    url += "&capSize=" + encodeURIComponent(selectedCapSize);
}

if (selectedLaceType) {
    url += "&laceType=" + encodeURIComponent(selectedLaceType);
}
        console.log("Fetching:", url);
        var response = await fetch(url);

        if (!response.ok) {

    const error = await response.json();

    throw new Error(error.message || "Unable to load products");

}

       const data = await response.json();

        allProducts = data.products;

        currentPage = data.currentPage;

        totalPages = data.totalPages;

        totalProducts = data.totalProducts;

        renderProductGrid(currentPage);

    } catch (error) {

    console.error(error);

    var grid = document.querySelector("[data-product-grid]");

    if (grid) {

        grid.innerHTML =
            '<div class="shop-empty">' +
                '<h3>Unable to load products.</h3>' +
                '<p>Please refresh the page or try again later.</p>' +
            '</div>';

    }

}

}

function updateURL() {

    var params = new URLSearchParams();

    if (keyword) {
        params.set("keyword", keyword);
    }

    if (selectedCategory) {
        params.set("category", selectedCategory);
    }

    if (selectedSort) {
        params.set("sort", selectedSort);
    }

    if (minPrice) {
        params.set("minPrice", minPrice);
    }

    if (maxPrice) {
        params.set("maxPrice", maxPrice);
    }

    if (selectedLength) {
        params.set("length", selectedLength);
    }

    if (selectedTexture) {
        params.set("texture", selectedTexture);
    }

    if (selectedCapSize) {
        params.set("capSize", selectedCapSize);
    }

    if (selectedLaceType) {
        params.set("laceType", selectedLaceType);
    }

    history.replaceState(
        {},
        "",
        window.location.pathname +
        (params.toString() ? "?" + params.toString() : "")
    );

}

// async function fetchCategories() {

//     try {

//         var response = await fetch(CATEGORY_URL);

//         if (!response.ok) {

//             throw new Error("Unable to load categories");

//         }

//         const data = await response.json();

//         allCategories = data.categories;

//         renderCategories();

//     }

//     catch (error) {

//         console.error(error);

//     }

// }

async function fetchCategories() {
    try {
        var response = await fetch(CATEGORY_URL);

        console.log("Status:", response.status);

        if (!response.ok) {
            throw new Error("Unable to load categories");
        }

        const data = await response.json();

        console.log("Response:", data);

        allCategories = data.categories || data;

        console.log("Categories:", allCategories);

        renderCategories();

    } catch (error) {
        console.error("Category Error:", error);
    }
}

function renderCategories() {

    console.log(allCategories);

    var list = document.querySelector(".shop-sidebar__list");

    if (!list) return;

    list.innerHTML = "";

    var all = document.createElement("li");

    all.innerHTML =
        '<a href="#" class="shop-sidebar__link' +
        (selectedCategory === "" ? " is-active" : "") +
        '" data-category="">All Wigs</a>';

    list.appendChild(all);

    allCategories.forEach(function (category) {

        var li = document.createElement("li");

        li.innerHTML =
            '<a href="#" class="shop-sidebar__link' +
            (selectedCategory === category.slug ? " is-active" : "") +
            '" data-category="' + category.slug + '">' +
            category.name +
            "</a>";

        list.appendChild(li);

    });

    var links = list.querySelectorAll(".shop-sidebar__link");

    links.forEach(function (link) {

        link.addEventListener("click", function (e) {

            e.preventDefault();

            links.forEach(function (item) {

                item.classList.remove("is-active");

            });

            this.classList.add("is-active");

            selectedCategory = this.dataset.category;

            currentPage = 1;

            updateURL();

            fetchProducts();

        });

    });

}

function initSearch() {

    var searchTimer;

    var input = document.querySelector("[data-search]");

    if (!input) return;

    // Restore search value from URL
    input.value = keyword;

    input.addEventListener("input", function () {

        keyword = this.value.trim();

        currentPage = 1;

        updateURL();

        clearTimeout(searchTimer);

searchTimer = setTimeout(function(){

    fetchProducts();

},300);

    });

}

document.addEventListener("DOMContentLoaded", function () {

    (async function () {

        calculateProductsPerPage();

        await fetchCategories();

        await fetchWishlist();

        await updateWishlistCount();

        await fetchProducts();

        initSearch();

        initSidebarFilters();

        initNewsletterForm();

        initShopFilterPanel();

        initProductModal();

        initModalOptionPills();

        initPaginationArrows();

        initCustomSelect();

        initPriceSlider();

        initClearFilters();

    })();

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

function getTotalPages(){

    return totalPages;

}

function getProductsForPage() {

    return allProducts;

}

async function fetchWishlist() {

    try {

        const response = await fetch(

            WISHLIST_URL,

            {

                credentials: "include"

            }

        );

        if (!response.ok) {

            wishlistProducts = [];

            return;

        }

        const data = await response.json();

        wishlistProducts = data.wishlist.products.map(function (product) {

            return product._id;

        });

    }

    catch (error) {

        wishlistProducts = [];

    }

}

async function updateWishlistCount() {

    try {

        const response = await fetch(

            WISHLIST_URL + "/count",

            {

                credentials: "include"

            }

        );

        if (!response.ok) return;

        const data = await response.json();

        var badge = document.querySelector("[data-wishlist-count]");

        if (!badge) return;

        badge.textContent = data.count;

        badge.style.display = data.count > 0 ? "flex" : "none";

    }

    catch (error) {

        console.error(error);

    }

}

function renderProductGrid(page) {
  var grid = document.querySelector('[data-product-grid]');
  var countEl = document.querySelector('[data-results-count]');
  if (!grid) return;

  var pageProducts = getProductsForPage();
  
  // Ensure page is valid
  if (page < 1) page = 1;
  if (page > totalPages) page = totalPages;
  currentPage = page;
  
  grid.innerHTML = '';

  if (pageProducts.length === 0) {

    grid.innerHTML =
        '<div class="shop-empty">' +
            '<h3>No products found</h3>' +
            '<p>Try changing your search or filters.</p>' +
        '</div>';

    if (countEl) {

        countEl.textContent = "Showing 0 results";

    }

    document.querySelector("[data-page-numbers]").innerHTML = "";

    updatePaginationArrows();

    return;

}

  pageProducts.forEach(function (item) {
    // var image =
    // item.images && item.images.length
    //     ? item.images[0]
    //     : "assets/images/no-image.webp";
    var card = document.createElement('li');
    card.className = 'product-card';

    var isWishlisted = wishlistProducts.includes(item._id);
    
    // Build badge HTML if exists
    var badgeHTML = '';
    if (item.badge) {
      badgeHTML = '<span class="product-card__badge">' + item.badge + '</span>';
    }
    
    card.innerHTML = 
      '<a href="#" class="product-card__link" data-open-product="' + item._id + '">' +
        '<div class="product-card__image-wrap">' +
          '<img src="' +
(
item.images && item.images.length
    ? item.images[0]
    : "assets/images/no-image.webp"
)
+
'" alt="' + item.name + '" class="product-card__image" loading="lazy">' +
          badgeHTML +
          '<button class="product-card__wishlist' + (isWishlisted ? ' is-active' : '') +'" data-wishlist="' + item._id +'" aria-label="Add to wishlist">' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>' +
          '</button>' +
        '</div>' +
        '<h3 class="product-card__name">' + item.name + '</h3>' +
        '<p class="product-card__meta">Premium Human Hair</p>' +
        '<span class="product-card__price">$' + Number(item.price).toFixed(2) + '</span>' +
      '</a>' +
      '<button class="btn btn-primary product-card__cta" data-quick-add="' + item._id + '">' +
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

    var cardImage = card.querySelector(".product-card__image");

    if (cardImage) {

    cardImage.onerror = function () {

        this.src = "assets/images/no-image.webp";

    };

   }
  });

// Add quick add functionality
var quickAddButtons = grid.querySelectorAll("[data-quick-add]");

quickAddButtons.forEach(function (btn) {

    btn.addEventListener("click", async function (e) {

        e.preventDefault();
        e.stopPropagation();

        const productId = this.dataset.quickAdd;

        const originalHTML = this.innerHTML;

        this.disabled = true;

this.innerHTML = "Adding...";

try {

    await window.BLEGAB_CART.addItem(productId, 1);

    this.innerHTML = "✓ Added";

    this.style.backgroundColor = "#1a1a1a";
    this.style.borderColor = "#1a1a1a";
    this.style.color = "#D4AF37";

    setTimeout(() => {

        this.innerHTML = originalHTML;

        this.style.backgroundColor = "";

        this.style.borderColor = "";

        this.style.color = "";

        this.disabled = false;

    }, 1500);

} catch (error) {

    console.error(error);

    alert("Something went wrong. Please try again.");

    this.innerHTML = originalHTML;

    this.disabled = false;

}

    });

});

var wishlistButtons = grid.querySelectorAll("[data-wishlist]");

wishlistButtons.forEach(function (button) {

    button.addEventListener("click", async function (e) {

        e.preventDefault();

        e.stopPropagation();

        try {

            const response = await fetch(

                WISHLIST_URL + "/toggle",

                {

                    method: "POST",

                    credentials: "include",

                    headers: {

                        "Content-Type": "application/json"

                    },

                    body: JSON.stringify({

                        productId: this.dataset.wishlist

                    })

                }

            );

            const data = await response.json();

            if (!data.success) {

                alert(data.message);

                return;

            }

            var productId = this.dataset.wishlist;

if (data.wishlisted) {

    if (!wishlistProducts.includes(productId)) {

        wishlistProducts.push(productId);

    }

} else {

    wishlistProducts = wishlistProducts.filter(function (id) {

        return id !== productId;

    });

}

            this.classList.toggle(

                "is-active",

                data.wishlisted

            );

            var badge = document.querySelector("[data-wishlist-count]");

            if (badge) {

            badge.textContent = data.count;

             badge.style.display = data.count > 0 ? "flex" : "none";

            }

        }

        catch (error) {

            console.error(error);

        }

    });

});

  // Update results count
  if (countEl) {
   var start = ((currentPage - 1) * productsPerPage) + 1;

var end = start + allProducts.length - 1;

countEl.textContent =
"Showing " +
start +
"–" +
end +
" of " +
totalProducts +
" results";
  }

  renderPagination(currentPage);
  updatePaginationArrows();
}

function renderPagination(activePage) {
  var wrap = document.querySelector('[data-page-numbers]');
 if (!wrap) return;

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
    
    btn.addEventListener("click", function () {

    var page = parseInt(this.textContent);

    if (page !== currentPage) {

        currentPage = page;

        fetchProducts();

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

  var prevBtn = document.querySelector("[data-page-prev]");
  var nextBtn = document.querySelector("[data-page-next]");

  if (prevBtn) {

    prevBtn.addEventListener("click", function () {

      if (currentPage > 1) {

        currentPage--;

        fetchProducts();

        scrollGridIntoView();

      }

    });

  }

  if (nextBtn) {

    nextBtn.addEventListener("click", function () {

      if (currentPage < totalPages) {

        currentPage++;

        fetchProducts();

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

  var modalName = modal.querySelector("[data-modal-name]");

var modalPrice = modal.querySelector("[data-modal-price]");

var modalMainImage = modal.querySelector("[data-modal-main-image]");

var modalDescription = modal.querySelector("[data-modal-description]");

var modalLength = modal.querySelector("[data-modal-length]");

var modalTexture = modal.querySelector("[data-modal-texture]");

var modalCapSize = modal.querySelector("[data-modal-cap-size]");

var modalLaceType = modal.querySelector("[data-modal-lace-type]");

var modalBadge = modal.querySelector("[data-modal-badge]");

var thumbsContainer = modal.querySelector("[data-modal-thumbs]");

var qtyValue = modal.querySelector("[data-qty-value]");
  
  var qty = 1;

  document.addEventListener('click', function (e) {

    if (
        e.target.closest("[data-wishlist]") ||
        e.target.closest("[data-quick-add]")
    ) {
        return;
    }
    var trigger = e.target.closest('[data-open-product]');
    if (trigger) {
      e.preventDefault();
      var product = allProducts.find(function(product){

    return product._id === trigger.dataset.openProduct;

 });
      if (product) openModal(product);
    }
    if (e.target.closest('[data-product-modal-close]') || e.target === overlay) {
      
      closeModal();
    }
  });

  function openModal(product) {
    modalName.textContent = product.name;
    modalPrice.textContent = "$" + Number(product.price).toFixed(2);
    const mainImage =
    product.images?.length
        ? product.images[0]
        : "assets/images/no-image.webp";

modalMainImage.src = mainImage;

modalMainImage.alt = product.name;

modalMainImage.onerror = function () {
    console.error("Failed to load product image:", this.src);
};
    modalDescription.textContent = product.description || "No description available.";
    modalLength.textContent = product.length || "Not specified";

   modalTexture.textContent = product.texture || "Not specified";

   modalCapSize.textContent = product.capSize || "Not specified";

  modalLaceType.textContent = product.laceType || "Not specified";

  // var thumbsContainer = modal.querySelector("[data-modal-thumbs]");

thumbsContainer.innerHTML = "";

var images = Array.isArray(product.images) && product.images.length
    ? product.images
    : ["assets/images/no-image.webp"];

    console.log("PRODUCT IMAGES:", product.images);

images.forEach(function (image, index) {
    console.log("IMAGE", index, image);
});

if (images.length <= 1) {

    thumbsContainer.style.display = "none";

} else {

    thumbsContainer.style.display = "flex";

}

images.forEach(function (image, index) {

    var thumb = document.createElement("button");

    thumb.type = "button";

    thumb.className = "product-modal__thumb";

    if (index === 0) {
        thumb.classList.add("is-active");
    }

    thumb.innerHTML =
        '<img src="' +
        image +
        '" alt="' +
        product.name +
        " " +
        (index + 1) +
        '">';

    thumb.addEventListener("click", function () {

        modalMainImage.src = image;

        modal.querySelectorAll(".product-modal__thumb")
            .forEach(function (item) {

                item.classList.remove("is-active");

            });

        thumb.classList.add("is-active");

    });

    thumbsContainer.appendChild(thumb);

    var thumbImage = thumb.querySelector("img");

    thumbImage.onerror = function () {

        console.error(
            "Failed to load thumbnail:",
            image
        );

        this.style.display = "none";

    };

});
    var badge = modalBadge;
    if (badge) {
      badge.hidden = !product.badge;
      if (product.badge) badge.textContent = product.badge;
    }
    
    modal.dataset.activeProduct = product._id || "";
    qty = 1;
    qtyValue.textContent = qty;
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

  // quantity stepper
  var qtyIncrease = modal.querySelector('[data-qty-increase]');
  var qtyDecrease = modal.querySelector('[data-qty-decrease]');
  var qtyValue = modal.querySelector('[data-qty-value]');

  // if (qtyIncrease.dataset.bound) return;

  //    qtyIncrease.dataset.bound = "true";
  
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

  // add to cart
  var addToCartBtn = modal.querySelector("[data-modal-add-to-cart]");
  // if (addToCartBtn.dataset.bound) return;

  // addToCartBtn.dataset.bound = "true";

 if (addToCartBtn) {

    addToCartBtn.addEventListener("click", async function () {

    addToCartBtn.disabled = true;

    const originalText = addToCartBtn.innerHTML;

    addToCartBtn.innerHTML = "Adding...";

    try {

        await window.BLEGAB_CART.addItem(
        modal.dataset.activeProduct,
        qty
       );

      addToCartBtn.innerHTML = "✓ Added";

      setTimeout(function () {

     closeModal();

     }, 600);

    }

    catch (error) {

        console.error(error);

        alert("Something went wrong. Please try again.");

    }

    finally {

    setTimeout(function () {

        addToCartBtn.disabled = false;

        addToCartBtn.innerHTML = originalText;

    }, 600);

}

});

 }

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && modal.classList.contains('is-open')) {
      closeModal();
    }
  });
}

function initModalOptionPills() {

    var groups = document.querySelectorAll("[data-option-group]");

    groups.forEach(function(group){

        var pills = group.querySelectorAll(".option-pill");

        pills.forEach(function(pill){

            pill.addEventListener("click", function(){

                pills.forEach(function(btn){
                    btn.classList.remove("is-active");
                });

                this.classList.add("is-active");

            });

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

  if(selectedSort){

    nativeSelect.value = selectedSort;

    options.forEach(function(option){

        option.classList.remove("is-selected");

        if(option.dataset.value === selectedSort){

            option.classList.add("is-selected");

            textEl.textContent = option.textContent;

        }

    });

}

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

      selectedSort = value;

      currentPage = 1;

      updateURL();

      fetchProducts();
      
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

function initSidebarFilters() {

  function bindFilter(selector, callback) {

    document.querySelectorAll(selector).forEach(function (input) {

        input.addEventListener("change", function () {

            callback(this.checked ? this.value : "");

            currentPage = 1;

            updateURL();

            fetchProducts();

        });

    });

}

bindFilter(
    'input[name="length"]',
    function (value) {

        selectedLength = value;

    }
);

bindFilter(
    'input[name="texture"]',
    function (value) {

        selectedTexture = value;

    }
);

bindFilter(
    'input[name="cap-size"]',
    function (value) {

        selectedCapSize = value;

    }
);

bindFilter(
    'input[name="lace-type"]',
    function (value) {

        selectedLaceType = value;

    }
);

    // // Length
    // document.querySelectorAll('.shop-filter input[value="8-12"], .shop-filter input[value="14-16"], .shop-filter input[value="18-20"], .shop-filter input[value="22-24"], .shop-filter input[value="26-plus"]').forEach(function (checkbox) {

    //     checkbox.addEventListener("change", function () {

    //         selectedLength = this.checked ? this.value : "";

    //         currentPage = 1;

    //         updateURL();

    //         fetchProducts();

    //     });

    // });

    // // Texture
    // document.querySelectorAll('.shop-filter input[value="straight"], .shop-filter input[value="body-wave"], .shop-filter input[value="loose-wave"], .shop-filter input[value="deep-wave"], .shop-filter input[value="curly"], .shop-filter input[value="kinky-curly"]').forEach(function (checkbox) {

    //     checkbox.addEventListener("change", function () {

    //         selectedTexture = this.checked ? this.value : "";

    //         currentPage = 1;

    //         updateURL();

    //         fetchProducts();

    //     });

    // });

    // // Cap Size
    // document.querySelectorAll('.shop-filter input[value="small"], .shop-filter input[value="medium"], .shop-filter input[value="large"]').forEach(function (checkbox) {

    //     checkbox.addEventListener("change", function () {

    //         selectedCapSize = this.checked ? this.value : "";

    //         currentPage = 1;

    //         updateURL();

    //         fetchProducts();

    //     });

    // });

    // // Lace Type
    // document.querySelectorAll('.shop-filter input[value="hd-lace"], .shop-filter input[value="transparent-lace"], .shop-filter input[value="swiss-lace"]').forEach(function (checkbox) {

    //     checkbox.addEventListener("change", function () {

    //         selectedLaceType = this.checked ? this.value : "";

    //         currentPage = 1;

    //         updateURL();

    //         fetchProducts();

    //     });

    // });

    if (selectedLength) {

    var length = document.querySelector(
        '.shop-filter input[value="' + selectedLength + '"]'
    );

    if(length) length.checked = true;

}

if (selectedTexture) {

    var texture = document.querySelector(
        '.shop-filter input[value="' + selectedTexture + '"]'
    );

    if(texture) texture.checked = true;

}

if (selectedCapSize) {

    var cap = document.querySelector(
        '.shop-filter input[value="' + selectedCapSize + '"]'
    );

    if(cap) cap.checked = true;

}

if (selectedLaceType) {

    var lace = document.querySelector(
        '.shop-filter input[value="' + selectedLaceType + '"]'
    );

    if(lace) lace.checked = true;

}

}

function initPriceSlider() {

  var slider = document.querySelector("[data-price-slider]");
  var priceLeft = document.querySelector(".shop-filter__price-left");
  var priceRight = document.querySelector("[data-price-end]");

  if (!slider || !priceLeft || !priceRight) return;

   if (maxPrice) {

    slider.value = Math.min(Number(maxPrice) / 100, 10);

    if (Number(maxPrice) >= 1000) {

        priceLeft.textContent = "$1000+";

        priceRight.classList.add("is-active");

        priceLeft.classList.add("is-muted");

    } else {

        priceLeft.textContent = "$" + maxPrice;

        priceRight.classList.remove("is-active");

        priceLeft.classList.remove("is-muted");

    }

}

  // var prices = [100,200,300,400,500,600,700,800,900,1000];

  slider.addEventListener("input", function () {

  var step = parseInt(this.value);

  var price = step * 100;

  minPrice = "";

  maxPrice = price;

  if(step === 10){

    priceLeft.textContent = "$1000+";

}else{

    priceLeft.textContent = "$" + price;

}

  if (step === 10) {

    priceRight.classList.add("is-active");

    priceLeft.classList.add("is-muted");

  } else {

    priceRight.classList.remove("is-active");

    priceLeft.classList.remove("is-muted");

  }

  currentPage = 1;

  updateURL();

  fetchProducts();

});

}

function initClearFilters() {

  var clearBtn = document.querySelector("[data-clear-filters]");
  if (!clearBtn) return;

  clearBtn.addEventListener("click", function () {

    // Uncheck all checkboxes
    var radios = document.querySelectorAll(
    ".shop-filter__checkbox input[type='radio']"
    );

   radios.forEach(function (radio) {
   radio.checked = false;
  });

    // Reset price slider
    var slider = document.querySelector("[data-price-slider]");
    var priceLeft = document.querySelector(".shop-filter__price-left");
    var priceRight = document.querySelector("[data-price-end]");

    if (slider) {
      slider.value = 1;
    }

    if (priceLeft) {
      priceLeft.textContent = "$100";
      priceLeft.classList.remove("is-muted");
    }

    if (priceRight) {
      priceRight.classList.remove("is-active");
    }

    // Reset all filter variables
    keyword = "";

selectedCategory = "";

selectedSort = "";

minPrice = "";

maxPrice = "";

selectedLength = "";

selectedTexture = "";

selectedCapSize = "";

selectedLaceType = "";

currentPage = 1;

    // Clear search input
    var searchInput = document.querySelector("[data-search]");
    if (searchInput) {
      searchInput.value = "";
    }

    // Reset custom sort dropdown
    var sortText = document.querySelector("[data-custom-select-text]");

if (sortText) {
    sortText.textContent = "Best Selling";
}

var options = document.querySelectorAll(".custom-select__option");

options.forEach(function(option){

    option.classList.remove("is-selected");

});

if(options.length){

    options[0].classList.add("is-selected");

}

var nativeSelect = document.querySelector("[data-sort-select]");

if(nativeSelect){

    nativeSelect.value = "best-selling";

}

    // Reset category highlight
    document
      .querySelectorAll(".shop-sidebar__link")
      .forEach(function (link) {

        link.classList.remove("is-active");

        if (link.dataset.category === "") {
          link.classList.add("is-active");
        }

      });

    updateURL();

window.scrollTo({

    top: 0,

    behavior: "smooth"

});

fetchProducts();

  });

}
