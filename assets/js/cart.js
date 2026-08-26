// /* =========================================================
//    CART PAGE JS
//    Renders the cart table/cards + order summary from
//    window.BLEGAB_CART (main.js) + window.BLEGAB_SHOP_PRODUCTS
//    (Product-data.js). Also drives the shared product detail
//    modal (same markup/behavior as shop.html) and the
//    newsletter form.
//    ========================================================= */
// const API_URL = "https://api.blegab.com/api/cart";

// document.addEventListener("DOMContentLoaded", function () {

//     renderCartPage();

//     initCartPageQtyAndDelete();

//     initProductModal();

//     initNewsletterForm();

// });

// /* -----------------------------
//    Money formatting — "$1,600.00"
//    ----------------------------- */
// function formatMoney(amount) {

//     return new Intl.NumberFormat("en-US", {

//         style: "currency",

//         currency: "USD"

//     }).format(amount);

// }

// function getCartProductImage(image) {
//   if (!image) {
//     return "/assets/images/placeholder.png";
//   }

//   var value = String(image).trim();

//   if (!value) {
//     return "/assets/images/placeholder.png";
//   }

//   // Full URL — Cloudinary or another remote image
//   if (/^https?:\/\//i.test(value)) {
//     return value;
//   }

//   // Backend-relative path
//   if (value.startsWith("/")) {
//     return "https://api.blegab.com" + value;
//   }

//   // Existing frontend asset path
//   if (value.startsWith("assets/")) {
//     return "/" + value;
//   }

//   // Bare filename returned by backend
//   return "https://api.blegab.com/assets/images/products/" + value;
// }

// // function formatQtyDisplay(num) {
// //   if (num >= 1e9) return (num / 1e9).toFixed(1).replace(/\.0$/, '') + 'B';
// //   if (num >= 1e6) return (num / 1e6).toFixed(1).replace(/\.0$/, '') + 'M';
// //   if (num >= 1e3) return (num / 1e3).toFixed(1).replace(/\.0$/, '') + 'K';
// //   return num.toString();
// // }


// /* =========================================================
//    CART PAGE SHIPPING RULES
//    ========================================================= */
//  const CART_SHIPPING_RATES = {
//    'United States': 20,
//    'Canada': 30,
//    'Nigeria': 50,
//    'United Kingdom': 50
//  };

// function cartShippingForCountry(country) {
//   const key = String(country || '').trim();

//   return Object.prototype.hasOwnProperty.call(
//     CART_SHIPPING_RATES,
//     key
//   )
//     ? CART_SHIPPING_RATES[key]
//     : null;
// }

// async function getCartShippingCountry() {

//   /*
//    * -------------------------------------------------------
//    * 1. Try the authenticated user's saved country first.
//    * -------------------------------------------------------
//    */

//   try {

//     const response = await fetch(
//       'https://api.blegab.com/api/auth/me',
//       {
//         method: 'GET',
//         credentials: 'include'
//       }
//     );

//     if (response.ok) {

//       const data = await response.json();

//       const user = data.user || null;

//       const loggedInCountry =
//         user?.address?.country ||
//         user?.country ||
//         '';

//       if (loggedInCountry) {
//         return loggedInCountry;
//       }
//     }

//   } catch (error) {

//     console.warn(
//       'Unable to load logged-in customer country:',
//       error
//     );
//   }


//   /*
//    * -------------------------------------------------------
//    * 2. If customer is a guest, use the country selected
//    *    during checkout.
//    * -------------------------------------------------------
//    */

//   try {

//     const guestCountry =
//       sessionStorage.getItem('blegab_checkout_country');

//     if (guestCountry) {
//       return guestCountry;
//     }

//   } catch (error) {

//     console.warn(
//       'Unable to read checkout country:',
//       error
//     );
//   }


//   /*
//    * -------------------------------------------------------
//    * 3. No country available yet.
//    * -------------------------------------------------------
//    */

//   return '';
// }

// function renderCartShipping(subtotal, country) {
//   const row = document.querySelector('[data-cart-summary-shipping-row]');
//   const totalEl = document.querySelector('[data-summary-total]');
//   const shipping = cartShippingForCountry(country);

//   if (!row) return;

//   if (!country) {
//     row.innerHTML = '<span>Shipping</span><span data-cart-summary-shipping>Calculated at checkout</span>';
//     if (totalEl) totalEl.textContent = formatMoney(subtotal);
//     return;
//   }

//   if (shipping === null) {
//     row.innerHTML = '';
//     const button = document.createElement('a');
//     button.href = 'https://wa.me/14696180809?text=' + encodeURIComponent('Hello Blegab, I need help with the shipping fee for my country.');
//     button.target = '_blank';
//     button.rel = 'noopener noreferrer';
//     button.className = 'checkout-contact-admin-btn';
//     button.textContent = 'Contact Admin for shipping fee';
//     row.appendChild(button);
//     if (totalEl) totalEl.textContent = formatMoney(subtotal);
//     return;
//   }

//   row.innerHTML = '<span>Shipping</span><span data-cart-summary-shipping>' + formatMoney(shipping) + '</span>';
//   if (totalEl) totalEl.textContent = formatMoney(Number(subtotal) + shipping);
// }

// /* -----------------------------
//    Main render — rebuilds the row list + summary numbers
//    ----------------------------- */
// async function renderCartPage() {
//   var listEl = document.querySelector("[data-cart-page-list]");
//   var emptyEl = document.querySelector("[data-cart-page-empty]");
//   var tableHead = document.querySelector(".cart-page__table-head");
//   var summaryEl = document.querySelector(".cart-page__summary");
//   var headingCountEl = document.querySelector("[data-cart-count-heading]");

//   if (!listEl) return;

//   try {
//     const response = await fetch(API_URL, {
//       method: "GET",
//       credentials: "include"
//     });

//     const data = await response.json();

//     if (!data.success) {
//       console.error(data.message);
//       return;
//     }
//     var items = data.cart?.items || [];
//     var itemCount = data.totalItems || 0;
//     var subtotal = data.subtotal || 0;

//     if (headingCountEl) {
//       headingCountEl.textContent = itemCount;
//     }

//     if (items.length === 0) {
//       listEl.innerHTML = "";
//       if (emptyEl) emptyEl.hidden = false;
//       if (tableHead) tableHead.style.display = "none";
//       if (summaryEl) summaryEl.hidden = true;
//       return;
//     }

//     if (emptyEl) emptyEl.hidden = true;
//     if (summaryEl) summaryEl.hidden = false;
//     if (tableHead) tableHead.style.display = "";

//     listEl.innerHTML = items.map(function (item) {

//       var product = item.product;

//       if (!product) {
//          return "";
//       }
//       var lineTotal = item.lineTotal;

//       var image = getCartProductImage(
//   product.images && product.images.length
//     ? product.images[0]
//     : ""
// );

//       return (
//         '<div class="cart-page__row" data-cart-page-row="' + product._id + '">' +

//           '<div class="cart-page__row-product">' +

//             '<a href="#" class="cart-page__row-image-link" data-open-product="' + product._id + '">' +

//               '<img src="' + image + '" alt="' + product.name + '" class="cart-page__row-image">' +

//             '</a>' +

//             '<div class="cart-page__row-info">' +

//               '<a href="#" class="cart-page__row-name" data-open-product="' + product._id + '">' +

//                 product.name +

//               '</a>' +

//               '<p class="cart-page__row-meta">Premium Human Hair</p>' +

//               '<span class="cart-page__row-mobile-price">' +

//                 formatMoney(product.price) +

//               '</span>' +

//             '</div>' +

//           '</div>' +

//           '<div class="cart-page__row-price">' +

//             formatMoney(product.price) +

//           '</div>' +

//           '<div class="cart-page__row-actions">' +

//             '<div class="cart-page__qty-stepper">' +

//               '<button type="button" class="cart-page__qty-btn" data-cart-page-decrease="' + product._id + '">&minus;</button>' +

//               '<input type="number" class="cart-page__qty-value" value="' + item.quantity + '" min="1" data-cart-page-qty-input="' + product._id + '">' +

//               '<button type="button" class="cart-page__qty-btn" data-cart-page-increase="' + product._id + '">+</button>' +

//               '<button type="button" class="cart-page__reset-btn" data-cart-page-reset="' + product._id + '">' +

//                 '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">' +

//                   '<path d="M21 12a9 9 0 1 1-3.4-7.02" stroke-linecap="round"/>' +

//                   '<path d="M21 3v5h-5" stroke-linecap="round" stroke-linejoin="round"/>' +

//                 '</svg>' +

//               '</button>' +

//             '</div>' +

//             '<button type="button" class="cart-page__row-delete" data-cart-page-remove="' + product._id + '">' +

//               '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">' +

//                 '<path d="M4 7h16M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2m2 0-1 13a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 7" stroke-linecap="round" stroke-linejoin="round"/>' +

//               '</svg>' +

//             '</button>' +

//             '<span class="cart-page__row-total">' +

//               formatMoney(lineTotal) +

//             '</span>' +

//           '</div>' +

//         '</div>'
//       );

//     }).join("");

//     var subtotalEl = document.querySelector("[data-summary-subtotal]");
// var totalEl = document.querySelector("[data-summary-total]");
// var countEl = document.querySelector("[data-summary-count]");
// var afterpayEl = document.querySelector("[data-summary-afterpay]");

// if (subtotalEl) {
//   subtotalEl.textContent = formatMoney(subtotal);
// }

// if (totalEl) {
//   totalEl.textContent = formatMoney(subtotal);
// }

// if (countEl) {
//   countEl.textContent = itemCount;
// }

// if (afterpayEl) {
//   afterpayEl.textContent = formatMoney(subtotal / 4);
// }


// // --------------------------------------------------
// // SHIPPING
// // Try to get the logged-in customer's country.
// // Guests will remain "Calculated at checkout"
// // until a country is selected during checkout.
// // --------------------------------------------------
// var shippingCountry = await getCartShippingCountry();

// renderCartShipping(subtotal, shippingCountry);

//   } catch (err) {
//     console.error("Failed to load cart:", err);
//   }
// }

// window.BLEGAB_RENDER_CART_PAGE = renderCartPage;

// /* -----------------------------
//    Qty +/- and delete — delegated, since rows are re-rendered
//    ----------------------------- */
// function initCartPageQtyAndDelete() {

//   document.addEventListener("click", async function (event) {

//     var decreaseBtn = event.target.closest("[data-cart-page-decrease]");
//     var increaseBtn = event.target.closest("[data-cart-page-increase]");
//     var removeBtn = event.target.closest("[data-cart-page-remove]");
//     var resetBtn = event.target.closest("[data-cart-page-reset]");

//     if (!decreaseBtn && !increaseBtn && !removeBtn && !resetBtn) return;

//     try {

//       // ------------------------
//       // Reset to quantity 1
//       // ------------------------
//       if (resetBtn) {

//        const updateResponse = await fetch(`${API_URL}/update/${resetBtn.dataset.cartPageReset}`,{
//             method: "PUT",
//             credentials: "include",
//             headers: {
//               "Content-Type": "application/json"
//             },
//             body: JSON.stringify({
//               quantity: 1
//             })
//           }
//         );

//         const updateData = await updateResponse.json();

//         if (!updateResponse.ok) {
//         alert(updateData.message);
//         return;
//         }

//         renderCartPage();

//         if (window.BLEGAB_CART) {
//           await window.BLEGAB_CART.renderBadge();
//           await window.BLEGAB_CART.renderDrawer();
//         }

//         return;

//       }

//       // ------------------------
//       // Decrease quantity
//       // ------------------------
//       if (decreaseBtn) {

//         var id = decreaseBtn.dataset.cartPageDecrease;

//         const cartRes = await fetch(API_URL, {
//           credentials: "include"
//         });

//         const cartData = await cartRes.json();

//         const item = cartData.cart.items.find(function (i) {
//           return i.product._id === id;
//         });

//         if (item && item.quantity > 1) {

//          const updateResponse = await fetch(`${API_URL}/update/${id}`, {
//             method: "PUT",
//             credentials: "include",
//             headers: {
//               "Content-Type": "application/json"
//             },
//             body: JSON.stringify({
//               quantity: item.quantity - 1
//             })
//           });

//           const updateData = await updateResponse.json();

//          if (!updateResponse.ok) {
//          alert(updateData.message);
//          return;
//         }

//         }

//         renderCartPage();

//         if (window.BLEGAB_CART) {
//           await window.BLEGAB_CART.renderBadge();
//           await window.BLEGAB_CART.renderDrawer();
//         }
//       }

//       // ------------------------
//       // Increase quantity
//       // ------------------------
//       if (increaseBtn) {

//         var id = increaseBtn.dataset.cartPageIncrease;

//         const cartRes = await fetch(API_URL, {
//           credentials: "include"
//         });

//         const cartData = await cartRes.json();

//         const item = cartData.cart.items.find(function (i) {
//           return i.product._id === id;
//         });

//         if (item) {

//          const updateResponse = await fetch(`${API_URL}/update/${id}`, {
//             method: "PUT",
//             credentials: "include",
//             headers: {
//               "Content-Type": "application/json"
//             },
//             body: JSON.stringify({
//               quantity: item.quantity + 1
//             })
//           });

//           const updateData = await updateResponse.json();

//          if (!updateResponse.ok) {
//          alert(updateData.message);
//          return;
//         }

//         }

//         renderCartPage();

//         if (window.BLEGAB_CART) {
//           await window.BLEGAB_CART.renderBadge();
//           await window.BLEGAB_CART.renderDrawer();
//         }
//       }

//       // ------------------------
//       // Remove item
//       // ------------------------
//       if (removeBtn) {

//        const removeResponse = await fetch(
//             `${API_URL}/remove/${removeBtn.dataset.cartPageRemove}`,
//           {
//             method: "DELETE",
//             credentials: "include"
//           }
//         );

//         const removeData = await removeResponse.json();

//         if (!removeResponse.ok) {
//         alert(removeData.message);
//         return;
//        }

//         renderCartPage();

//         if (window.BLEGAB_CART) {
//           await window.BLEGAB_CART.renderBadge();
//           await window.BLEGAB_CART.renderDrawer();
//         }
//       }

//     } catch (err) {
//       console.error(err);
//     }

//   });

//   // --------------------------------
//   // Manual quantity input
//   // --------------------------------
//   document.addEventListener("change", async function (event) {

//     var qtyInput = event.target.closest("[data-cart-page-qty-input]");

//     if (!qtyInput) return;

//     var id = qtyInput.dataset.cartPageQtyInput;

//     var newQty = parseInt(qtyInput.value, 10);

//     if (isNaN(newQty) || newQty < 1) {
//       newQty = 1;
//     }

//     qtyInput.value = newQty;

//     try {

//      const updateResponse = await fetch(`${API_URL}/update/${id}`, {
//         method: "PUT",
//         credentials: "include",
//         headers: {
//           "Content-Type": "application/json"
//         },
//         body: JSON.stringify({
//           quantity: newQty
//         })
//       });

//       const updateData = await updateResponse.json();

//       if (!updateResponse.ok) {
//       alert(updateData.message);
//       return;
//      }

//       renderCartPage();

//       if (window.BLEGAB_CART) {
//         await window.BLEGAB_CART.renderBadge();
//         await window.BLEGAB_CART.renderDrawer();
//       }

//     } catch (err) {
//       console.error(err);
//     }

//   });

// }

// /* -----------------------------
//    Product detail modal — same behavior as shop.html's version,
//    opened by clicking a cart row's product name
//    ----------------------------- */
// function initProductModal() {

//   var overlay = document.querySelector("[data-product-modal-overlay]");
//   var modal = document.querySelector("[data-product-modal]");

//   if (!overlay || !modal) return;

//   if (modal.dataset.modalInitialized) return;

//   modal.dataset.modalInitialized = "true";

//   document.addEventListener("click", async function (e) {

//     var trigger = e.target.closest("[data-open-product]");

//     if (trigger) {

//       e.preventDefault();

//       try {

//         const response = await fetch(API_URL, {
//           credentials: "include"
//         });

//         const data = await response.json();

//         const item = data.cart.items.find(function (item) {
//         return item.product && item.product._id === trigger.dataset.openProduct;
//         });

//         if (item) {
//           openModal(item.product);
//         }

//       } catch (err) {
//         console.error(err);
//       }

//     }

//     if (
//       e.target.closest("[data-product-modal-close]") ||
//       e.target === overlay
//     ) {
//       closeModal();
//     }

//   });

//   function openModal(product) {

//     modal.querySelector("[data-modal-name]").textContent = product.name;

//     modal.querySelector("[data-modal-price]").textContent =
//       formatMoney(product.price);

//     var image = getCartProductImage(
//   product.images && product.images.length
//     ? product.images[0]
//     : ""
// );

//     modal.querySelector("[data-modal-main-image]").src = image;

//     modal.querySelector("[data-modal-main-image]").alt = product.name;

//     var badge = modal.querySelector("[data-modal-badge]");

//     if (badge) {

//       badge.hidden = !product.badge;

//       if (product.badge) {
//         badge.textContent = product.badge;
//       }

//     }

//     modal.dataset.activeProduct = product._id;

//     // let qty = 1;

//     // modal.querySelector("[data-qty-value]").textContent = qty;

//     modal.classList.add("is-open");

//     overlay.classList.add("is-open");

//     document.body.style.overflow = "hidden";

//   }

//   function closeModal() {

//     modal.classList.remove("is-open");

//     overlay.classList.remove("is-open");

//     document.body.style.overflow = "";

//   }

//   modal.querySelectorAll("[data-option-group]").forEach(function (group) {

//     group.addEventListener("click", function (e) {

//       var pill = e.target.closest(".option-pill");

//       if (!pill) return;

//       group.querySelectorAll(".option-pill").forEach(function (p) {
//         p.classList.remove("is-active");
//       });

//       pill.classList.add("is-active");

//     });

//   });

// }

// /* -----------------------------
//    Newsletter form — same behavior as shop.html's version
//    ----------------------------- */
// function initNewsletterForm() {
//   var form = document.querySelector('[data-newsletter-form]');
//   if (!form) return;

//   var input = form.querySelector('.newsletter__input');
//   var errorEl = form.querySelector('[data-newsletter-error]');

//   form.addEventListener('submit', function (event) {
//     event.preventDefault();

//     input.classList.remove('is-error');
//     errorEl.classList.remove('is-visible');
//     errorEl.textContent = '';

//     var email = input.value.trim();

//     if (!email) {
//       showError('Please enter your email address');
//       return;
//     }

//     if (!isValidEmail(email)) {
//       showError('Please enter a valid email address');
//       return;
//     }

//     alert('Thanks for subscribing!');
//     form.reset();
//   });

//   input.addEventListener('input', function () {
//     if (input.classList.contains('is-error')) {
//       input.classList.remove('is-error');
//       errorEl.classList.remove('is-visible');
//       errorEl.textContent = '';
//     }
//   });

//   function showError(message) {
//     input.classList.add('is-error');
//     errorEl.textContent = message;
//     errorEl.offsetHeight;
//     errorEl.classList.add('is-visible');
//     input.focus();
//   }

//   function isValidEmail(email) {
//     return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
//   }
// }


/* =========================================================
   CART PAGE JS
   Renders the cart table/cards + order summary from
   window.BLEGAB_CART (main.js) + window.BLEGAB_SHOP_PRODUCTS
   (Product-data.js). Also drives the shared product detail
   modal (same markup/behavior as shop.html) and the
   newsletter form.
   ========================================================= */
const API_URL = "https://api.blegab.com/api/cart";

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

function getCartProductImage(image) {
  if (!image) {
    return "/assets/images/placeholder.png";
  }

  var value = String(image).trim();

  if (!value) {
    return "/assets/images/placeholder.png";
  }

  // Full URL — Cloudinary or another remote image
  if (/^https?:\/\//i.test(value)) {
    return value;
  }

  // Backend-relative path
  if (value.startsWith("/")) {
    return "https://api.blegab.com" + value;
  }

  // Existing frontend asset path
  if (value.startsWith("assets/")) {
    return "/" + value;
  }

  // Bare filename returned by backend
  return "https://api.blegab.com/assets/images/products/" + value;
}

// function formatQtyDisplay(num) {
//   if (num >= 1e9) return (num / 1e9).toFixed(1).replace(/\.0$/, '') + 'B';
//   if (num >= 1e6) return (num / 1e6).toFixed(1).replace(/\.0$/, '') + 'M';
//   if (num >= 1e3) return (num / 1e3).toFixed(1).replace(/\.0$/, '') + 'K';
//   return num.toString();
// }


/* =========================================================
   CART PAGE SHIPPING RULES
   ========================================================= */
 const CART_SHIPPING_RATES = {
   'United States': 20,
   'Canada': 30,
   'Nigeria': 50,
   'United Kingdom': 50
 };

// Countries + subtotal threshold that qualify for free shipping.
// Must stay in sync with services/shippingService.js on the backend:
// US/Canada orders with a subtotal ABOVE (not equal to) $500 ship free.
const CART_FREE_SHIPPING_COUNTRIES = ['United States', 'Canada'];
const CART_FREE_SHIPPING_THRESHOLD = 500;

function cartShippingForCountry(country, subtotal) {
  const key = String(country || '').trim();

  if (!Object.prototype.hasOwnProperty.call(CART_SHIPPING_RATES, key)) {
    return null;
  }

  const freeShippingApplied =
    CART_FREE_SHIPPING_COUNTRIES.includes(key) &&
    Number(subtotal || 0) > CART_FREE_SHIPPING_THRESHOLD;

  return {
    cost: freeShippingApplied ? 0 : CART_SHIPPING_RATES[key],
    freeShippingApplied
  };
}

async function getCartShippingCountry() {

  /*
   * -------------------------------------------------------
   * 1. Try the authenticated user's saved country first.
   * -------------------------------------------------------
   */

  try {

    const response = await fetch(
      'https://api.blegab.com/api/auth/me',
      {
        method: 'GET',
        credentials: 'include'
      }
    );

    if (response.ok) {

      const data = await response.json();

      const user = data.user || null;

      const loggedInCountry =
        user?.address?.country ||
        user?.country ||
        '';

      if (loggedInCountry) {
        return loggedInCountry;
      }
    }

  } catch (error) {

    console.warn(
      'Unable to load logged-in customer country:',
      error
    );
  }


  /*
   * -------------------------------------------------------
   * 2. If customer is a guest, use the country selected
   *    during checkout.
   * -------------------------------------------------------
   */

  try {

    const guestCountry =
      sessionStorage.getItem('blegab_checkout_country');

    if (guestCountry) {
      return guestCountry;
    }

  } catch (error) {

    console.warn(
      'Unable to read checkout country:',
      error
    );
  }


  /*
   * -------------------------------------------------------
   * 3. No country available yet.
   * -------------------------------------------------------
   */

  return '';
}

function renderCartShipping(subtotal, country) {
  const row = document.querySelector('[data-cart-summary-shipping-row]');
  const totalEl = document.querySelector('[data-summary-total]');
  const shipping = cartShippingForCountry(country, subtotal);

  if (!row) return;

  if (!country) {
    row.innerHTML = '<span>Shipping</span><span data-cart-summary-shipping>Calculated at checkout</span>';
    if (totalEl) totalEl.textContent = formatMoney(subtotal);
    return;
  }

  if (shipping === null) {
    row.innerHTML = '';
    const button = document.createElement('a');
    button.href = 'https://wa.me/14696180809?text=' + encodeURIComponent('Hello Blegab, I need help with the shipping fee for my country.');
    button.target = '_blank';
    button.rel = 'noopener noreferrer';
    button.className = 'checkout-contact-admin-btn';
    button.textContent = 'Contact Admin for shipping fee';
    row.appendChild(button);
    if (totalEl) totalEl.textContent = formatMoney(subtotal);
    return;
  }

  const shippingText = shipping.freeShippingApplied ? 'Free' : formatMoney(shipping.cost);
  const shippingClass = shipping.freeShippingApplied ? ' class="cart-page__summary-free"' : '';
  row.innerHTML = '<span>Shipping</span><span data-cart-summary-shipping' + shippingClass + '>' + shippingText + '</span>';
  if (totalEl) totalEl.textContent = formatMoney(Number(subtotal) + shipping.cost);
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

      var image = getCartProductImage(
  product.images && product.images.length
    ? product.images[0]
    : ""
);

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

if (subtotalEl) {
  subtotalEl.textContent = formatMoney(subtotal);
}

if (totalEl) {
  totalEl.textContent = formatMoney(subtotal);
}

if (countEl) {
  countEl.textContent = itemCount;
}

if (afterpayEl) {
  afterpayEl.textContent = formatMoney(subtotal / 4);
}


// --------------------------------------------------
// SHIPPING
// Try to get the logged-in customer's country.
// Guests will remain "Calculated at checkout"
// until a country is selected during checkout.
// --------------------------------------------------
var shippingCountry = await getCartShippingCountry();

renderCartShipping(subtotal, shippingCountry);

  } catch (err) {
    console.error("Failed to load cart:", err);
  }
}

window.BLEGAB_RENDER_CART_PAGE = renderCartPage;

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

  if (modal.dataset.modalInitialized) return;

  modal.dataset.modalInitialized = "true";

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

    var image = getCartProductImage(
  product.images && product.images.length
    ? product.images[0]
    : ""
);

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

    // let qty = 1;

    // modal.querySelector("[data-qty-value]").textContent = qty;

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