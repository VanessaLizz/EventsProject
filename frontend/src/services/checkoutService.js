import {
    apiRequest,
} from "./api.js";

// ======================================================
// INICIAR CHECKOUT
// ======================================================

export function startCheckout(
    items,
    token
) {
    return apiRequest(
        "/checkout",
        {
            method: "POST",

            body: {
                items,
            },

            token,
        }
    );
}

// ======================================================
// FINALIZAR CHECKOUT
// ======================================================

export function completeCheckout(
    checkoutId,
    paymentStatus,
    token
) {
    return apiRequest(
        `/checkout/${checkoutId}/complete`,
        {
            method: "POST",

            body: {
                paymentStatus,
            },

            token,
        }
    );
}