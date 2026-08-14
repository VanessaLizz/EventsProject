import {
    apiRequest,
} from "./api.js";

// ======================================================
// EVENTOS PÚBLICOS
// ======================================================

export function getEvents() {
    return apiRequest(
        "/events"
    );
}

export function getEventById(
    eventId
) {
    return apiRequest(
        `/events/${eventId}`
    );
}

// ======================================================
// ORGANIZADOR — EVENTO
// ======================================================

export function getEventTemplates(
    token
) {
    return apiRequest(
        "/events/templates",
        {
            token,
        }
    );
}

export function getOrganizerEvents(
    token
) {
    return apiRequest(
        "/events/organizer/mine",
        {
            token,
        }
    );
}

export function getOrganizerEventById(
    eventId,
    token
) {
    return apiRequest(
        `/events/organizer/${eventId}`,
        {
            token,
        }
    );
}

export function createOrganizerEvent(
    eventData,
    token
) {
    return apiRequest(
        "/events/organizer",
        {
            method: "POST",
            body: eventData,
            token,
        }
    );
}

export function updateOrganizerEvent(
    eventId,
    eventData,
    token
) {
    return apiRequest(
        `/events/organizer/${eventId}`,
        {
            method: "PUT",
            body: eventData,
            token,
        }
    );
}

export function publishOrganizerEvent(
    eventId,
    token
) {
    return apiRequest(
        `/events/organizer/${eventId}/publish`,
        {
            method: "POST",
            token,
        }
    );
}

// ======================================================
// CONFIGURAÇÃO
// ======================================================

export function getEventConfiguration(
    eventId,
    token
) {
    return apiRequest(
        `/events/organizer/${eventId}/configuration`,
        {
            token,
        }
    );
}

export function createEventSector(
    eventId,
    data,
    token
) {
    return apiRequest(
        `/events/organizer/${eventId}/sectors`,
        {
            method: "POST",
            body: data,
            token,
        }
    );
}

export function createSectorModality(
    eventId,
    sectorId,
    data,
    token
) {
    return apiRequest(
        `/events/organizer/${eventId}/sectors/${sectorId}/modalities`,
        {
            method: "POST",
            body: data,
            token,
        }
    );
}

export function createTicketCategory(
    eventId,
    modalityId,
    data,
    token
) {
    return apiRequest(
        `/events/organizer/${eventId}/modalities/${modalityId}/categories`,
        {
            method: "POST",
            body: data,
            token,
        }
    );
}

export function createTicketBatch(
    eventId,
    modalityId,
    data,
    token
) {
    return apiRequest(
        `/events/organizer/${eventId}/modalities/${modalityId}/batches`,
        {
            method: "POST",
            body: data,
            token,
        }
    );
}

export function createModalitySeats(
    eventId,
    modalityId,
    data,
    token
) {
    return apiRequest(
        `/events/organizer/${eventId}/modalities/${modalityId}/seats`,
        {
            method: "POST",
            body: data,
            token,
        }
    );
}

// ======================================================
// EXCLUSÕES
// ======================================================

export function deleteEventSector(
    eventId,
    sectorId,
    token
) {
    return apiRequest(
        `/events/organizer/${eventId}/sectors/${sectorId}`,
        {
            method: "DELETE",
            token,
        }
    );
}

export function deleteSectorModality(
    eventId,
    modalityId,
    token
) {
    return apiRequest(
        `/events/organizer/${eventId}/modalities/${modalityId}`,
        {
            method: "DELETE",
            token,
        }
    );
}

export function deleteTicketCategory(
    eventId,
    modalityId,
    categoryId,
    token
) {
    return apiRequest(
        `/events/organizer/${eventId}/modalities/${modalityId}/categories/${categoryId}`,
        {
            method: "DELETE",
            token,
        }
    );
}

export function deleteTicketBatch(
    eventId,
    modalityId,
    batchId,
    token
) {
    return apiRequest(
        `/events/organizer/${eventId}/modalities/${modalityId}/batches/${batchId}`,
        {
            method: "DELETE",
            token,
        }
    );
}

export function deleteModalitySeat(
    eventId,
    modalityId,
    seatId,
    token
) {
    return apiRequest(
        `/events/organizer/${eventId}/modalities/${modalityId}/seats/${seatId}`,
        {
            method: "DELETE",
            token,
        }
    );
}