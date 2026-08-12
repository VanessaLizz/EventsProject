import { Router } from "express";

import {
    getPublicEventById,
    listPublicEvents,
} from "../controllers/eventController.js";

const router = Router();

router.get(
    "/",
    listPublicEvents
);

router.get(
    "/:eventId",
    getPublicEventById
);

export default router;