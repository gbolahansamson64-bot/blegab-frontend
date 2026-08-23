/* =========================================================
   ORDER CONFIRMATION PAGE JS
   Displays the REAL order created by the backend.
   ========================================================= */

const API_URL = "https://api.blegab.com/api";

document.addEventListener("DOMContentLoaded", function () {
    initFaqAccordion();
    loadOrderConfirmation();
});


/* =========================================================
   LOAD ORDER CONFIRMATION
   ========================================================= */

async function loadOrderConfirmation() {

    try {

        const orderData =
            sessionStorage.getItem("lastOrderData");

        /*
         * The success page should save the REAL order here
         * before redirecting to this page.
         */

        if (!orderData) {

            console.error(
                "No real order data found in sessionStorage."
            );

            showOrderError(
                "Your order was created successfully, but the order details could not be loaded."
            );

            return;
        }


        const order =
            JSON.parse(orderData);


        console.log(
            "REAL ORDER LOADED:",
            order
        );


        displayConfirmation(order);


        /*
         * Remove it after displaying it so that
         * an old order is not accidentally reused.
         */

        sessionStorage.removeItem(
            "lastOrderData"
        );


    } catch (error) {

        console.error(
            "ERROR LOADING ORDER CONFIRMATION:",
            error
        );

        showOrderError(
            "Unable to load your order details."
        );

    }

}


/* =========================================================
   DISPLAY REAL ORDER
   ========================================================= */

function displayConfirmation(order) {

    if (!order) {

        showOrderError(
            "Order information could not be loaded."
        );

        return;
    }


    /* =====================================================
       ORDER ID
       ===================================================== */

    const orderId =
        document.getElementById(
            "confirmation-order-id"
        );

    if (orderId) {

        orderId.textContent =
            order._id ||
            order.id ||
            order.orderId ||
            "--";

    }


    /* =====================================================
       EMAIL
       ===================================================== */

    const email =
        document.getElementById(
            "confirmation-email"
        );

    if (email) {

        email.textContent =
            order.customerEmail ||
            order.email ||
            "your email";

    }


    /* =====================================================
       ITEMS
       ===================================================== */

    const itemsList =
        document.getElementById(
            "confirmation-items-list"
        );


    const items =
        order.orderItems ||
        order.items ||
        [];


    if (itemsList) {

        if (items.length === 0) {

            itemsList.innerHTML = `
                <p>No order items found.</p>
            `;

        } else {

            itemsList.innerHTML =
                items.map(item => {

                    let image =
                        item.image || "";

                    /*
                     * Convert backend relative image
                     * paths into localhost backend URLs.
                     */

                    if (
                        image &&
                        !image.startsWith("http://") &&
                        !image.startsWith("https://") &&
                        !image.startsWith("data:")
                    ) {

                        image =
                            `${API_URL.replace(
                                "/api",
                                ""
                            )}${image.startsWith("/") ? "" : "/"}${image}`;

                    }


                    const itemTotal =
                        Number(item.price || 0) *
                        Number(item.quantity || 0);


                    return `

                        <div class="confirmation-item">

                            ${
                                image
                                    ? `
                                        <div class="confirmation-item__image">

                                            <img
                                                src="${image}"
                                                alt="${item.name || "Product"}"
                                            />

                                        </div>
                                      `
                                    : ""
                            }


                            <div class="confirmation-item__details">

                                <p class="confirmation-item__name">
                                    ${item.name || "Product"}
                                </p>

                                ${
                                    item.variant
                                        ? `
                                            <p class="confirmation-item__variant">
                                                ${item.variant}
                                            </p>
                                          `
                                        : ""
                                }

                            </div>


                            <div class="confirmation-item__qty">

                                <span class="confirmation-item__qty-label">

                                    Qty:
                                    ${item.quantity || 0}

                                </span>

                            </div>


                            <div class="confirmation-item__price">

                                $${itemTotal.toFixed(2)}

                            </div>

                        </div>

                    `;

                }).join("");

        }

    }


    /* =====================================================
       SUBTOTAL
       ===================================================== */

    const subtotal =
        document.getElementById(
            "confirmation-subtotal"
        );

    if (subtotal) {

        subtotal.textContent =
            `$${Number(
                order.subtotal || 0
            ).toFixed(2)}`;

    }


    /* =====================================================
       SHIPPING
       ===================================================== */

    const shipping =
        document.getElementById(
            "confirmation-shipping"
        );

    if (shipping) {

        const shippingFee =
            Number(
                order.shippingFee ??
                order.shippingCost ??
                0
            );


        shipping.textContent =
            shippingFee === 0
                ? "FREE"
                : `$${shippingFee.toFixed(2)}`;

    }


    /* =====================================================
       TOTAL
       ===================================================== */

    const total =
        document.getElementById(
            "confirmation-total"
        );

    if (total) {

        total.textContent =
            `$${Number(
                order.total ||
                order.totalAmount ||
                0
            ).toFixed(2)}`;

    }


    /* =====================================================
       SHIPPING ADDRESS
       ===================================================== */

    const address =
        document.getElementById(
            "confirmation-address"
        );


    if (
        address &&
        order.shippingAddress
    ) {

        const addr =
            order.shippingAddress;


        const firstName =
            addr.firstName || "";


        const lastName =
            addr.lastName || "";


        const street =
            addr.address ||
            addr.street ||
            "";


        address.innerHTML = `

            ${
                firstName || lastName
                    ? `${firstName} ${lastName}<br>`
                    : ""
            }

            ${street}<br>

            ${addr.city || ""}${
                addr.city && addr.state
                    ? ", "
                    : ""
            }${addr.state || ""}

            ${
                addr.postalCode
                    ? ` ${addr.postalCode}`
                    : ""
            }

            <br>

            ${addr.country || ""}

        `;

    }


    /* =====================================================
       DELIVERY DATE
       ===================================================== */

    const deliveryDate =
        document.getElementById(
            "confirmation-delivery-date-value"
        );


    if (deliveryDate) {

        if (order.estimatedDeliveryDate) {

            deliveryDate.textContent =
                order.estimatedDeliveryDate;

        } else {

            deliveryDate.textContent =
                "Coming soon";

        }

    }


    /* =====================================================
       PAYMENT METHOD
       ===================================================== */

    const paymentMethod =
        document.getElementById(
            "confirmation-payment-method"
        );


    if (paymentMethod) {

        let methodText = "Card";


        if (
            order.paymentMethod ===
            "google_pay"
        ) {

            methodText = "Google Pay";

        }


        if (
            order.paymentMethod ===
            "apple_pay"
        ) {

            methodText = "Apple Pay";

        }


        if (
            order.paymentMethod ===
            "afterpay"
        ) {

            methodText = "Afterpay";

        }


        const last4 =
            order.cardLast4 ||
            order.paymentLast4 ||
            "";


        paymentMethod.textContent =
            last4
                ? `${methodText} Ending in ${last4}`
                : methodText;

    }


    /* =====================================================
       TRACKING NUMBER
       ===================================================== */

    const trackingNumber =
        document.getElementById(
            "confirmation-tracking-number"
        );


    if (trackingNumber) {

        trackingNumber.textContent =
            order.trackingNumber ||
            "Coming soon in your email";

    }


    /* =====================================================
       TRACK ORDER LINK
       ===================================================== */

    const trackOrderLink =
        document.getElementById(
            "track-order-link"
        );


    if (trackOrderLink) {

        const realOrderId =
            order._id ||
            order.id ||
            order.orderId ||
            "";


        if (realOrderId) {

    const customerEmail =
        order.customerEmail ||
        order.email ||
        "";

    if (customerEmail) {

        sessionStorage.setItem(
            "trackingOrderId",
            realOrderId
        );

        sessionStorage.setItem(
            "trackingEmail",
            customerEmail
        );

    }

    trackOrderLink.href =
        `order-tracking.html?orderId=${encodeURIComponent(
            realOrderId
        )}`;

}

    }

}


/* =========================================================
   ERROR DISPLAY
   ========================================================= */

function showOrderError(message) {

    const container =
        document.querySelector(
            ".order-confirmation__container"
        );


    if (!container) {
        return;
    }


    const existingError =
        document.getElementById(
            "order-confirmation-error"
        );


    if (existingError) {
        existingError.remove();
    }


    const errorElement =
        document.createElement("div");


    errorElement.id =
        "order-confirmation-error";


    errorElement.style.cssText = `
        margin: 30px auto;
        padding: 20px;
        max-width: 600px;
        text-align: center;
        color: #721c24;
        background: #f8d7da;
        border: 1px solid #f5c6cb;
        border-radius: 8px;
    `;


    errorElement.innerHTML = `
        <p>${message}</p>

        <p>
            Please check your email for your
            order confirmation.
        </p>
    `;


    container.prepend(
        errorElement
    );

}


/* =========================================================
   FAQ ACCORDION
   ========================================================= */

function initFaqAccordion() {

    const toggles =
        document.querySelectorAll(
            "[data-faq-toggle]"
        );


    toggles.forEach(toggle => {

        toggle.addEventListener(
            "click",
            function () {

                const item =
                    this.closest(".faq-item");


                const answer =
                    item.querySelector(
                        ".faq-answer"
                    );


                document
                    .querySelectorAll(".faq-item")
                    .forEach(otherItem => {

                        if (
                            otherItem !== item
                        ) {

                            otherItem.classList.remove(
                                "is-open"
                            );


                            otherItem
                                .querySelector(
                                    ".faq-answer"
                                )
                                .setAttribute(
                                    "hidden",
                                    ""
                                );

                        }

                    });


                const isOpen =
                    item.classList.toggle(
                        "is-open"
                    );


                if (isOpen) {

                    answer.removeAttribute(
                        "hidden"
                    );

                } else {

                    answer.setAttribute(
                        "hidden",
                        ""
                    );

                }

            }
        );

    });

}


/* =========================================================
   SAVE ORDER TO SESSION
   ========================================================= */

function saveOrderToSession(order) {

    if (!order) {

        console.error(
            "Cannot save empty order."
        );

        return;

    }


    sessionStorage.setItem(
        "lastOrderData",
        JSON.stringify(order)
    );

}


/* =========================================================
   EXPORT
   ========================================================= */

window.OrderConfirmation = {

    displayConfirmation,

    saveOrderToSession,

    loadOrderConfirmation

};