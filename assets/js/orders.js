const API_URL = "https://backend-6j62.onrender.com/api";


// =========================================================
// DOM ELEMENTS
// =========================================================

const ordersLoading = document.getElementById("orders-loading");
const ordersError = document.getElementById("orders-error");
const ordersErrorMessage = document.getElementById(
    "orders-error-message"
);
const ordersEmpty = document.getElementById("orders-empty");
const ordersList = document.getElementById("orders-list");


// =========================================================
// GET CUSTOMER ORDERS
// =========================================================

async function getMyOrders() {

    const response = await fetch(
        `${API_URL}/orders/my-orders`,
        {
            method: "GET",
            credentials: "include"
        }
    );


    const data = await response.json();


    if (!response.ok) {

        throw new Error(
            data.message || "Unable to load your orders."
        );

    }


    return data.orders || [];

}


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


    const date = new Date(dateString);


    if (Number.isNaN(date.getTime())) {
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
// SHORTEN ORDER ID
// =========================================================

function formatOrderId(orderId) {

    if (!orderId) {
        return "Unknown";
    }


    return orderId.length > 12
        ? `${orderId.substring(0, 12)}...`
        : orderId;

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

    const normalizedStatus =
        normalizeStatus(status);


    let className =
        "order-status";


    if (type === "payment") {

        if (
            normalizedStatus === "paid"
        ) {

            className +=
                " order-status--paid";

        }

    }


    if (type === "order") {

        if (
            normalizedStatus === "processing"
        ) {

            className +=
                " order-status--processing";

        }

        else if (
            normalizedStatus === "shipped"
        ) {

            className +=
                " order-status--shipped";

        }

        else if (
            normalizedStatus === "delivered"
        ) {

            className +=
                " order-status--delivered";

        }

        else if (
            normalizedStatus === "cancelled"
        ) {

            className +=
                " order-status--cancelled";

        }

    }


    return `

        <span class="${className}">

            ${status || "Unknown"}

        </span>

    `;

}


// =========================================================
// CREATE ORDER ITEM
// =========================================================

function createOrderItem(item) {

    const image =
        item.image ||
        "assets/images/placeholder.jpg";


    const quantity =
        Number(item.quantity) || 0;


    const price =
        Number(item.price) || 0;


    return `

        <div class="order-item">

            <img
                src="${image}"
                alt="${escapeHTML(item.name || "Product")}"
                class="order-item__image"
                onerror="this.src='assets/images/placeholder.jpg'"
            >


            <div class="order-item__info">

                <h3 class="order-item__name">

                    ${escapeHTML(
                        item.name || "Product"
                    )}

                </h3>


                <p class="order-item__quantity">

                    Quantity: ${quantity}

                </p>

            </div>


            <div class="order-item__price">

                ${formatCurrency(
                    price * quantity
                )}

            </div>

        </div>

    `;

}


// =========================================================
// CREATE ORDER CARD
// =========================================================

function createOrderCard(order) {

    const items =
        Array.isArray(order.orderItems)
            ? order.orderItems
            : [];


    const itemsHTML =
        items
            .map(createOrderItem)
            .join("");


    const canCancel =
        order.orderStatus !== "Shipped" &&
        order.orderStatus !== "Delivered" &&
        order.orderStatus !== "Cancelled";


    return `

        <article
            class="order-card"
            data-order-id="${order._id}"
        >


            <!-- ORDER HEADER -->

            <div class="order-card__header">

                <div>

                    <p class="order-card__id">

                        Order #${formatOrderId(
                            order._id
                        )}

                    </p>


                    <p class="order-card__date">

                        ${formatDate(
                            order.createdAt
                        )}

                    </p>

                </div>


                <div class="order-statuses">

                    ${createStatusBadge(
                        order.paymentStatus,
                        "payment"
                    )}


                    ${createStatusBadge(
                        order.orderStatus,
                        "order"
                    )}

                </div>

            </div>


            <!-- ORDER ITEMS -->

            <div class="order-card__items">

                ${itemsHTML}

            </div>


            <!-- ORDER FOOTER -->

            <div class="order-card__footer">


                <div class="order-total">

                    <span class="order-total__label">

                        Total

                    </span>


                    <span class="order-total__amount">

                        ${formatCurrency(
                            order.total
                        )}

                    </span>

                </div>


                <div class="order-actions">


                    <button
                        type="button"
                        class="order-action order-action--view"
                        data-action="view"
                        data-order-id="${order._id}"
                    >

                        View Order

                    </button>


                    ${
                        canCancel
                            ? `

                                <button
                                    type="button"
                                    class="order-action order-action--cancel"
                                    data-action="cancel"
                                    data-order-id="${order._id}"
                                >

                                    Cancel Order

                                </button>

                            `
                            : ""
                    }


                </div>


            </div>


        </article>

    `;

}


// =========================================================
// RENDER ORDERS
// =========================================================

function renderOrders(orders) {

    if (!orders || orders.length === 0) {

        ordersEmpty.style.display = "block";

        ordersList.innerHTML = "";

        return;

    }


    ordersEmpty.style.display = "none";


    ordersList.innerHTML =
        orders
            .map(createOrderCard)
            .join("");

}


// =========================================================
// ESCAPE HTML
// =========================================================

function escapeHTML(value) {

    return String(value)

        .replace(/&/g, "&amp;")

        .replace(/</g, "&lt;")

        .replace(/>/g, "&gt;")

        .replace(/"/g, "&quot;")

        .replace(/'/g, "&#039;");

}


// =========================================================
// SHOW ERROR
// =========================================================

function showError(message) {

    ordersLoading.style.display = "none";

    ordersEmpty.style.display = "none";

    ordersList.innerHTML = "";


    ordersError.style.display = "block";


    ordersErrorMessage.textContent =
        message;

}


// =========================================================
// LOAD ORDERS
// =========================================================

async function loadOrders() {

    try {

        ordersLoading.style.display =
            "block";

        ordersError.style.display =
            "none";

        ordersEmpty.style.display =
            "none";


        const orders =
            await getMyOrders();


        renderOrders(orders);


    } catch (error) {

        console.error(
            "LOAD ORDERS ERROR:",
            error
        );


        if (
            error.message
                .toLowerCase()
                .includes("authorized")
        ) {

            showError(
                "Please log in to view your orders."
            );

        } else {

            showError(
                error.message ||
                "Unable to load your orders."
            );

        }

    } finally {

        ordersLoading.style.display =
            "none";

    }

}


// =========================================================
// VIEW ORDER
// =========================================================

function viewOrder(orderId) {

    if (!orderId) {
        return;
    }

    window.location.href =
        `order-details.html?orderId=${encodeURIComponent(orderId)}`;

}


// =========================================================
// CANCEL ORDER
// =========================================================

async function cancelOrder(orderId) {

    if (!orderId) {
        return;
    }


    const confirmed =
        window.confirm(
            "Are you sure you want to cancel this order?"
        );


    if (!confirmed) {
        return;
    }


    try {

        const response =
            await fetch(
                `${API_URL}/orders/${orderId}/cancel`,
                {
                    method: "PATCH",
                    credentials: "include"
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Unable to cancel order."
            );

        }


        alert(
            data.message ||
            "Order cancelled successfully."
        );


        /*
            Reload the order list so the
            updated status is displayed.
        */

        await loadOrders();


    } catch (error) {

        console.error(
            "CANCEL ORDER ERROR:",
            error
        );


        alert(
            error.message ||
            "Unable to cancel order."
        );

    }

}


// =========================================================
// ORDER BUTTON EVENTS
// =========================================================

document.addEventListener(
    "click",
    function (event) {

        const button =
            event.target.closest(
                "[data-action]"
            );


        if (!button) {
            return;
        }


        const action =
            button.dataset.action;


        const orderId =
            button.dataset.orderId;


        if (action === "view") {

            viewOrder(orderId);

        }


        if (action === "cancel") {

            cancelOrder(orderId);

        }

    }
);


// =========================================================
// INITIALIZE
// =========================================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        loadOrders();

    }
);