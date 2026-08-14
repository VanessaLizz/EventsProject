import { randomUUID } from "crypto";

import prisma from "../lib/prisma.js";

import {
    expireCheckoutIfNecessary,
    releaseSessionSeats,
    validateCheckoutStock,
    validateCurrentBatch,
} from "../services/checkoutService.js";

import {
    createTicketQrToken,
    hashTicketQrToken,
} from "../services/qrCodeService.js";

const MAX_TICKETS_PER_CHECKOUT = 10;
const SEAT_HOLD_MINUTES = 10;
const SERVICE_FEE_RATE_BPS = 1200;

function getSeatExpirationDate() {
    return new Date(
        Date.now() +
        SEAT_HOLD_MINUTES * 60 * 1000
    );
}

function calculateRequestedTickets(items) {
    return items.reduce(
        (total, item) => {
            if (
                Array.isArray(
                    item.seatIds
                )
            ) {
                return (
                    total +
                    item.seatIds.length
                );
            }

            return (
                total +
                (item.quantity || 0)
            );
        },
        0
    );
}

async function releaseExpiredSeatHolds(
    tx,
    now
) {
    const sessions =
        await tx.checkoutSession.findMany({
            where: {
                status: "ACTIVE",
                expiresAt: {
                    lte: now,
                },
            },

            include: {
                items: true,
            },
        });

    for (const session of sessions) {
        await releaseSessionSeats(
            tx,
            session
        );

        await tx.checkoutSession.update({
            where: {
                id: session.id,
            },

            data: {
                status: "EXPIRED",
            },
        });
    }
}

// ======================================================
// INICIAR CHECKOUT
// ======================================================

export async function startCheckout(
    req,
    res
) {
    try {
        const {
            items,
        } = req.body;

        if (
            !Array.isArray(items) ||
            items.length === 0
        ) {
            return res.status(400).json({
                message:
                    "Selecione pelo menos um ingresso para continuar.",
            });
        }

        const totalRequested =
            calculateRequestedTickets(
                items
            );

        if (
            totalRequested < 1 ||
            totalRequested >
                MAX_TICKETS_PER_CHECKOUT
        ) {
            return res.status(400).json({
                message:
                    "É permitido comprar no máximo 10 ingressos por vez.",
            });
        }

        const requestedPrices = [];

        for (const item of items) {
            if (
                !item.ticketBatchPriceId
            ) {
                return res.status(400).json({
                    message:
                        "Todos os ingressos devem possuir uma opção de preço.",
                });
            }

            const ticketBatchPrice =
                await prisma.ticketBatchPrice
                    .findUnique({
                        where: {
                            id:
                                item.ticketBatchPriceId,
                        },

                        include: {
                            ticketBatch: {
                                include: {
                                    eventSectorModality: {
                                        include: {
                                            eventSector: {
                                                include: {
                                                    event:
                                                        true,
                                                    sectorTemplate:
                                                        true,
                                                },
                                            },

                                            modalityTemplate:
                                                true,
                                        },
                                    },
                                },
                            },

                            eventTicketCategory: {
                                include: {
                                    priceCategoryTemplate: {
                                        include: {
                                            quotaGroup:
                                                true,
                                        },
                                    },
                                },
                            },
                        },
                    });

            if (!ticketBatchPrice) {
                return res.status(404).json({
                    message:
                        "Uma das opções de ingresso não foi encontrada.",
                });
            }

            if (
                !ticketBatchPrice
                    .ticketBatch
                    .isActive
            ) {
                return res.status(409).json({
                    message:
                        "Um dos ingressos selecionados não está mais disponível.",
                });
            }

            // ==========================================
            // GARANTE QUE O PREÇO PERTENCE AO
            // LOTE ATUALMENTE EM VENDA
            // ==========================================

            try {
                await validateCurrentBatch(
                    prisma,
                    ticketBatchPrice
                        .ticketBatch
                );
            } catch (error) {
                if (
                    error.message ===
                    "BATCH_NOT_CURRENT"
                ) {
                    return res
                        .status(409)
                        .json({
                            message:
                                "O preço deste ingresso mudou. Atualize a página para visualizar o valor atual.",
                        });
                }

                if (
                    error.message ===
                    "MODALITY_SOLD_OUT"
                ) {
                    return res
                        .status(409)
                        .json({
                            message:
                                "Os ingressos desta modalidade estão esgotados.",
                        });
                }

                throw error;
            }

            requestedPrices.push({
                request: item,
                data:
                    ticketBatchPrice,
            });
        }

        const eventIds =
            new Set(
                requestedPrices.map(
                    ({
                        data,
                    }) =>
                        data
                            .ticketBatch
                            .eventSectorModality
                            .eventSector
                            .event.id
                )
            );

        if (
            eventIds.size !== 1
        ) {
            return res.status(400).json({
                message:
                    "Os ingressos de uma mesma compra devem pertencer ao mesmo evento.",
            });
        }

        let containsSeat = false;

        for (
            const {
                request,
                data,
            }
            of requestedPrices
        ) {
            const modality =
                data.ticketBatch
                    .eventSectorModality;

            if (
                modality.occupancyMode ===
                "QUANTITY"
            ) {
                if (
                    request.seatIds &&
                    request.seatIds.length >
                        0
                ) {
                    return res.status(400).json({
                        message:
                            "Esta modalidade não utiliza assentos marcados.",
                    });
                }

                if (
                    !Number.isInteger(
                        request.quantity
                    ) ||
                    request.quantity < 1
                ) {
                    return res.status(400).json({
                        message:
                            "Informe uma quantidade válida de ingressos.",
                    });
                }

                continue;
            }

            if (
                modality.occupancyMode ===
                "SEAT"
            ) {
                containsSeat = true;

                if (
                    !Array.isArray(
                        request.seatIds
                    ) ||
                    request.seatIds.length ===
                        0
                ) {
                    return res.status(400).json({
                        message:
                            "Selecione os assentos para continuar.",
                    });
                }

                const uniqueSeatIds =
                    new Set(
                        request.seatIds
                    );

                if (
                    uniqueSeatIds.size !==
                    request.seatIds.length
                ) {
                    return res.status(400).json({
                        message:
                            "O mesmo assento não pode ser selecionado mais de uma vez.",
                    });
                }

                continue;
            }

            return res.status(400).json({
                message:
                    "Forma de ocupação inválida.",
            });
        }

        const now =
            new Date();

        const expiresAt =
            containsSeat
                ? getSeatExpirationDate()
                : null;

        const checkoutSession =
            await prisma.$transaction(
                async (tx) => {
                    await releaseExpiredSeatHolds(
                        tx,
                        now
                    );

                    // ==================================
                    // CONFERE NOVAMENTE O LOTE DENTRO
                    // DA TRANSAÇÃO
                    // ==================================

                    for (
                        const {
                            data,
                        }
                        of requestedPrices
                    ) {
                        await validateCurrentBatch(
                            tx,
                            data.ticketBatch
                        );
                    }

                    const session =
                        await tx.checkoutSession
                            .create({
                                data: {
                                    clientId:
                                        req.user.id,

                                    status:
                                        "ACTIVE",

                                    expiresAt,
                                },
                            });

                    for (
                        const {
                            request,
                            data,
                        }
                        of requestedPrices
                    ) {
                        const modality =
                            data.ticketBatch
                                .eventSectorModality;

                        // ==============================
                        // QUANTITY
                        // ==============================

                        if (
                            modality
                                .occupancyMode ===
                            "QUANTITY"
                        ) {
                            await tx.checkoutItem
                                .create({
                                    data: {
                                        checkoutSessionId:
                                            session.id,

                                        ticketBatchPriceId:
                                            data.id,

                                        quantity:
                                            request.quantity,

                                        seatId:
                                            null,
                                    },
                                });

                            continue;
                        }

                        // ==============================
                        // SEAT
                        // ==============================

                        for (
                            const seatId
                            of request.seatIds
                        ) {
                            const seat =
                                await tx.seat
                                    .findUnique({
                                        where: {
                                            id:
                                                seatId,
                                        },
                                    });

                            if (!seat) {
                                throw new Error(
                                    "SEAT_NOT_FOUND"
                                );
                            }

                            if (
                                seat
                                    .eventSectorModalityId !==
                                modality.id
                            ) {
                                throw new Error(
                                    "INVALID_SEAT"
                                );
                            }

                            const soldTicket =
                                await tx.ticket
                                    .findFirst({
                                        where: {
                                            seatId,

                                            status: {
                                                in: [
                                                    "VALID",
                                                    "USED",
                                                ],
                                            },
                                        },
                                    });

                            if (
                                soldTicket
                            ) {
                                throw new Error(
                                    "SEAT_UNAVAILABLE"
                                );
                            }

                            const seatLock =
                                await tx.seat
                                    .updateMany({
                                        where: {
                                            id:
                                                seatId,

                                            isAvailable:
                                                true,
                                        },

                                        data: {
                                            isAvailable:
                                                false,
                                        },
                                    });

                            if (
                                seatLock.count !==
                                1
                            ) {
                                throw new Error(
                                    "SEAT_UNAVAILABLE"
                                );
                            }

                            await tx.checkoutItem
                                .create({
                                    data: {
                                        checkoutSessionId:
                                            session.id,

                                        ticketBatchPriceId:
                                            data.id,

                                        seatId,

                                        quantity:
                                            1,
                                    },
                                });
                        }
                    }

                    return tx.checkoutSession
                        .findUnique({
                            where: {
                                id:
                                    session.id,
                            },

                            include: {
                                items:
                                    true,
                            },
                        });
                }
            );

        return res.status(201).json({
            message:
                "Checkout iniciado com sucesso.",

            checkout: {
                id:
                    checkoutSession.id,

                status:
                    checkoutSession.status,

                totalTickets:
                    totalRequested,

                maxTickets:
                    MAX_TICKETS_PER_CHECKOUT,

                expiresAt:
                    checkoutSession.expiresAt,

                items:
                    checkoutSession.items,
            },
        });
    } catch (error) {
        if (
            error.message ===
            "SEAT_UNAVAILABLE"
        ) {
            return res.status(409).json({
                message:
                    "Um dos assentos selecionados não está disponível.",
            });
        }

        if (
            error.message ===
            "SEAT_NOT_FOUND"
        ) {
            return res.status(404).json({
                message:
                    "Um dos assentos selecionados não foi encontrado.",
            });
        }

        if (
            error.message ===
            "INVALID_SEAT"
        ) {
            return res.status(400).json({
                message:
                    "Um dos assentos selecionados não pertence à modalidade escolhida.",
            });
        }

        if (
            error.message ===
            "BATCH_NOT_CURRENT"
        ) {
            return res.status(409).json({
                message:
                    "O preço deste ingresso mudou. Atualize a página para visualizar o valor atual.",
            });
        }

        if (
            error.message ===
            "MODALITY_SOLD_OUT"
        ) {
            return res.status(409).json({
                message:
                    "Os ingressos desta modalidade estão esgotados.",
            });
        }

        console.error(
            "Erro ao iniciar checkout:",
            error
        );

        return res.status(500).json({
            message:
                "Erro interno do servidor.",
        });
    }
}

// ======================================================
// FINALIZAR CHECKOUT
// ======================================================

export async function completeCheckout(
    req,
    res
) {
    try {
        const {
            checkoutId,
        } = req.params;

        const {
            paymentStatus,
        } = req.body;

        if (
            ![
                "APPROVED",
                "REFUSED",
            ].includes(
                paymentStatus
            )
        ) {
            return res.status(400).json({
                message:
                    "Informe um resultado de pagamento válido.",
            });
        }

        const result =
            await prisma.$transaction(
                async (tx) => {
                    const session =
                        await tx.checkoutSession
                            .findFirst({
                                where: {
                                    id:
                                        checkoutId,

                                    clientId:
                                        req.user.id,
                                },

                                include: {
                                    items: {
                                        include: {
                                            ticketBatchPrice: {
                                                include: {
                                                    ticketBatch: {
                                                        include: {
                                                            eventSectorModality: {
                                                                include: {
                                                                    eventSector: {
                                                                        include: {
                                                                            event:
                                                                                true,
                                                                        },
                                                                    },
                                                                },
                                                            },
                                                        },
                                                    },

                                                    eventTicketCategory: {
                                                        include: {
                                                            priceCategoryTemplate: {
                                                                include: {
                                                                    quotaGroup:
                                                                        true,
                                                                },
                                                            },
                                                        },
                                                    },
                                                },
                                            },

                                            seat:
                                                true,
                                        },
                                    },
                                },
                            });

                    if (!session) {
                        throw new Error(
                            "CHECKOUT_NOT_FOUND"
                        );
                    }

                    if (
                        session.status !==
                        "ACTIVE"
                    ) {
                        throw new Error(
                            "CHECKOUT_NOT_ACTIVE"
                        );
                    }

                    const now =
                        new Date();

                    const expired =
                        await expireCheckoutIfNecessary(
                            tx,
                            session,
                            now
                        );

                    if (expired) {
                        throw new Error(
                            "CHECKOUT_EXPIRED"
                        );
                    }

                    // ==============================
                    // PAGAMENTO RECUSADO
                    // ==============================

                    if (
                        paymentStatus ===
                        "REFUSED"
                    ) {
                        await releaseSessionSeats(
                            tx,
                            session
                        );

                        await tx.checkoutSession
                            .update({
                                where: {
                                    id:
                                        session.id,
                                },

                                data: {
                                    status:
                                        "CANCELLED",
                                },
                            });

                        return {
                            refused:
                                true,
                        };
                    }

                    // ==============================
                    // VALIDAÇÃO REAL DE ESTOQUE
                    // ==============================

                    await validateCheckoutStock(
                        tx,
                        session
                    );

                    // ==============================
                    // VALORES
                    // ==============================

                    let subtotalInCents = 0;

                    for (
                        const item
                        of session.items
                    ) {
                        subtotalInCents +=
                            item
                                .ticketBatchPrice
                                .priceInCents *
                            item.quantity;
                    }

                    const serviceFeeInCents =
                        Math.round(
                            subtotalInCents *
                            SERVICE_FEE_RATE_BPS /
                            10000
                        );

                    const totalInCents =
                        subtotalInCents +
                        serviceFeeInCents;

                    // ==============================
                    // PEDIDO
                    // ==============================

                    const order =
                        await tx.order.create({
                            data: {
                                clientId:
                                    req.user.id,

                                status:
                                    "APPROVED",

                                subtotalInCents,

                                serviceFeeRateBps:
                                    SERVICE_FEE_RATE_BPS,

                                serviceFeeInCents,

                                totalInCents,
                            },
                        });

                    // ==============================
                    // INGRESSOS + QR ASSINADO
                    // ==============================

                    for (
                        const item
                        of session.items
                    ) {
                        for (
                            let i = 0;
                            i <
                            item.quantity;
                            i++
                        ) {
                            const ticketId =
                                randomUUID();

                            const qrToken =
                                createTicketQrToken({
                                    ticketId,

                                    orderId:
                                        order.id,
                                });

                            const qrCodeHash =
                                hashTicketQrToken(
                                    qrToken
                                );

                            await tx.ticket.create({
                                data: {
                                    id:
                                        ticketId,

                                    orderId:
                                        order.id,

                                    ticketBatchPriceId:
                                        item
                                            .ticketBatchPriceId,

                                    seatId:
                                        item.seatId,

                                    unitPriceInCents:
                                        item
                                            .ticketBatchPrice
                                            .priceInCents,

                                    qrCodeHash,
                                },
                            });
                        }
                    }

                    await tx.checkoutSession
                        .update({
                            where: {
                                id:
                                    session.id,
                            },

                            data: {
                                status:
                                    "COMPLETED",
                            },
                        });

                    return {
                        refused:
                            false,

                        orderId:
                            order.id,

                        subtotalInCents,

                        serviceFeeInCents,

                        totalInCents,

                        ticketCount:
                            session.items
                                .reduce(
                                    (
                                        total,
                                        item
                                    ) =>
                                        total +
                                        item.quantity,
                                    0
                                ),
                    };
                }
            );

        if (result.refused) {
            return res.status(402).json({
                message:
                    "Pagamento recusado. A compra não foi concluída.",
            });
        }

        return res.status(201).json({
            message:
                "Compra concluída com sucesso.",

            order: {
                id:
                    result.orderId,

                subtotalInCents:
                    result.subtotalInCents,

                serviceFeeInCents:
                    result.serviceFeeInCents,

                serviceFeeRate:
                    "12%",

                totalInCents:
                    result.totalInCents,

                ticketCount:
                    result.ticketCount,
            },
        });
    } catch (error) {
        if (
            error.message ===
            "CHECKOUT_NOT_FOUND"
        ) {
            return res.status(404).json({
                message:
                    "Checkout não encontrado.",
            });
        }

        if (
            error.message ===
            "CHECKOUT_NOT_ACTIVE"
        ) {
            return res.status(409).json({
                message:
                    "Este checkout não está mais ativo.",
            });
        }

        if (
            error.message ===
            "CHECKOUT_EXPIRED"
        ) {
            return res.status(409).json({
                message:
                    "O tempo para concluir sua compra expirou. Inicie novamente.",
            });
        }

        if (
            [
                "BATCH_UNAVAILABLE",
                "BATCH_SOLD_OUT",
                "BATCH_NOT_CURRENT",
                "MODALITY_SOLD_OUT",
                "SECTOR_SOLD_OUT",
                "EVENT_SOLD_OUT",
            ].includes(
                error.message
            )
        ) {
            return res.status(409).json({
                message:
                    "Um ou mais ingressos não estão mais disponíveis. Atualize sua seleção e tente novamente.",
            });
        }

        if (
            error.message ===
            "QUOTA_LIMIT_REACHED"
        ) {
            return res.status(409).json({
                message:
                    "O limite desta categoria foi atingido neste lote. Atualize sua seleção para verificar o próximo lote disponível.",
            });
        }

        console.error(
            "Erro ao finalizar checkout:",
            error
        );

        return res.status(500).json({
            message:
                "Erro interno do servidor.",
        });
    }
}