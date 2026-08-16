const API_URL = "https://api.blegab.com/api";

const params = new URLSearchParams(window.location.search);

const sessionId = params.get("session_id");

const orderDetails = document.getElementById("order-details");

let attempts = 0;

const MAX_ATTEMPTS = 15;

const RETRY_DELAY = 2000;


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

        const response = await fetch(
            `${API_URL}/orders/verify-payment/${sessionId}`,
            {
                credentials: "include"
            }
        );


        const data = await response.json();


        // -----------------------------------------
        // DEBUG
        // -----------------------------------------

        console.log("PAYMENT VERIFICATION RESPONSE:", {
            status: response.status,
            ok: response.ok,
            data: data
        });


        // -----------------------------------------
        // ORDER NOT CREATED YET
        // -----------------------------------------

         if (
             response.status === 202 &&
             data.processing === true
            ) {

            attempts++;


            if (attempts >= MAX_ATTEMPTS) {

                orderDetails.innerHTML = `
                    <p>
                        Payment was received successfully.
                    </p>

                    <p>
                        Your order is still being processed.
                        Please check your order history shortly.
                    </p>
                `;

                return;
            }


            orderDetails.innerHTML = `
                <p>
                    Payment was received successfully.
                </p>

                <p>
                    Confirming your order...
                </p>

                <p>
                    Please wait a moment.
                </p>
            `;


            setTimeout(verifyPayment, RETRY_DELAY);

            return;
        }


        // -----------------------------------------
        // OTHER BACKEND ERRORS
        // -----------------------------------------

        if (!response.ok) {

            throw new Error(
                data.message || "Unable to verify payment."
            );

        }


        // -----------------------------------------
        // MAKE SURE ORDER EXISTS
        // -----------------------------------------

        if (!data.order) {

            console.error(
                "PAYMENT VERIFIED BUT NO ORDER WAS RETURNED:",
                data
            );

            throw new Error(
                "Payment was verified, but order information was not returned."
            );

        }


        // -----------------------------------------
        // SUCCESS
        // -----------------------------------------

        displayOrder(data.order);


    } catch (error) {

        console.error(
            "PAYMENT VERIFICATION ERROR:",
            error
        );


        orderDetails.innerHTML = `
            <p style="color:red">
                ${error.message}
            </p>
        `;

    }

}


function displayOrder(order) {

    // -----------------------------------------
    // EXTRA SAFETY CHECK
    // -----------------------------------------

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


    orderDetails.innerHTML = `

        <h3>Order Confirmed 🎉</h3>

        <p>
            <strong>Order ID:</strong>
            ${order._id}
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

}


verifyPayment();