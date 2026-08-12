import prisma from "../lib/prisma.js";

const MAX_TICKETS_PER_CHECKOUT = 10;
const SEAT_HOLD_MINUTES = 10;

function getSeatExpirationDate() {
    const expiresAt = new Date();

    expiresAt.setMinutes(
        expiresAt.getMinutes() + SEAT_HOLD_MINUTES
    );

    return expiresAt;
}

function calculateRequestedTickets(items) {
    return items.reduce((total, item) => {
        if (Array.isArray(item.seatIds)) {
            return total + item.seatIds.length;
        }

        return total + (item.quantity || 0);
    }, 0);
}

async function releaseExpiredSeatHolds(tx, now) {
    const expiredSessions =
        await tx.checkoutSession.findMany({
            where: {
                status: "ACTIVE",
                expiresAt: {
                    lte: now,
                },
            },
            include: {
                items: {
                    where: {
                        seatId: {
                            not: null,
                        },
                    },
                },
            },
        });

    for (const session of expiredSessions) {
        for (const item of session.items) {
            if (!item.seatId) {
                continue;
            }

            const soldTicket =
                await tx.ticket.findFirst({
                    where: {
                        seatId: item.seatId,
                        status: {
                            in: ["VALID", "USED"],
                        },
                    },
                });

            if (!soldTicket) {
                await tx.seat.update({
                    where: {
                        id: item.seatId,
                    },
                    data: {
                        isAvailable: true,
                    },
                });
            }
        }

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

export async function startCheckout(req, res) {
    try {
        const { items } = req.body;

        // ==================================================
        // VALIDAÇÕES GERAIS
        // ==================================================

        if (!Array.isArray(items) || items.length === 0) {
            return res.status(400).json({
                message:
                    "Selecione pelo menos um ingresso para continuar.",
            });
        }

        const totalRequested =
            calculateRequestedTickets(items);

        if (
            totalRequested < 1 ||
            totalRequested > MAX_TICKETS_PER_CHECKOUT
        ) {
            return res.status(400).json({
                message:
                    "É permitido comprar no máximo 10 ingressos por vez.",
            });
        }

        const requestedPrices = [];

        for (const item of items) {
            if (!item.ticketBatchPriceId) {
                return res.status(400).json({
                    message:
                        "Todos os ingressos devem possuir uma opção de preço.",
                });
            }

            const ticketBatchPrice =
                await prisma.ticketBatchPrice.findUnique({
                    where: {
                        id: item.ticketBatchPriceId,
                    },
                    include: {
                        ticketBatch: {
                            include: {
                                eventSectorModality: {
                                    include: {
                                        eventSector: {
                                            include: {
                                                event: true,
                                                sectorTemplate: true,
                                            },
                                        },
                                        modalityTemplate: true,
                                    },
                                },
                            },
                        },
                        eventTicketCategory: {
                            include: {
                                priceCategoryTemplate: {
                                    include: {
                                        quotaGroup: true,
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

            if (!ticketBatchPrice.ticketBatch.isActive) {
                return res.status(409).json({
                    message:
                        "Um dos lotes selecionados não está disponível.",
                });
            }

            requestedPrices.push({
                request: item,
                data: ticketBatchPrice,
            });
        }

        // ==================================================
        // TODOS OS INGRESSOS DEVEM SER DO MESMO EVENTO
        // ==================================================

        const eventIds = new Set(
            requestedPrices.map(
                ({ data }) =>
                    data.ticketBatch
                        .eventSectorModality
                        .eventSector.event.id
            )
        );

        if (eventIds.size !== 1) {
            return res.status(400).json({
                message:
                    "Os ingressos de uma mesma compra devem pertencer ao mesmo evento.",
            });
        }

        // ==================================================
        // VALIDAÇÃO DE CADA ITEM
        // ==================================================

        let containsSeat = false;

        for (const { request, data } of requestedPrices) {
            const modality =
                data.ticketBatch.eventSectorModality;

            if (modality.occupancyMode === "QUANTITY") {
                if (
                    request.seatIds &&
                    request.seatIds.length > 0
                ) {
                    return res.status(400).json({
                        message:
                            "Esta modalidade não utiliza assentos marcados.",
                    });
                }

                if (
                    !Number.isInteger(request.quantity) ||
                    request.quantity < 1
                ) {
                    return res.status(400).json({
                        message:
                            "Informe uma quantidade válida de ingressos.",
                    });
                }

                continue;
            }

            if (modality.occupancyMode === "SEAT") {
                containsSeat = true;

                if (
                    !Array.isArray(request.seatIds) ||
                    request.seatIds.length === 0
                ) {
                    return res.status(400).json({
                        message:
                            "Selecione os assentos para continuar.",
                    });
                }

                const uniqueSeatIds = new Set(
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

        const now = new Date();

        const expiresAt = containsSeat
            ? getSeatExpirationDate()
            : null;

        // ==================================================
        // TRANSAÇÃO
        // ==================================================

        const checkoutSession =
            await prisma.$transaction(async (tx) => {
                // Libera bloqueios de assentos expirados.
                await releaseExpiredSeatHolds(
                    tx,
                    now
                );

                const session =
                    await tx.checkoutSession.create({
                        data: {
                            clientId: req.user.id,
                            status: "ACTIVE",
                            expiresAt,
                        },
                    });

                for (
                    const { request, data }
                    of requestedPrices
                ) {
                    const modality =
                        data.ticketBatch
                            .eventSectorModality;

                    // ======================================
                    // QUANTITY
                    // ======================================
                    //
                    // Não bloqueia estoque.
                    //
                    // Mesmo que a quantidade disponível
                    // seja menor do que o número de pessoas
                    // atualmente em checkout, todas podem
                    // iniciar o processo.
                    //
                    // O estoque será disputado somente na
                    // finalização da compra.
                    // ======================================

                    if (
                        modality.occupancyMode ===
                        "QUANTITY"
                    ) {
                        await tx.checkoutItem.create({
                            data: {
                                checkoutSessionId:
                                    session.id,

                                ticketBatchPriceId:
                                    data.id,

                                quantity:
                                    request.quantity,

                                seatId: null,
                            },
                        });

                        continue;
                    }

                    // ======================================
                    // SEAT
                    // ======================================

                    for (const seatId of request.seatIds) {
                        const seat =
                            await tx.seat.findUnique({
                                where: {
                                    id: seatId,
                                },
                            });

                        if (!seat) {
                            throw new Error(
                                "SEAT_NOT_FOUND"
                            );
                        }

                        if (
                            seat.eventSectorModalityId !==
                            modality.id
                        ) {
                            throw new Error(
                                "INVALID_SEAT"
                            );
                        }

                        // Verifica se já existe ingresso
                        // definitivo para o assento.
                        const soldTicket =
                            await tx.ticket.findFirst({
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

                        if (soldTicket) {
                            throw new Error(
                                "SEAT_UNAVAILABLE"
                            );
                        }

                        // Bloqueio atômico.
                        //
                        // Apenas uma requisição conseguirá
                        // alterar isAvailable de true para
                        // false.
                        const seatLock =
                            await tx.seat.updateMany({
                                where: {
                                    id: seatId,
                                    isAvailable: true,
                                },
                                data: {
                                    isAvailable: false,
                                },
                            });

                        if (seatLock.count !== 1) {
                            throw new Error(
                                "SEAT_UNAVAILABLE"
                            );
                        }

                        await tx.checkoutItem.create({
                            data: {
                                checkoutSessionId:
                                    session.id,

                                ticketBatchPriceId:
                                    data.id,

                                seatId,

                                quantity: 1,
                            },
                        });
                    }
                }

                return tx.checkoutSession.findUnique({
                    where: {
                        id: session.id,
                    },
                    include: {
                        items: true,
                    },
                });
            });

        // ==================================================
        // RESPOSTA
        // ==================================================

        return res.status(201).json({
            message:
                "Checkout iniciado com sucesso.",

            checkout: {
                id: checkoutSession.id,
                status: checkoutSession.status,

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
            error.message === "SEAT_UNAVAILABLE"
        ) {
            return res.status(409).json({
                message:
                    "Um dos assentos selecionados não está disponível.",
            });
        }

        if (error.message === "SEAT_NOT_FOUND") {
            return res.status(404).json({
                message:
                    "Um dos assentos selecionados não foi encontrado.",
            });
        }

        if (error.message === "INVALID_SEAT") {
            return res.status(400).json({
                message:
                    "Um dos assentos selecionados não pertence à modalidade escolhida.",
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