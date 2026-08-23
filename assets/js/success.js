const SUCCESS_API_URL = "https://api.blegab.com/api";

const params = new URLSearchParams(window.location.search);
const sessionId = params.get("session_id");

const orderDetails = document.getElementById("order-details");

let attempts = 0;
const MAX_ATTEMPTS = 15;
const RETRY_DELAY = 2000;


// ==================================================
// VERIFY PAYMENT
// ==================================================

async function verifyPayment() {

    if (!sessionId) {

        orderDetails.innerHTML = `
            <p style="color:red">
                Invalid payment session.
            </p>
        `;

        return;
    }


    try {

        console.log(
            "VERIFYING STRIPE SESSION:",
            sessionId
        );


        const response = await fetch(
            `${SUCCESS_API_URL}/orders/verify-payment/${encodeURIComponent(sessionId)}`,
            {
                method: "GET",
                credentials: "include"
            }
        );


        const data = await response.json();


        console.log(
            "PAYMENT VERIFICATION RESPONSE:",
            {
                status: response.status,
                ok: response.ok,
                data: data
            }
        );


        // ==================================================
        // ORDER STILL BEING CREATED
        // ==================================================

        if (
            response.status === 202 &&
            data.processing === true
        ) {

            attempts++;


            console.log(
                `Order still processing. Attempt ${attempts}/${MAX_ATTEMPTS}`
            );


            if (attempts >= MAX_ATTEMPTS) {

                orderDetails.innerHTML = `
                    <h3>Payment Received 🎉</h3>

                    <p>
                        Your payment was successful.
                    </p>

                    <p>
                        Your order is still being processed.
                    </p>

                    <p>
                        Please check your order history shortly.
                    </p>
                `;

                return;
            }


            orderDetails.innerHTML = `
                <h3>Payment Received 🎉</h3>

                <p>
                    Confirming your order...
                </p>

                <p>
                    Please wait a moment.
                </p>
            `;


            setTimeout(
                verifyPayment,
                RETRY_DELAY
            );


            return;
        }


        // ==================================================
        // BACKEND ERROR
        // ==================================================

        if (!response.ok) {

            throw new Error(
                data.message ||
                "Unable to verify payment."
            );

        }


        // ==================================================
        // PAYMENT MUST BE CONFIRMED
        // ==================================================

        if (
            data.success !== true ||
            data.paid !== true
        ) {

            throw new Error(
                data.message ||
                "Payment could not be confirmed."
            );

        }


        // ==================================================
        // ORDER NOT RETURNED
        // ==================================================

        if (!data.order) {

            console.error(
                "Payment verified but no order returned:",
                data
            );


            /*
             * The webhook may have completed payment,
             * but the order may not yet be visible.
             *
             * Retry instead of getting stuck.
             */

            attempts++;


            if (attempts >= MAX_ATTEMPTS) {

                orderDetails.innerHTML = `
                    <h3>Payment Received 🎉</h3>

                    <p>
                        Your payment was successful.
                    </p>

                    <p>
                        Your order is still being processed.
                    </p>
                `;

                return;
            }


            orderDetails.innerHTML = `
                <h3>Payment Received 🎉</h3>

                <p>
                    Confirming your order...
                </p>
            `;


            setTimeout(
                verifyPayment,
                RETRY_DELAY
            );


            return;
        }


        // ==================================================
        // SUCCESS
        // ==================================================

        console.log(
            "✅ PAYMENT VERIFIED AND ORDER FOUND:",
            data.order
        );


        displayOrder(data.order);


    } catch (error) {

        console.error(
            "PAYMENT VERIFICATION ERROR:",
            error
        );


        /*
         * Do not immediately show an error if this is
         * simply a temporary webhook/database delay.
         */

        attempts++;


        if (attempts < MAX_ATTEMPTS) {

            orderDetails.innerHTML = `
                <h3>Payment Received 🎉</h3>

                <p>
                    Confirming your order...
                </p>

                <p>
                    Please wait a moment.
                </p>
            `;


            setTimeout(
                verifyPayment,
                RETRY_DELAY
            );


            return;
        }


        orderDetails.innerHTML = `
            <p style="color:red">
                ${error.message}
            </p>
        `;

    }

}


// ==================================================
// DISPLAY ORDER
// ==================================================

function displayOrder(order) {

    if (!order) {

        console.error(
            "displayOrder received an empty order:",
            order
        );


        orderDetails.innerHTML = `
            <p style="color:red">
                Order information could not be loaded.
            </p>
        `;


        return;
    }


    console.log(
        "DISPLAYING ORDER:",
        order
    );


    orderDetails.innerHTML = `

        <h3>
            Order Confirmed 🎉
        </h3>

        <p>
            <strong>Order ID:</strong>
            ${order._id || order.id || ""}
        </p>

        <p>
            <strong>Name:</strong>
            ${order.shippingAddress?.firstName || ""}
            ${order.shippingAddress?.lastName || ""}
        </p>

        <p>
            <strong>Email:</strong>
            ${order.customerEmail || ""}
        </p>

        <p>
            <strong>Total Paid:</strong>
            $${Number(order.total || 0).toFixed(2)}
        </p>

        <p>
            <strong>Payment Status:</strong>
            ${order.paymentStatus || "Paid"}
        </p>

        <p>
            <strong>Order Status:</strong>
            ${order.orderStatus || "Processing"}
        </p>

    `;


    // ==================================================
    // SAVE ORDER FOR CONFIRMATION PAGE
    // ==================================================

    try {

        if (
            window.OrderConfirmation &&
            window.OrderConfirmation.saveOrderToSession
        ) {

            window.OrderConfirmation.saveOrderToSession(
                order
            );

        } else {

            sessionStorage.setItem(
                "lastOrderData",
                JSON.stringify(order)
            );

        }

    } catch (storageError) {

        console.error(
            "Unable to save order to sessionStorage:",
            storageError
        );

    }


    // ==================================================
    // REDIRECT TO ORDER CONFIRMATION
    // ==================================================

    setTimeout(function () {

        const orderId =
            order._id ||
            order.id;


        if (orderId) {

            window.location.href =
                `order-confirmation.html?orderId=${encodeURIComponent(orderId)}`;

        } else {

            window.location.href =
                "order-confirmation.html";

        }

    }, 3000);

}


// ==================================================
// START VERIFICATION
// ==================================================

verifyPayment();