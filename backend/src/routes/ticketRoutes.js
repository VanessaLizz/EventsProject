import {
    Router,
} from "express";

import {
    getSharedTicket,
    getTicketQr,
    listMyTickets,
} from "../controllers/ticketController.js";

import {
    authenticate,
} from "../middleware/authMiddleware.js";

import {
    authorize,
} from "../middleware/roleMiddleware.js";

const router =
    Router();

// ======================================================
// ROTA PÚBLICA DE COMPARTILHAMENTO
// ======================================================

router.get(
    "/shared/:sharedToken",
    getSharedTicket
);

// ======================================================
// INGRESSOS DO CLIENTE
// ======================================================

router.get(
    "/mine",
    authenticate,
    authorize("CLIENT"),
    listMyTickets
);

// ======================================================
// QR PRIVADO DO PROPRIETÁRIO
// ======================================================

router.get(
    "/:ticketId/qr",
    authenticate,
    authorize("CLIENT"),
    getTicketQr
);

export default router;