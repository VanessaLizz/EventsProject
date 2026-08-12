import { Router } from "express";

import {
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

export default router;