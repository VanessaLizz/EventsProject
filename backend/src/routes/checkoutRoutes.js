import { Router } from "express";

import {
    completeCheckout,
    startCheckout,
} from "../controllers/checkoutController.js";

import {
    authenticate,
} from "../middleware/authMiddleware.js";

import {
    authorize,
} from "../middleware/roleMiddleware.js";

const router = Router();

router.post(
    "/",
    authenticate,
    authorize("CLIENT"),
    startCheckout
);

router.post(
    "/:checkoutId/complete",
    authenticate,
    authorize("CLIENT"),
    completeCheckout
);

export default router;