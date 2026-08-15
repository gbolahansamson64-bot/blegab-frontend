const CART_API = "https://backend-6j62.onrender.com/api/cart";
const BACKEND_URL = "https://backend-6j62.onrender.com";


// =========================================================
// CART COUNT
// =========================================================

async function loadCartCount() {

  try {

    const res = await fetch(`${CART_API}/count`, {
      credentials: "include"
    });

    if (!res.ok) {
      updateCartCount(0);
      return;
    }

    const data = await res.json();

    updateCartCount(data.count || 0);

  } catch (err) {

    console.error("Cart count error:", err);

    updateCartCount(0);
  }
}


function updateCartCount(count) {

  document
    .querySelectorAll("[data-cart-count]")
    .forEach(el => {

      el.textContent = count;

    });
}



// =========================================================
// PRODUCT IMAGE URL
// =========================================================

function getCartProductImage(product) {

  if (
    !product ||
    !Array.isArray(product.images) ||
    product.images.length === 0
  ) {
    return "assets/images/no-image.webp";
  }

  const image = product.images[0];

  if (!image) {
    return "assets/images/no-image.webp";
  }

  // Fix malformed Cloudinary URLs
  const normalizedImage = image.replace(/^https\/\//, "https://");

  // Complete URL
  if (
    normalizedImage.startsWith("http://") ||
    normalizedImage.startsWith("https://")
  ) {
    return normalizedImage;
  }

  // Backend image path
  if (normalizedImage.startsWith("/")) {
    return BACKEND_URL + normalizedImage;
  }

  return BACKEND_URL + "/" + normalizedImage;
}



// =========================================================
// LOAD MINI CART
// =========================================================

async function loadMiniCart() {

  try {

    const res = await fetch(CART_API, {
      credentials: "include"
    });

    if (!res.ok) {

      console.error(
        "Unable to load cart:",
        res.status
      );

      return;
    }

    const data = await res.json();

    console.log("MINI CART DATA:", data);

    renderMiniCart(data);

  } catch (err) {

    console.error(
      "Mini cart error:",
      err
    );
  }
}



// =========================================================
// RENDER MINI CART
// =========================================================

function renderMiniCart(data) {

  const body = document.querySelector(
    ".cart-drawer__body"
  );

  if (!body) return;


  // -------------------------------------------------------
  // EMPTY CART
  // -------------------------------------------------------

  if (
    !data.cart ||
    !Array.isArray(data.cart.items) ||
    data.cart.items.length === 0
  ) {

    body.innerHTML = `
      <p class="cart-drawer__empty">
        Your cart is empty
      </p>
    `;

    updateCartCount(0);

    return;
  }


  // Clear existing items

  body.innerHTML = "";


  // -------------------------------------------------------
  // RENDER EACH CART ITEM
  // -------------------------------------------------------

  data.cart.items.forEach(item => {

    const product = item.product;

    if (!product) return;


    // Get correct image URL
   const image = getCartProductImage(product);


    /*
     * IMPORTANT:
     *
     * We are using the ORIGINAL classes from your
     * cart drawer CSS.
     *
     * DO NOT change these to mini-cart-item classes.
     */

    const cartItem = document.createElement("div");

    cartItem.className = "cart-drawer__item";


    cartItem.innerHTML = `

      <a
        href="#"
        class="cart-drawer__item-image-link"
        data-open-product="${product._id}"
      >

        <img
          src="${image}"
          alt="${product.name || "Product"}"
          class="cart-drawer__item-image"
        >

      </a>


      <div class="cart-drawer__item-info">

        <a
          href="#"
          class="cart-drawer__item-name"
          data-open-product="${product._id}"
        >
          ${product.name || "Product"}
        </a>


        <span class="cart-drawer__item-price">
          $${Number(product.price || 0).toFixed(2)}
        </span>


        <div class="cart-drawer__item-qty">

          <button
            type="button"
            class="cart-drawer__qty-btn"
            data-cart-decrease="${product._id}"
          >
            &minus;
          </button>


          <span class="cart-drawer__qty-value">
            ${item.quantity}
          </span>


          <button
            type="button"
            class="cart-drawer__qty-btn"
            data-cart-increase="${product._id}"
          >
            +
          </button>

        </div>

      </div>


      <div class="cart-drawer__item-actions">

        <button
          type="button"
          class="cart-drawer__item-delete"
          data-cart-remove="${product._id}"
        >

          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >

            <path
              d="M6 6l12 12M18 6L6 18"
              stroke-linecap="round"
            />

          </svg>

        </button>


        <button
          type="button"
          class="cart-drawer__item-add"
          data-cart-add="${product._id}"
        >

          <span class="cart-drawer__item-add-text">
            View
          </span>


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
              />

            </svg>

          </span>

        </button>

      </div>

    `;


    // -------------------------------------------------------
    // IMAGE FALLBACK
    // -------------------------------------------------------

    const img = cartItem.querySelector(
      ".cart-drawer__item-image"
    );

    if (img) {

      img.onerror = function () {

        console.error(
          "Cart image failed:",
          this.src
        );

        this.onerror = null;

        this.src =
          "assets/images/no-image.webp";
      };
    }


    // Add item to drawer

    body.appendChild(cartItem);

  });


  // Update cart badge

  updateCartCount(
    data.totalItems || 0
  );
}



// =========================================================
// INITIAL LOAD
// =========================================================

// document.addEventListener(
//   "DOMContentLoaded",
//   function () {

//     loadCartCount();

//     loadMiniCart();

//   }
// );

// =========================================================
// INITIAL LOAD
// =========================================================

document.addEventListener("DOMContentLoaded", function () {
  loadCartCount();
});