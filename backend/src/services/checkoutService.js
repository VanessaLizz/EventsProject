import prisma from "../lib/prisma.js";

const VALID_TICKET_STATUSES = [
    "VALID",
    "USED",
];

export async function releaseSessionSeats(
    tx,
    session
) {
    const seatIds = session.items
        .filter((item) => item.seatId)
        .map((item) => item.seatId);

    if (seatIds.length === 0) {
        return;
    }

    for (const seatId of seatIds) {
        const soldTicket =
            await tx.ticket.findFirst({
                where: {
                    seatId,
                    status: {
                        in: VALID_TICKET_STATUSES,
                    },
                },
            });

        if (!soldTicket) {
            await tx.seat.update({
                where: {
                    id: seatId,
                },
                data: {
                    isAvailable: true,
                },
            });
        }
    }
}

export async function expireCheckoutIfNecessary(
    tx,
    session,
    now
) {
    if (
        !session.expiresAt ||
        session.expiresAt > now
    ) {
        return false;
    }

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

    return true;
}

export async function validateCheckoutStock(
    tx,
    session
) {
    // ==================================================
    // AGRUPA QUANTIDADES
    // ==================================================

    const batchRequests = new Map();
    const modalityRequests = new Map();
    const sectorRequests = new Map();
    const eventRequests = new Map();
    const quotaRequests = new Map();

    for (const item of session.items) {
        const price =
            item.ticketBatchPrice;

        const batch =
            price.ticketBatch;

        const category =
            price.eventTicketCategory;

        const modality =
            batch.eventSectorModality;

        const sector =
            modality.eventSector;

        const event =
            sector.event;

        const quantity =
            item.quantity;

        batchRequests.set(
            batch.id,
            (batchRequests.get(batch.id) || 0) +
            quantity
        );

        modalityRequests.set(
            modality.id,
            (modalityRequests.get(modality.id) || 0) +
            quantity
        );

        sectorRequests.set(
            sector.id,
            (sectorRequests.get(sector.id) || 0) +
            quantity
        );

        eventRequests.set(
            event.id,
            (eventRequests.get(event.id) || 0) +
            quantity
        );

        const quotaGroup =
            category.priceCategoryTemplate
                .quotaGroup;

        if (quotaGroup) {
            const quotaKey =
                `${batch.id}:${quotaGroup.id}`;

            quotaRequests.set(
                quotaKey,
                {
                    batchId: batch.id,
                    groupId: quotaGroup.id,
                    percentage:
                        quotaGroup.maxPercentage,
                    requested:
                        (
                            quotaRequests.get(
                                quotaKey
                            )?.requested || 0
                        ) + quantity,
                    batchQuantity:
                        batch.quantity,
                }
            );
        }
    }

    // ==================================================
    // CAPACIDADE DOS LOTES
    // ==================================================

    for (
        const [batchId, requested]
        of batchRequests.entries()
    ) {
        const batch =
            await tx.ticketBatch.findUnique({
                where: {
                    id: batchId,
                },
            });

        if (!batch || !batch.isActive) {
            throw new Error(
                "BATCH_UNAVAILABLE"
            );
        }

        const sold =
            await tx.ticket.count({
                where: {
                    status: {
                        in: VALID_TICKET_STATUSES,
                    },
                    ticketBatchPrice: {
                        ticketBatchId:
                            batchId,
                    },
                },
            });

        if (
            sold + requested >
            batch.quantity
        ) {
            throw new Error(
                "BATCH_SOLD_OUT"
            );
        }
    }

    // ==================================================
    // CAPACIDADE DAS MODALIDADES
    // ==================================================

    for (
        const [modalityId, requested]
        of modalityRequests.entries()
    ) {
        const modality =
            await tx.eventSectorModality
                .findUnique({
                    where: {
                        id: modalityId,
                    },
                });

        const sold =
            await tx.ticket.count({
                where: {
                    status: {
                        in: VALID_TICKET_STATUSES,
                    },
                    ticketBatchPrice: {
                        ticketBatch: {
                            eventSectorModalityId:
                                modalityId,
                        },
                    },
                },
            });

        if (
            sold + requested >
            modality.capacity
        ) {
            throw new Error(
                "MODALITY_SOLD_OUT"
            );
        }
    }

    // ==================================================
    // CAPACIDADE DOS SETORES
    // ==================================================

    for (
        const [sectorId, requested]
        of sectorRequests.entries()
    ) {
        const sector =
            await tx.eventSector.findUnique({
                where: {
                    id: sectorId,
                },
            });

        const sold =
            await tx.ticket.count({
                where: {
                    status: {
                        in: VALID_TICKET_STATUSES,
                    },
                    ticketBatchPrice: {
                        ticketBatch: {
                            eventSectorModality: {
                                eventSectorId:
                                    sectorId,
                            },
                        },
                    },
                },
            });

        if (
            sold + requested >
            sector.capacity
        ) {
            throw new Error(
                "SECTOR_SOLD_OUT"
            );
        }
    }

    // ==================================================
    // CAPACIDADE DO EVENTO
    // ==================================================

    for (
        const [eventId, requested]
        of eventRequests.entries()
    ) {
        const event =
            await tx.event.findUnique({
                where: {
                    id: eventId,
                },
            });

        const sold =
            await tx.ticket.count({
                where: {
                    status: {
                        in: VALID_TICKET_STATUSES,
                    },
                    ticketBatchPrice: {
                        ticketBatch: {
                            eventSectorModality: {
                                eventSector: {
                                    eventId,
                                },
                            },
                        },
                    },
                },
            });

        if (
            sold + requested >
            event.capacity
        ) {
            throw new Error(
                "EVENT_SOLD_OUT"
            );
        }
    }

    // ==================================================
    // GRUPOS DE COTA
    // ==================================================
    //
    // Exemplo:
    //
    // LOTE = 400
    // MEIA ENTRADA = 50%
    //
    // MEIA + MEIA SOCIAL
    // máximo = 200 naquele lote.
    // ==================================================

    for (
        const quota
        of quotaRequests.values()
    ) {
        const sold =
            await tx.ticket.count({
                where: {
                    status: {
                        in: VALID_TICKET_STATUSES,
                    },

                    ticketBatchPrice: {
                        ticketBatchId:
                            quota.batchId,

                        eventTicketCategory: {
                            priceCategoryTemplate: {
                                quotaGroupId:
                                    quota.groupId,
                            },
                        },
                    },
                },
            });

        const maxAllowed =
            Math.floor(
                quota.batchQuantity *
                quota.percentage /
                100
            );

        if (
            sold + quota.requested >
            maxAllowed
        ) {
            throw new Error(
                "QUOTA_LIMIT_REACHED"
            );
        }
    }
}