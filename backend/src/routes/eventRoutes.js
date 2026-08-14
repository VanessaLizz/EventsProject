import {
    Router,
} from "express";

import {
    listPublicEvents,
    getPublicEventById,
    listEventTemplates,
    listOrganizerEvents,
    getOrganizerEventById,
    createOrganizerEvent,
    updateOrganizerEvent,
} from "../controllers/eventController.js";

import {
    getEventConfiguration,
    createSectorTemplate,
    createModalityTemplate,
    createEventSector,
    createSectorModality,
    createTicketCategory,
    createTicketBatch,
    createModalitySeats,
    deleteEventSector,
    deleteSectorModality,
    deleteTicketCategory,
    deleteTicketBatch,
    deleteModalitySeat,
} from "../controllers/eventConfigurationController.js";

import {
    publishOrganizerEvent,
} from "../controllers/eventPublicationController.js";

import {
    authenticate,
} from "../middleware/authMiddleware.js";

import {
    authorize,
} from "../middleware/roleMiddleware.js";

const router =
    Router();

// ======================================================
// ROTAS DO ORGANIZADOR
// ======================================================

router.get(
    "/templates",
    authenticate,
    authorize("ORGANIZER"),
    listEventTemplates
);

// ======================================================
// CRIAÇÃO DE TEMPLATES GLOBAIS
// ======================================================

router.post(
    "/templates/sectors",
    authenticate,
    authorize("ORGANIZER"),
    createSectorTemplate
);

router.post(
    "/templates/modalities",
    authenticate,
    authorize("ORGANIZER"),
    createModalityTemplate
);

router.get(
    "/organizer/mine",
    authenticate,
    authorize("ORGANIZER"),
    listOrganizerEvents
);

router.get(
    "/organizer/:eventId/configuration",
    authenticate,
    authorize("ORGANIZER"),
    getEventConfiguration
);

router.post(
    "/organizer/:eventId/publish",
    authenticate,
    authorize("ORGANIZER"),
    publishOrganizerEvent
);

router.post(
    "/organizer/:eventId/sectors",
    authenticate,
    authorize("ORGANIZER"),
    createEventSector
);

router.delete(
    "/organizer/:eventId/sectors/:sectorId",
    authenticate,
    authorize("ORGANIZER"),
    deleteEventSector
);

router.post(
    "/organizer/:eventId/sectors/:sectorId/modalities",
    authenticate,
    authorize("ORGANIZER"),
    createSectorModality
);

router.delete(
    "/organizer/:eventId/modalities/:modalityId",
    authenticate,
    authorize("ORGANIZER"),
    deleteSectorModality
);

router.post(
    "/organizer/:eventId/modalities/:modalityId/categories",
    authenticate,
    authorize("ORGANIZER"),
    createTicketCategory
);

router.delete(
    "/organizer/:eventId/modalities/:modalityId/categories/:categoryId",
    authenticate,
    authorize("ORGANIZER"),
    deleteTicketCategory
);

router.post(
    "/organizer/:eventId/modalities/:modalityId/batches",
    authenticate,
    authorize("ORGANIZER"),
    createTicketBatch
);

router.delete(
    "/organizer/:eventId/modalities/:modalityId/batches/:batchId",
    authenticate,
    authorize("ORGANIZER"),
    deleteTicketBatch
);

router.post(
    "/organizer/:eventId/modalities/:modalityId/seats",
    authenticate,
    authorize("ORGANIZER"),
    createModalitySeats
);

router.delete(
    "/organizer/:eventId/modalities/:modalityId/seats/:seatId",
    authenticate,
    authorize("ORGANIZER"),
    deleteModalitySeat
);

router.get(
    "/organizer/:eventId",
    authenticate,
    authorize("ORGANIZER"),
    getOrganizerEventById
);

router.post(
    "/organizer",
    authenticate,
    authorize("ORGANIZER"),
    createOrganizerEvent
);

router.put(
    "/organizer/:eventId",
    authenticate,
    authorize("ORGANIZER"),
    updateOrganizerEvent
);

// ======================================================
// ROTAS PÚBLICAS
// ======================================================

router.get(
    "/",
    listPublicEvents
);

router.get(
    "/:eventId",
    getPublicEventById
);

export default router;