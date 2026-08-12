import { Router } from "express";

import {
    getSharedTicket,
    getTicketQr,
} from "../controllers/ticketController.js";

import {
    authenticate,
} from "../middleware/authMiddleware.js";

import {
    authorize,
} from "../middleware/roleMiddleware.js";

const router = Router();

// ======================================================
// ROTA PÚBLICA DE COMPARTILHAMENTO
// ======================================================

router.get(
    "/shared/:sharedToken",
    getSharedTicket
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