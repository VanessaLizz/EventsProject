import prisma from "../lib/prisma.js";

// ======================================================
// LISTAR EVENTOS PÚBLICOS
// ======================================================

export async function listPublicEvents(req, res) {
    try {
        const events =
            await prisma.event.findMany({
                where: {
                    status: "PUBLISHED",
                },

                orderBy: {
                    dateTime: "asc",
                },

                select: {
                    id: true,
                    title: true,
                    description: true,
                    imageUrl: true,
                    dateTime: true,

                    venueName: true,
                    city: true,
                    state: true,
                    country: true,

                    source: true,

                    categoryTemplate: {
                        select: {
                            id: true,
                            name: true,
                            normalizedName: true,
                        },
                    },
                },
            });

        return res.status(200).json({
            events,
        });
    } catch (error) {
        console.error(
            "Erro ao listar eventos:",
            error
        );

        return res.status(500).json({
            message:
                "Erro interno do servidor.",
        });
    }
}

// ======================================================
// DETALHES PÚBLICOS DO EVENTO
// ======================================================

export async function getPublicEventById(
    req,
    res
) {
    try {
        const { eventId } =
            req.params;

        const event =
            await prisma.event.findFirst({
                where: {
                    id: eventId,
                    status: "PUBLISHED",
                },

                select: {
                    id: true,
                    title: true,
                    description: true,
                    imageUrl: true,
                    dateTime: true,

                    venueName: true,
                    address: true,
                    city: true,
                    state: true,
                    country: true,

                    latitude: true,
                    longitude: true,

                    source: true,

                    categoryTemplate: {
                        select: {
                            id: true,
                            name: true,
                            normalizedName: true,
                        },
                    },

                    sectors: {
                        orderBy: {
                            createdAt: "asc",
                        },

                        select: {
                            id: true,
                            capacity: true,

                            sectorTemplate: {
                                select: {
                                    id: true,
                                    name: true,
                                    normalizedName:
                                        true,
                                },
                            },

                            modalities: {
                                orderBy: {
                                    createdAt:
                                        "asc",
                                },

                                select: {
                                    id: true,
                                    capacity: true,
                                    occupancyMode:
                                        true,

                                    modalityTemplate: {
                                        select: {
                                            id: true,
                                            name: true,
                                            normalizedName:
                                                true,
                                        },
                                    },

                                    batches: {
                                        where: {
                                            isActive:
                                                true,
                                        },

                                        orderBy: {
                                            sequence:
                                                "asc",
                                        },

                                        select: {
                                            id: true,
                                            name: true,
                                            sequence:
                                                true,
                                            quantity:
                                                true,

                                            prices: {
                                                select: {
                                                    id: true,
                                                    priceInCents:
                                                        true,

                                                    eventTicketCategory:
                                                    {
                                                        select: {
                                                            id: true,

                                                            priceCategoryTemplate:
                                                            {
                                                                select: {
                                                                    id: true,
                                                                    name: true,
                                                                    normalizedName:
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
                    },
                },
            });

        if (!event) {
            return res.status(404).json({
                message:
                    "Evento não encontrado.",
            });
        }

        return res.status(200).json({
            event,
        });
    } catch (error) {
        console.error(
            "Erro ao buscar evento:",
            error
        );

        return res.status(500).json({
            message:
                "Erro interno do servidor.",
        });
    }
}