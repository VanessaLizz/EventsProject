import prisma from "../lib/prisma.js";

import {
    compareTicketQrHash,
    validateTicketQrToken,
} from "../services/qrCodeService.js";

export async function validateTicketQr(req, res) {
    try {
        const { token } = req.body;

        if (!token || typeof token !== "string") {
            return res.status(400).json({
                message:
                    "QR Code inválido ou não informado.",
            });
        }

        let payload;

        try {
            payload =
                validateTicketQrToken(token);
        } catch {
            return res.status(400).json({
                message:
                    "QR Code inválido.",
            });
        }

        const result =
            await prisma.$transaction(
                async (tx) => {
                    const ticket =
                        await tx.ticket.findUnique({
                            where: {
                                id:
                                    payload.ticketId,
                            },
                            include: {
                                order: true,
                                seat: true,
                                ticketBatchPrice: {
                                    include: {
                                        eventTicketCategory: {
                                            include: {
                                                priceCategoryTemplate:
                                                    true,
                                            },
                                        },
                                        ticketBatch: {
                                            include: {
                                                eventSectorModality: {
                                                    include: {
                                                        modalityTemplate:
                                                            true,
                                                        eventSector: {
                                                            include: {
                                                                sectorTemplate:
                                                                    true,
                                                                event:
                                                                    true,
                                                            },
                                                        },
                                                    },
                                                },
                                            },
                                        },
                                    },
                                },
                            },
                        });

                    if (!ticket) {
                        throw new Error(
                            "TICKET_NOT_FOUND"
                        );
                    }

                    if (
                        ticket.orderId !==
                        payload.orderId
                    ) {
                        throw new Error(
                            "INVALID_QR"
                        );
                    }

                    const hashMatches =
                        compareTicketQrHash(
                            token,
                            ticket.qrCodeHash
                        );

                    if (!hashMatches) {
                        throw new Error(
                            "INVALID_QR"
                        );
                    }

                    if (
                        ticket.status ===
                        "CANCELLED"
                    ) {
                        throw new Error(
                            "TICKET_CANCELLED"
                        );
                    }

                    if (
                        ticket.status ===
                        "USED"
                    ) {
                        throw new Error(
                            "TICKET_ALREADY_USED"
                        );
                    }

                    if (
                        ticket.status !==
                        "VALID"
                    ) {
                        throw new Error(
                            "INVALID_TICKET_STATUS"
                        );
                    }

                    // Apenas uma leitura concorrente consegue
                    // alterar VALID -> USED.
                    const updateResult =
                        await tx.ticket.updateMany({
                            where: {
                                id:
                                    ticket.id,
                                status:
                                    "VALID",
                            },
                            data: {
                                status:
                                    "USED",
                            },
                        });

                    if (
                        updateResult.count !==
                        1
                    ) {
                        throw new Error(
                            "TICKET_ALREADY_USED"
                        );
                    }

                    const modality =
                        ticket
                            .ticketBatchPrice
                            .ticketBatch
                            .eventSectorModality;

                    const event =
                        modality
                            .eventSector
                            .event;

                    return {
                        ticketId:
                            ticket.id,

                        event: {
                            id:
                                event.id,
                            title:
                                event.title,
                            dateTime:
                                event.dateTime,
                            venueName:
                                event.venueName,
                        },

                        sector:
                            modality
                                .eventSector
                                .sectorTemplate
                                .name,

                        modality:
                            modality
                                .modalityTemplate
                                .name,

                        priceCategory:
                            ticket
                                .ticketBatchPrice
                                .eventTicketCategory
                                .priceCategoryTemplate
                                .name,

                        seat:
                            ticket.seat
                                ? ticket
                                    .seat
                                    .label
                                : null,
                    };
                }
            );

        return res.status(200).json({
            message:
                "Ingresso validado. Entrada autorizada.",

            ticket: {
                id:
                    result.ticketId,
                status:
                    "USED",
                event:
                    result.event,
                sector:
                    result.sector,
                modality:
                    result.modality,
                priceCategory:
                    result.priceCategory,
                seat:
                    result.seat,
            },
        });
    } catch (error) {
        if (
            error.message ===
            "TICKET_NOT_FOUND"
        ) {
            return res.status(404).json({
                message:
                    "Ingresso não encontrado.",
            });
        }

        if (
            error.message ===
            "INVALID_QR"
        ) {
            return res.status(400).json({
                message:
                    "QR Code inválido.",
            });
        }

        if (
            error.message ===
            "TICKET_CANCELLED"
        ) {
            return res.status(409).json({
                message:
                    "Este ingresso foi cancelado e não pode ser utilizado.",
            });
        }

        if (
            error.message ===
            "TICKET_ALREADY_USED"
        ) {
            return res.status(409).json({
                message:
                    "Este ingresso já foi utilizado.",
            });
        }

        if (
            error.message ===
            "INVALID_TICKET_STATUS"
        ) {
            return res.status(409).json({
                message:
                    "Este ingresso não está disponível para utilização.",
            });
        }

        console.error(
            "Erro ao validar ingresso:",
            error
        );

        return res.status(500).json({
            message:
                "Erro interno do servidor.",
        });
    }
}