import {
    apiRequest,
} from "./api.js";

// ======================================================
// VALIDAR INGRESSO
// ======================================================

export function validateCheckin(
    qrToken,
    token
) {
    return apiRequest(
        "/checkin/validate",
        {
            method:
                "POST",

            body: {
                token:
                    qrToken,
            },

            token,
        }
    );
}