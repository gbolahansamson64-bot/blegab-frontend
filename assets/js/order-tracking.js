/* =========================================================
   ORDER TRACKING PAGE JS
   Displays order timeline, shipping status, and tracking info
   ========================================================= */

const API_URL = "https://api.blegab.com/api";

document.addEventListener("DOMContentLoaded", function () {
    initOrderTracking();
});


/**
 * Initialize order tracking
 */
function initOrderTracking() {

    const urlParams =
        new URLSearchParams(
            window.location.search
        );

    const orderId =
        urlParams.get("orderId");


    const storedEmail =
        sessionStorage.getItem(
            "trackingEmail"
        );


    const trackingForm =
        document.getElementById(
            "order-tracking-form"
        );


    // ----------------------------------------------------
    // Always initialize the tracking form
    // ----------------------------------------------------

    if (trackingForm) {

        trackingForm.addEventListener(
            "submit",
            handleSearchSubmit
        );

    }


    // ----------------------------------------------------
    // If order ID came from confirmation page,
    // pre-fill the Order ID field.
    // ----------------------------------------------------

    if (orderId) {

        const orderIdInput =
            document.getElementById(
                "tracking-order-id"
            );


        if (orderIdInput) {

            orderIdInput.value =
                orderId;

        }

    }


    // ----------------------------------------------------
    // If email was previously saved, pre-fill it.
    // ----------------------------------------------------

    if (storedEmail) {

        const emailInput =
            document.getElementById(
                "tracking-email"
            );


        if (emailInput) {

            emailInput.value =
                storedEmail;

        }

    }


    // ----------------------------------------------------
    // IMPORTANT:
    // Do NOT automatically call loadOrderTracking().
    //
    // Guest tracking requires BOTH:
    // Order ID + Email
    //
    // The guest will submit the form.
    // ----------------------------------------------------

}


/**
 * Handle search form submission
 */
function handleSearchSubmit(e) {

    e.preventDefault();


    const orderIdInput =
        document.getElementById(
            "tracking-order-id"
        );


    const emailInput =
        document.getElementById(
            "tracking-email"
        );


    const orderId =
        orderIdInput
            ? orderIdInput.value.trim()
            : "";


    const email =
        emailInput
            ? emailInput.value.trim()
            : "";


    const submitBtn =
        document.querySelector(
            "#order-tracking-form button[type='submit']"
        );


    // ----------------------------------------------------
    // Validate fields
    // ----------------------------------------------------

    if (!orderId || !email) {

        showTrackingError(
            "Please enter your order ID and email address."
        );

        return;

    }


    // ----------------------------------------------------
    // Disable button while tracking request is running
    // ----------------------------------------------------

    if (submitBtn) {

        submitBtn.disabled = true;

    }


    // ----------------------------------------------------
    // Load order
    // ----------------------------------------------------

    loadOrderTracking(
        orderId,
        email
    );

}


/**
 * Load order tracking information
 */
async function loadOrderTracking(orderId, email = null) {

    const submitBtn =
        document.querySelector(
            '#order-tracking-form button[type="submit"]'
        );

    try {

        const response =
            await fetch(
                `${API_URL}/orders/track`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({
                        orderId,
                        email
                    })
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            if (response.status === 404) {

                showTrackingError(
                    "Order not found. Please check your order number and email."
                );

            } else {

                showTrackingError(
                    data.message ||
                    "Unable to retrieve order information."
                );

            }

            return;
        }


        displayOrderTracking(
            data.order
        );


    } catch (error) {

        console.error(
            "Error loading order tracking:",
            error
        );

        showTrackingError(
            "An error occurred. Please try again later."
        );

    } finally {

    if (submitBtn) {

        submitBtn.disabled = false;

    }

}

}


/**
 * Display order tracking
 */
function displayOrderTracking(order) {

    // Hide search form
    const searchForm =
        document.getElementById(
            "order-tracking-form"
        );


    if (searchForm) {

        searchForm.style.display =
            "none";

    }


    // Show tracking container
    const trackingContainer =
        document.getElementById(
            "order-tracking-container"
        );


    if (trackingContainer) {

        trackingContainer.style.display =
            "block";

    }


    // --------------------------------------------------
    // ORDER ID
    // --------------------------------------------------

    const orderId =
        document.getElementById(
            "track-order-id"
        );


    if (orderId) {

        orderId.textContent =
            order.id;

    }


    // --------------------------------------------------
    // ORDER STATUS
    // --------------------------------------------------

    const status =
        document.getElementById(
            "track-order-status"
        );


    if (status) {

        status.textContent =
            formatStatus(
                order.orderStatus
            );


        status.className =
            `track-order-status track-status-${String(
                order.orderStatus || ""
            ).toLowerCase()}`;

    }


    // --------------------------------------------------
    // TRACKING INFO
    // --------------------------------------------------

    const trackingInfo =
        document.getElementById(
            "track-tracking-info"
        );


    if (
        trackingInfo &&
        order.trackingNumber
    ) {

        trackingInfo.innerHTML = `

            <div class="tracking-info-item">

                <strong>
                    Tracking Number:
                </strong>

                <span>
                    ${order.trackingNumber}
                </span>

                <button
                    class="btn-copy"
                    onclick="copyToClipboard('${order.trackingNumber}')"
                >
                    Copy
                </button>

            </div>


            <div class="tracking-info-item">

                <strong>
                    Carrier:
                </strong>

                <span>
                    ${order.carrier || "Standard"}
                </span>

            </div>


            ${
                order.estimatedDelivery
                    ? `

                    <div class="tracking-info-item">

                        <strong>
                            Estimated Delivery:
                        </strong>

                        <span>
                            ${order.estimatedDelivery}
                        </span>

                    </div>

                    `
                    : ""
            }

        `;

    }


    // --------------------------------------------------
    // TIMELINE
    // --------------------------------------------------

    const timeline =
        document.getElementById(
            "order-timeline"
        );


    if (
        timeline &&
        order.timeline
    ) {

        timeline.innerHTML =
            order.timeline
                .map(
                    (event, index) => `

                        <div
                            class="timeline-event ${
                                event.status === "delivered" ||
                                (
                                    event.date &&
                                    new Date(event.date) <= new Date()
                                )
                                    ? "completed"
                                    : ""
                            }"
                        >

                            <div class="timeline-marker">

                                <div class="timeline-dot"></div>

                                ${
                                    index <
                                    order.timeline.length - 1
                                        ? `
                                            <div class="timeline-line"></div>
                                          `
                                        : ""
                                }

                            </div>


                            <div class="timeline-content">

                                <h3 class="timeline-title">

                                    ${event.title}

                                </h3>


                                <p class="timeline-description">

                                    ${event.description}

                                </p>


                                ${
                                    event.date
                                        ? `

                                            <span class="timeline-date">

                                                ${
                                                    new Date(
                                                        event.date
                                                    ).toLocaleDateString(
                                                        "en-US",
                                                        {
                                                            month:
                                                                "short",

                                                            day:
                                                                "numeric",

                                                            year:
                                                                "numeric",

                                                            hour:
                                                                "2-digit",

                                                            minute:
                                                                "2-digit"
                                                        }
                                                    )
                                                }

                                            </span>

                                          `
                                        : ""
                                }

                            </div>

                        </div>

                    `
                )
                .join("");

    }


    // --------------------------------------------------
    // MORE INFORMATION
    // --------------------------------------------------

    const moreInfoBtn =
        document.getElementById(
            "show-more-info"
        );


    if (moreInfoBtn) {

        moreInfoBtn.addEventListener(
            "click",
            function () {

                const details =
                    document.getElementById(
                        "order-additional-info"
                    );


                if (details) {

                    details.style.display =
                        details.style.display === "none"
                            ? "block"
                            : "none";

                }

            }
        );

    }

}


/**
 * Show tracking error
 */
function showTrackingError(message) {

    const errorContainer =
        document.getElementById(
            "tracking-error"
        );


    if (errorContainer) {

        errorContainer.innerHTML = `

            <div class="tracking-error-alert">

                <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                >

                    <circle
                        cx="12"
                        cy="12"
                        r="10"
                    ></circle>

                    <line
                        x1="12"
                        y1="8"
                        x2="12"
                        y2="12"
                    ></line>

                    <line
                        x1="12"
                        y1="16"
                        x2="12.01"
                        y2="16"
                    ></line>

                </svg>


                <p>
                    ${message}
                </p>

            </div>

        `;


        errorContainer.style.display =
            "block";

    }

}


/**
 * Copy tracking number to clipboard
 */
function copyToClipboard(text) {

    navigator.clipboard
        .writeText(text)
        .then(() => {

            showMessage(
                "Tracking number copied!",
                "success"
            );

        });

}


/**
 * Format status text
 */
function formatStatus(status) {

    const labels = {

        pending:
            "Pending",

        Pending:
            "Pending",

        processing:
            "Processing",

        Processing:
            "Processing",

        shipped:
            "In Transit",

        Shipped:
            "In Transit",

        delivered:
            "Delivered",

        Delivered:
            "Delivered",

        cancelled:
            "Cancelled",

        Cancelled:
            "Cancelled"

    };


    return (
        labels[status] ||
        status ||
        "Unknown"
    );

}


/**
 * Show message
 */
function showMessage(
    message,
    type
) {

    const container =
        document.createElement(
            "div"
        );


    container.className =
        `track-message track-message--${type}`;


    container.textContent =
        message;


    document.body.appendChild(
        container
    );


    setTimeout(
        () => container.remove(),
        3000
    );

}


/**
 * Download tracking info as PDF
 * Placeholder
 */
function downloadTrackingPDF() {

    const downloadBtn =
        document.querySelector(
            '[onclick="downloadTrackingPDF()"]'
        );


    if (
        downloadBtn &&
        window.BLEGAB_BUTTONS
    ) {

        window.BLEGAB_BUTTONS.setLoading(
            downloadBtn,
            true
        );

    }


    setTimeout(
        function () {

            showMessage(
                "PDF download feature coming soon!",
                "info"
            );


            if (
                downloadBtn &&
                window.BLEGAB_BUTTONS
            ) {

                window.BLEGAB_BUTTONS.setLoading(
                    downloadBtn,
                    false
                );

            }

        },
        300
    );

}