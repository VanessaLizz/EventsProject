import {
    apiRequest,
} from "./api.js";

// ======================================================
// MEUS INGRESSOS
// ======================================================

export function getMyTickets(
    token
) {
    return apiRequest(
        "/tickets/mine",
        {
            token,
        }
    );
}

// ======================================================
// QR PRIVADO
// ======================================================

export function getTicketQr(
    ticketId,
    token
) {
    return apiRequest(
        `/tickets/${ticketId}/qr`,
        {
            token,
        }
    );
}

// ======================================================
// INGRESSO COMPARTILHADO
// ======================================================

export function getSharedTicket(
    sharedToken
) {
    return apiRequest(
        `/tickets/shared/${sharedToken}`
    );
}