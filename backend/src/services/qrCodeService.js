import crypto from "crypto";
import jwt from "jsonwebtoken";
import QRCode from "qrcode";

function getQrSecret() {
    const secret = process.env.QR_SECRET;

    if (!secret) {
        throw new Error(
            "QR_SECRET não está configurado."
        );
    }

    return secret;
}

// ======================================================
// TOKEN ASSINADO DO INGRESSO
// ======================================================
//
// O token não possui timestamp automático.
//
// Dessa forma:
//
// ticketId + orderId + QR_SECRET
//
// sempre produzem o mesmo token.
//
// Isso permite gerar novamente o QR Code futuramente
// sem precisar armazenar o token original no banco.
// ======================================================

export function createTicketQrToken({
    ticketId,
    orderId,
}) {
    const secret = getQrSecret();

    return jwt.sign(
        {
            type: "TICKET",
            ticketId,
            orderId,
        },
        secret,
        {
            algorithm: "HS256",
            noTimestamp: true,
        }
    );
}

// ======================================================
// VALIDAÇÃO DA ASSINATURA
// ======================================================

export function validateTicketQrToken(token) {
    const secret = getQrSecret();

    try {
        const payload = jwt.verify(
            token,
            secret,
            {
                algorithms: ["HS256"],
            }
        );

        if (
            payload.type !== "TICKET" ||
            !payload.ticketId ||
            !payload.orderId
        ) {
            throw new Error(
                "INVALID_QR_PAYLOAD"
            );
        }

        return payload;
    } catch {
        throw new Error(
            "INVALID_QR_TOKEN"
        );
    }
}

// ======================================================
// HASH DO TOKEN
// ======================================================
//
// Somente este hash é persistido no banco.
//
// O token completo não é armazenado.
// ======================================================

export function hashTicketQrToken(token) {
    return crypto
        .createHash("sha256")
        .update(token)
        .digest("hex");
}

// ======================================================
// COMPARAÇÃO SEGURA
// ======================================================

export function compareTicketQrHash(
    token,
    storedHash
) {
    if (!storedHash) {
        return false;
    }

    const generatedHash =
        hashTicketQrToken(token);

    const generatedBuffer =
        Buffer.from(
            generatedHash,
            "hex"
        );

    const storedBuffer =
        Buffer.from(
            storedHash,
            "hex"
        );

    if (
        generatedBuffer.length !==
        storedBuffer.length
    ) {
        return false;
    }

    return crypto.timingSafeEqual(
        generatedBuffer,
        storedBuffer
    );
}

// ======================================================
// IMAGEM DO QR CODE
// ======================================================

export async function generateTicketQrDataUrl(
    token
) {
    return QRCode.toDataURL(
        token,
        {
            errorCorrectionLevel: "M",
            margin: 2,
            width: 320,
        }
    );
}