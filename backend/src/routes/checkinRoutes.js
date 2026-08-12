import { Router } from "express";

import {
    validateTicketQr,
} from "../controllers/checkinController.js";

import {
    authenticate,
} from "../middleware/authMiddleware.js";

import {
    authorize,
} from "../middleware/roleMiddleware.js";

const router = Router();

router.post(
    "/validate",
    authenticate,
    authorize("CHECKIN"),
    validateTicketQr
);

export default router;