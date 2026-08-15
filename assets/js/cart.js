/* =========================================================
   CART PAGE JS
   Renders the cart table/cards + order summary from
   window.BLEGAB_CART (main.js) + window.BLEGAB_SHOP_PRODUCTS
   (Product-data.js). Also drives the shared product detail
   modal (same markup/behavior as shop.html) and the
   newsletter form.
   ========================================================= */
const API_URL = "https://backend-6j62.onrender.com/api/cart";

document.addEventListener("DOMContentLoaded", function () {

    renderCartPage();

    initCartPageQtyAndDelete();

    initProductModal();

    initNewsletterForm();

});

/* -----------------------------
   Money formatting — "$1,600.00"
   ----------------------------- */
function formatMoney(amount) {

    return new Intl.NumberFormat("en-US", {

        style: "currency",

        currency: "USD"

    }).format(amount);

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
async function renderCartPage() {
  var listEl = document.querySelector("[data-cart-page-list]");
  var emptyEl = document.querySelector("[data-cart-page-empty]");
  var tableHead = document.querySelector(".cart-page__table-head");
  var summaryEl = document.querySelector(".cart-page__summary");
  var headingCountEl = document.querySelector("[data-cart-count-heading]");

  if (!listEl) return;

  try {
    const response = await fetch(API_URL, {
      method: "GET",
      credentials: "include"
    });

    const data = await response.json();

    if (!data.success) {
      console.error(data.message);
      return;
    }
    var items = data.cart?.items || [];
    var itemCount = data.totalItems || 0;
    var subtotal = data.subtotal || 0;

    if (headingCountEl) {
      headingCountEl.textContent = itemCount;
    }

    if (items.length === 0) {
      listEl.innerHTML = "";
      if (emptyEl) emptyEl.hidden = false;
      if (tableHead) tableHead.style.display = "none";
      if (summaryEl) summaryEl.hidden = true;
      return;
    }

    if (emptyEl) emptyEl.hidden = true;
    if (summaryEl) summaryEl.hidden = false;
    if (tableHead) tableHead.style.display = "";

    listEl.innerHTML = items.map(function (item) {

      var product = item.product;

      if (!product) {
         return "";
      }
      var lineTotal = item.lineTotal;

      var image =
      product.images && product.images.length
        ? product.images[0]
        : "/images/placeholder.png";

      return (
        '<div class="cart-page__row" data-cart-page-row="' + product._id + '">' +

          '<div class="cart-page__row-product">' +

            '<a href="#" class="cart-page__row-image-link" data-open-product="' + product._id + '">' +

              '<img src="' + image + '" alt="' + product.name + '" class="cart-page__row-image">' +

            '</a>' +

            '<div class="cart-page__row-info">' +

              '<a href="#" class="cart-page__row-name" data-open-product="' + product._id + '">' +

                product.name +

              '</a>' +

              '<p class="cart-page__row-meta">Premium Human Hair</p>' +

              '<span class="cart-page__row-mobile-price">' +

                formatMoney(product.price) +

              '</span>' +

            '</div>' +

          '</div>' +

          '<div class="cart-page__row-price">' +

            formatMoney(product.price) +

          '</div>' +

          '<div class="cart-page__row-actions">' +

            '<div class="cart-page__qty-stepper">' +

              '<button type="button" class="cart-page__qty-btn" data-cart-page-decrease="' + product._id + '">&minus;</button>' +

              '<input type="number" class="cart-page__qty-value" value="' + item.quantity + '" min="1" data-cart-page-qty-input="' + product._id + '">' +

              '<button type="button" class="cart-page__qty-btn" data-cart-page-increase="' + product._id + '">+</button>' +

              '<button type="button" class="cart-page__reset-btn" data-cart-page-reset="' + product._id + '">' +

                '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">' +

                  '<path d="M21 12a9 9 0 1 1-3.4-7.02" stroke-linecap="round"/>' +

                  '<path d="M21 3v5h-5" stroke-linecap="round" stroke-linejoin="round"/>' +

                '</svg>' +

              '</button>' +

            '</div>' +

            '<button type="button" class="cart-page__row-delete" data-cart-page-remove="' + product._id + '">' +

              '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">' +

                '<path d="M4 7h16M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2m2 0-1 13a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 7" stroke-linecap="round" stroke-linejoin="round"/>' +

              '</svg>' +

            '</button>' +

            '<span class="cart-page__row-total">' +

              formatMoney(lineTotal) +

            '</span>' +

          '</div>' +

        '</div>'
      );

    }).join("");

    var subtotalEl = document.querySelector("[data-summary-subtotal]");
    var totalEl = document.querySelector("[data-summary-total]");
    var countEl = document.querySelector("[data-summary-count]");
    var afterpayEl = document.querySelector("[data-summary-afterpay]");

    if (subtotalEl) subtotalEl.textContent = formatMoney(subtotal);
    if (totalEl) totalEl.textContent = formatMoney(subtotal);
    if (countEl) countEl.textContent = itemCount;
    if (afterpayEl) afterpayEl.textContent = formatMoney(subtotal / 4);

  } catch (err) {
    console.error("Failed to load cart:", err);
  }
}

/* -----------------------------
   Qty +/- and delete — delegated, since rows are re-rendered
   ----------------------------- */
function initCartPageQtyAndDelete() {

  document.addEventListener("click", async function (event) {

    var decreaseBtn = event.target.closest("[data-cart-page-decrease]");
    var increaseBtn = event.target.closest("[data-cart-page-increase]");
    var removeBtn = event.target.closest("[data-cart-page-remove]");
    var resetBtn = event.target.closest("[data-cart-page-reset]");

    if (!decreaseBtn && !increaseBtn && !removeBtn && !resetBtn) return;

    try {

      // ------------------------
      // Reset to quantity 1
      // ------------------------
      if (resetBtn) {

       const updateResponse = await fetch(`${API_URL}/update/${resetBtn.dataset.cartPageReset}`,{
            method: "PUT",
            credentials: "include",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              quantity: 1
            })
          }
        );

        const updateData = await updateResponse.json();

        if (!updateResponse.ok) {
        alert(updateData.message);
        return;
        }

        renderCartPage();

        if (window.BLEGAB_CART) {
          await window.BLEGAB_CART.renderBadge();
          await window.BLEGAB_CART.renderDrawer();
        }

        return;

      }

      // ------------------------
      // Decrease quantity
      // ------------------------
      if (decreaseBtn) {

        var id = decreaseBtn.dataset.cartPageDecrease;

        const cartRes = await fetch(API_URL, {
          credentials: "include"
        });

        const cartData = await cartRes.json();

        const item = cartData.cart.items.find(function (i) {
          return i.product._id === id;
        });

        if (item && item.quantity > 1) {

         const updateResponse = await fetch(`${API_URL}/update/${id}`, {
            method: "PUT",
            credentials: "include",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              quantity: item.quantity - 1
            })
          });

          const updateData = await updateResponse.json();

         if (!updateResponse.ok) {
         alert(updateData.message);
         return;
        }

        }

        renderCartPage();

        if (window.BLEGAB_CART) {
          await window.BLEGAB_CART.renderBadge();
          await window.BLEGAB_CART.renderDrawer();
        }
      }

      // ------------------------
      // Increase quantity
      // ------------------------
      if (increaseBtn) {

        var id = increaseBtn.dataset.cartPageIncrease;

        const cartRes = await fetch(API_URL, {
          credentials: "include"
        });

        const cartData = await cartRes.json();

        const item = cartData.cart.items.find(function (i) {
          return i.product._id === id;
        });

        if (item) {

         const updateResponse = await fetch(`${API_URL}/update/${id}`, {
            method: "PUT",
            credentials: "include",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              quantity: item.quantity + 1
            })
          });

          const updateData = await updateResponse.json();

         if (!updateResponse.ok) {
         alert(updateData.message);
         return;
        }

        }

        renderCartPage();

        if (window.BLEGAB_CART) {
          await window.BLEGAB_CART.renderBadge();
          await window.BLEGAB_CART.renderDrawer();
        }
      }

      // ------------------------
      // Remove item
      // ------------------------
      if (removeBtn) {

       const removeResponse = await fetch(
            `${API_URL}/remove/${removeBtn.dataset.cartPageRemove}`,
          {
            method: "DELETE",
            credentials: "include"
          }
        );

        const removeData = await removeResponse.json();

        if (!removeResponse.ok) {
        alert(removeData.message);
        return;
       }

        renderCartPage();

        if (window.BLEGAB_CART) {
          await window.BLEGAB_CART.renderBadge();
          await window.BLEGAB_CART.renderDrawer();
        }
      }

    } catch (err) {
      console.error(err);
    }

  });

  // --------------------------------
  // Manual quantity input
  // --------------------------------
  document.addEventListener("change", async function (event) {

    var qtyInput = event.target.closest("[data-cart-page-qty-input]");

    if (!qtyInput) return;

    var id = qtyInput.dataset.cartPageQtyInput;

    var newQty = parseInt(qtyInput.value, 10);

    if (isNaN(newQty) || newQty < 1) {
      newQty = 1;
    }

    qtyInput.value = newQty;

    try {

     const updateResponse = await fetch(`${API_URL}/update/${id}`, {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          quantity: newQty
        })
      });

      const updateData = await updateResponse.json();

      if (!updateResponse.ok) {
      alert(updateData.message);
      return;
     }

      renderCartPage();

      if (window.BLEGAB_CART) {
        await window.BLEGAB_CART.renderBadge();
        await window.BLEGAB_CART.renderDrawer();
      }

    } catch (err) {
      console.error(err);
    }

  });

}

/* -----------------------------
   Product detail modal — same behavior as shop.html's version,
   opened by clicking a cart row's product name
   ----------------------------- */
function initProductModal() {

  var overlay = document.querySelector("[data-product-modal-overlay]");
  var modal = document.querySelector("[data-product-modal]");

  if (!overlay || !modal) return;

  document.addEventListener("click", async function (e) {

    var trigger = e.target.closest("[data-open-product]");

    if (trigger) {

      e.preventDefault();

      try {

        const response = await fetch(API_URL, {
          credentials: "include"
        });

        const data = await response.json();

        const item = data.cart.items.find(function (item) {
        return item.product && item.product._id === trigger.dataset.openProduct;
        });

        if (item) {
          openModal(item.product);
        }

      } catch (err) {
        console.error(err);
      }

    }

    if (
      e.target.closest("[data-product-modal-close]") ||
      e.target === overlay
    ) {
      closeModal();
    }

  });

  function openModal(product) {

    modal.querySelector("[data-modal-name]").textContent = product.name;

    modal.querySelector("[data-modal-price]").textContent =
      formatMoney(product.price);

    var image =
  product.images && product.images.length
    ? product.images[0]
    : "/images/placeholder.png";

    modal.querySelector("[data-modal-main-image]").src = image;

    modal.querySelector("[data-modal-main-image]").alt = product.name;

    var badge = modal.querySelector("[data-modal-badge]");

    if (badge) {

      badge.hidden = !product.badge;

      if (product.badge) {
        badge.textContent = product.badge;
      }

    }

    modal.dataset.activeProduct = product._id;

    let qty = 1;

    modal.querySelector("[data-qty-value]").textContent = qty;

    modal.classList.add("is-open");

    overlay.classList.add("is-open");

    document.body.style.overflow = "hidden";

  }

  function closeModal() {

    modal.classList.remove("is-open");

    overlay.classList.remove("is-open");

    document.body.style.overflow = "";

  }

  modal.querySelectorAll("[data-option-group]").forEach(function (group) {

    group.addEventListener("click", function (e) {

      var pill = e.target.closest(".option-pill");

      if (!pill) return;

      group.querySelectorAll(".option-pill").forEach(function (p) {
        p.classList.remove("is-active");
      });

      pill.classList.add("is-active");

    });

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
