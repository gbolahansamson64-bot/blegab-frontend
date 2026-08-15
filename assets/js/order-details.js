const API_URL = "https://backend-6j62.onrender.com/api";


// =========================================================
// GET ORDER ID FROM URL
// =========================================================

const params = new URLSearchParams(
    window.location.search
);

const orderId = params.get("orderId");


// =========================================================
// DOM ELEMENTS
// =========================================================

const loading =
    document.getElementById(
        "order-details-loading"
    );

const errorContainer =
    document.getElementById(
        "order-details-error"
    );

const errorMessage =
    document.getElementById(
        "order-details-error-message"
    );

const content =
    document.getElementById(
        "order-details-content"
    );


// =========================================================
// FORMAT CURRENCY
// =========================================================

function formatCurrency(amount) {

    const value = Number(amount) || 0;

    return `$${value.toFixed(2)}`;

}


// =========================================================
// FORMAT DATE
// =========================================================

function formatDate(dateString) {

    if (!dateString) {

        return "Date unavailable";

    }

    const date =
        new Date(dateString);


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return "Date unavailable";

    }


    return date.toLocaleDateString(
        "en-US",
        {
            year: "numeric",
            month: "long",
            day: "numeric"
        }
    );

}


// =========================================================
// ESCAPE HTML
// =========================================================

function escapeHTML(value) {

    return String(value)

        .replace(
            /&/g,
            "&amp;"
        )

        .replace(
            /</g,
            "&lt;"
        )

        .replace(
            />/g,
            "&gt;"
        )

        .replace(
            /"/g,
            "&quot;"
        )

        .replace(
            /'/g,
            "&#039;"
        );

}


// =========================================================
// NORMALIZE STATUS
// =========================================================

function normalizeStatus(status) {

    if (!status) {

        return "";

    }

    return status
        .toLowerCase()
        .replace(/\s+/g, "-");

}


// =========================================================
// CREATE STATUS BADGE
// =========================================================

function createStatusBadge(
    status,
    type
) {

    const normalized =
        normalizeStatus(status);


    let className =
        "order-status";


    if (
        type === "payment" &&
        normalized === "paid"
    ) {

        className +=
            " order-status--paid";

    }


    if (type === "order") {

        if (
            normalized === "processing"
        ) {

            className +=
                " order-status--processing";

        }

        else if (
            normalized === "shipped"
        ) {

            className +=
                " order-status--shipped";

        }

        else if (
            normalized === "delivered"
        ) {

            className +=
                " order-status--delivered";

        }

        else if (
            normalized === "cancelled"
        ) {

            className +=
                " order-status--cancelled";

        }

    }


    return `
        <span class="${className}">
            ${escapeHTML(status || "Unknown")}
        </span>
    `;

}


// =========================================================
// GET SINGLE ORDER
// =========================================================

async function getOrder() {

    if (!orderId) {

        throw new Error(
            "No order ID was provided."
        );

    }


    const response =
        await fetch(
            `${API_URL}/orders/${encodeURIComponent(orderId)}`,
            {
                method: "GET",
                credentials: "include"
            }
        );


    const data =
        await response.json();


    if (!response.ok) {

        throw new Error(
            data.message ||
            "Unable to load order."
        );

    }


    return data.order;

}


// =========================================================
// DISPLAY ORDER ITEMS
// =========================================================

function displayOrderItems(
    items
) {

    const container =
        document.getElementById(
            "order-items"
        );


    if (
        !Array.isArray(items) ||
        items.length === 0
    ) {

        container.innerHTML = `
            <p>
                No items found for this order.
            </p>
        `;

        return;

    }


    container.innerHTML =
        items.map(item => {

            const image =
                item.image ||
                "assets/images/placeholder.jpg";


            const quantity =
                Number(item.quantity) || 0;


            const price =
                Number(item.price) || 0;


            return `

                <div class="order-details-item">

                    <img
                        src="${escapeHTML(image)}"
                        alt="${escapeHTML(
                            item.name || "Product"
                        )}"
                        class="order-details-item__image"
                        onerror="
                            this.src='assets/images/placeholder.jpg'
                        "
                    >


                    <div class="order-details-item__info">

                        <h3>
                            ${escapeHTML(
                                item.name || "Product"
                            )}
                        </h3>


                        <p>
                            Quantity: ${quantity}
                        </p>


                        <p>
                            Unit Price:
                            ${formatCurrency(price)}
                        </p>

                    </div>


                    <strong>
                        ${formatCurrency(
                            price * quantity
                        )}
                    </strong>

                </div>

            `;

        }).join("");

}


// =========================================================
// DISPLAY SHIPPING ADDRESS
// =========================================================

function displayShippingAddress(
    address
) {

    const container =
        document.getElementById(
            "shipping-address"
        );


    if (!address) {

        container.innerHTML = `
            <p>
                Shipping information unavailable.
            </p>
        `;

        return;

    }


    container.innerHTML = `

        <p>
            <strong>
                ${escapeHTML(
                    address.firstName || ""
                )}
                ${escapeHTML(
                    address.lastName || ""
                )}
            </strong>
        </p>


        <p>
            ${escapeHTML(
                address.address || ""
            )}
        </p>


        <p>
            ${escapeHTML(
                address.city || ""
            )},
            ${escapeHTML(
                address.state || ""
            )}
        </p>


        <p>
            ${escapeHTML(
                address.country || ""
            )}
            ${address.postalCode
                ? `, ${escapeHTML(
                    address.postalCode
                )}`
                : ""
            }
        </p>


        ${
            address.phone
                ? `
                    <p>
                        Phone:
                        ${escapeHTML(
                            address.phone
                        )}
                    </p>
                `
                : ""
        }

    `;

}


// =========================================================
// DISPLAY ORDER
// =========================================================

function displayOrder(order) {

    if (!order) {

        throw new Error(
            "Order information was not returned."
        );

    }


    // -----------------------------------------
    // Header
    // -----------------------------------------

    document.getElementById(
        "order-id"
    ).textContent =
        `Order #${order._id}`;


    document.getElementById(
        "order-date"
    ).textContent =
        formatDate(order.createdAt);


    document.getElementById(
        "order-statuses"
    ).innerHTML = `

        ${createStatusBadge(
            order.paymentStatus,
            "payment"
        )}

        ${createStatusBadge(
            order.orderStatus,
            "order"
        )}

    `;


    // -----------------------------------------
    // Items
    // -----------------------------------------

    displayOrderItems(
        order.orderItems
    );


    // -----------------------------------------
    // Summary
    // -----------------------------------------

    document.getElementById(
        "order-subtotal"
    ).textContent =
        formatCurrency(
            order.subtotal
        );


    document.getElementById(
        "order-shipping"
    ).textContent =
        formatCurrency(
            order.shippingFee
        );


    document.getElementById(
        "order-tax"
    ).textContent =
        formatCurrency(
            order.tax
        );


    document.getElementById(
        "order-total"
    ).textContent =
        formatCurrency(
            order.total
        );


    // -----------------------------------------
    // Shipping
    // -----------------------------------------

    displayShippingAddress(
        order.shippingAddress
    );


    // -----------------------------------------
    // Payment
    // -----------------------------------------

    document.getElementById(
        "payment-method"
    ).textContent =
        order.paymentMethod || "N/A";


    document.getElementById(
        "payment-status"
    ).innerHTML =
        createStatusBadge(
            order.paymentStatus,
            "payment"
        );


    document.getElementById(
        "order-status"
    ).innerHTML =
        createStatusBadge(
            order.orderStatus,
            "order"
        );


    // -----------------------------------------
    // Show page
    // -----------------------------------------

    loading.style.display =
        "none";

    errorContainer.style.display =
        "none";

    content.style.display =
        "block";

}


// =========================================================
// SHOW ERROR
// =========================================================

function showError(message) {

    loading.style.display =
        "none";

    content.style.display =
        "none";

    errorContainer.style.display =
        "block";


    errorMessage.textContent =
        message;

}


// =========================================================
// INITIALIZE
// =========================================================

async function initializeOrderDetails() {

    try {

        loading.style.display =
            "block";


        const order =
            await getOrder();


        displayOrder(order);


    } catch (error) {

        console.error(
            "LOAD ORDER DETAILS ERROR:",
            error
        );


        if (
            error.message
                .toLowerCase()
                .includes("authorized")
        ) {

            showError(
                "Please log in to view this order."
            );

        } else {

            showError(
                error.message ||
                "Unable to load order details."
            );

        }

    }

}


document.addEventListener(
    "DOMContentLoaded",
    initializeOrderDetails
);