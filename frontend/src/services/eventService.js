import {
    apiRequest,
} from "./api.js";

export function getEvents() {
    return apiRequest("/events");
}

export function getEventById(
    eventId
) {
    return apiRequest(
        `/events/${eventId}`
    );
}