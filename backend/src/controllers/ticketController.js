import prisma from "../lib/prisma.js";

import {
    compareTicketQrHash,
    createTicketQrToken,
    generateTicketQrDataUrl,
} from "../services/qrCodeService.js";

// ======================================================
// LISTAR INGRESSOS DO CLIENTE
// ======================================================

export async function listMyTickets(
    req,
    res
) {
    try {
        const tickets =
            await prisma.ticket.findMany({
                where: {
                    order: {
                        clientId:
                            req.user.id,
                    },
                },

                orderBy: {
                    createdAt:
                        "desc",
                },

                include: {
                    order:
                        true,

                    seat:
                        true,

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

                                                    event: {
                                                        include: {
                                                            categoryTemplate:
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
                    },
                },
            });

        const formattedTickets =
            tickets.map(
                (ticket) => {
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
                        id:
                            ticket.id,

                        status:
                            ticket.status,

                        sharedToken:
                            ticket.sharedToken,

                        unitPriceInCents:
                            ticket
                                .unitPriceInCents,

                        createdAt:
                            ticket.createdAt,

                        event: {
                            id:
                                event.id,

                            title:
                                event.title,

                            imageUrl:
                                event.imageUrl,

                            dateTime:
                                event.dateTime,

                            category:
                                event
                                    .categoryTemplate
                                    ?.name ||
                                null,

                            venueName:
                                event
                                    .venueName,

                            city:
                                event.city,

                            state:
                                event.state,
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
                                ? {
                                      id:
                                          ticket
                                              .seat
                                              .id,

                                      label:
                                          ticket
                                              .seat
                                              .label,
                                  }
                                : null,
                    };
                }
            );

        return res.status(200).json({
            tickets:
                formattedTickets,
        });
    } catch (error) {
        console.error(
            "Erro ao listar ingressos do cliente:",
            error
        );

        return res.status(500).json({
            message:
                "Erro interno do servidor.",
        });
    }
}

// ======================================================
// QR CODE PRIVADO DO PROPRIETÁRIO
// ======================================================

export async function getTicketQr(
    req,
    res
) {
    try {
        const {
            ticketId,
        } = req.params;

        const ticket =
            await prisma.ticket.findFirst({
                where: {
                    id:
                        ticketId,

                    order: {
                        clientId:
                            req.user.id,
                    },
                },

                include: {
                    order:
                        true,

                    seat:
                        true,

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
            return res
                .status(404)
                .json({
                    message:
                        "Ingresso não encontrado.",
                });
        }

        if (
            ticket.status ===
            "CANCELLED"
        ) {
            return res
                .status(409)
                .json({
                    message:
                        "Este ingresso foi cancelado.",
                });
        }

        const token =
            createTicketQrToken({
                ticketId:
                    ticket.id,

                orderId:
                    ticket.orderId,
            });

        const hashMatches =
            compareTicketQrHash(
                token,
                ticket.qrCodeHash
            );

        if (!hashMatches) {
            return res
                .status(409)
                .json({
                    message:
                        "Não foi possível validar a integridade deste ingresso.",
                });
        }

        const qrCodeDataUrl =
            await generateTicketQrDataUrl(
                token
            );

        const modality =
            ticket
                .ticketBatchPrice
                .ticketBatch
                .eventSectorModality;

        const event =
            modality
                .eventSector
                .event;

        return res
            .status(200)
            .json({
                ticket: {
                    id:
                        ticket.id,

                    status:
                        ticket.status,

                    sharedToken:
                        ticket
                            .sharedToken,

                    event: {
                        id:
                            event.id,

                        title:
                            event.title,

                        dateTime:
                            event
                                .dateTime,

                        venueName:
                            event
                                .venueName,

                        city:
                            event.city,

                        state:
                            event.state,
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
                            ? {
                                  id:
                                      ticket
                                          .seat
                                          .id,

                                  label:
                                      ticket
                                          .seat
                                          .label,
                              }
                            : null,

                    unitPriceInCents:
                        ticket
                            .unitPriceInCents,

                    qrCode:
                        qrCodeDataUrl,
                },
            });
    } catch (error) {
        console.error(
            "Erro ao buscar QR Code do ingresso:",
            error
        );

        return res
            .status(500)
            .json({
                message:
                    "Erro interno do servidor.",
            });
    }
}

// ======================================================
// VISUALIZAÇÃO PÚBLICA VIA SHARED TOKEN
// ======================================================
//
// Esta rota NÃO retorna:
//
// - QR Code;
// - qrCodeHash;
// - token assinado;
// - orderId;
// - dados pessoais do comprador.
//
// O sharedToken serve somente para compartilhamento
// público das informações do ingresso.
// ======================================================

export async function getSharedTicket(
    req,
    res
) {
    try {
        const {
            sharedToken,
        } = req.params;

        const ticket =
            await prisma.ticket.findUnique({
                where: {
                    sharedToken,
                },

                include: {
                    seat:
                        true,

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

                                                    event: {
                                                        include: {
                                                            categoryTemplate:
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
                    },
                },
            });

        if (!ticket) {
            return res
                .status(404)
                .json({
                    message:
                        "Ingresso não encontrado.",
                });
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

        return res
            .status(200)
            .json({
                ticket: {
                    id:
                        ticket.id,

                    status:
                        ticket.status,

                    event: {
                        id:
                            event.id,

                        title:
                            event.title,

                        description:
                            event
                                .description,

                        imageUrl:
                            event
                                .imageUrl,

                        dateTime:
                            event
                                .dateTime,

                        category:
                            event
                                .categoryTemplate
                                .name,

                        venueName:
                            event
                                .venueName,

                        address:
                            event
                                .address,

                        city:
                            event.city,

                        state:
                            event.state,

                        country:
                            event
                                .country,
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
                            ? {
                                  label:
                                      ticket
                                          .seat
                                          .label,
                              }
                            : null,

                    unitPriceInCents:
                        ticket
                            .unitPriceInCents,
                },
            });
    } catch (error) {
        console.error(
            "Erro ao buscar ingresso compartilhado:",
            error
        );

        return res
            .status(500)
            .json({
                message:
                    "Erro interno do servidor.",
            });
    }
}