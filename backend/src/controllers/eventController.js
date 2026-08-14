import prisma from "../lib/prisma.js";

import {
    getCurrentBatchForModality,
} from "../services/checkoutService.js";

// ======================================================
// SELECTS COMPARTILHADOS
// ======================================================

const organizerEventSelect = {
    id: true,
    title: true,
    description: true,
    imageUrl: true,
    source: true,
    externalId: true,
    capacity: true,

    venueName: true,
    address: true,
    city: true,
    state: true,
    country: true,

    latitude: true,
    longitude: true,

    dateTime: true,
    status: true,

    organizerId: true,

    categoryTemplate: {
        select: {
            id: true,
            name: true,
            normalizedName: true,
        },
    },

    createdAt: true,
    updatedAt: true,
};

// ======================================================
// LISTAR EVENTOS PÚBLICOS
// ======================================================

export async function listPublicEvents(
    req,
    res
) {
    try {
        const events =
            await prisma.event.findMany({
                where: {
                    status:
                        "PUBLISHED",
                },

                orderBy: {
                    dateTime:
                        "asc",
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
                            normalizedName:
                                true,
                        },
                    },
                },
            });

        return res
            .status(200)
            .json({
                events,
            });
    } catch (error) {
        console.error(
            "Erro ao listar eventos:",
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
// DETALHES PÚBLICOS DO EVENTO
// ======================================================

export async function getPublicEventById(
    req,
    res
) {
    try {
        const {
            eventId,
        } = req.params;

        const event =
            await prisma.event.findFirst({
                where: {
                    id:
                        eventId,

                    status:
                        "PUBLISHED",
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
                            normalizedName:
                                true,
                        },
                    },

                    sectors: {
                        orderBy: {
                            createdAt:
                                "asc",
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
                                    capacity:
                                        true,

                                    occupancyMode:
                                        true,

                                    modalityTemplate:
                                    {
                                        select: {
                                            id: true,
                                            name: true,
                                            normalizedName:
                                                true,
                                        },
                                    },

                                    seats: {
                                        where: {
                                            isAvailable:
                                                true,
                                        },

                                        orderBy: {
                                            normalizedLabel:
                                                "asc",
                                        },

                                        select: {
                                            id: true,
                                            label: true,
                                            normalizedLabel:
                                                true,
                                            isAvailable:
                                                true,
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            });

        if (!event) {
            return res
                .status(404)
                .json({
                    message:
                        "Evento não encontrado.",
                });
        }

        // ==================================================
        // DEFINE SOMENTE O LOTE VIGENTE DE CADA MODALIDADE
        // ==================================================
        //
        // O cliente não precisa conhecer a sequência de lotes.
        //
        // Exemplo:
        //
        // LOTE 1 ainda possui estoque
        // → retorna preços do lote 1
        //
        // LOTE 1 esgotou
        // → retorna preços do lote 2
        //
        // Todos os lotes esgotaram
        // → batches = []
        //
        // O array "batches" é mantido temporariamente para
        // compatibilidade com o Front-End atual, mas contém
        // no máximo UM lote.
        // ==================================================

        const sectors =
            await Promise.all(
                event.sectors.map(
                    async (
                        sector
                    ) => {
                        const modalities =
                            await Promise.all(
                                sector
                                    .modalities
                                    .map(
                                        async (
                                            modality
                                        ) => {
                                            const currentBatch =
                                                await getCurrentBatchForModality(
                                                    prisma,
                                                    modality.id
                                                );

                                            if (
                                                !currentBatch
                                            ) {
                                                return {
                                                    ...modality,

                                                    batches:
                                                        [],
                                                };
                                            }

                                            const publicBatch =
                                            {
                                                id:
                                                    currentBatch.id,

                                                sequence:
                                                    currentBatch.sequence,

                                                quantity:
                                                    currentBatch.quantity,

                                                soldQuantity:
                                                    currentBatch
                                                        .soldQuantity,

                                                remainingQuantity:
                                                    currentBatch
                                                        .remainingQuantity,

                                                prices:
                                                    (
                                                        currentBatch
                                                            .prices ||
                                                        []
                                                    ).map(
                                                        (
                                                            price
                                                        ) => ({
                                                            id:
                                                                price.id,

                                                            priceInCents:
                                                                price
                                                                    .priceInCents,

                                                            eventTicketCategory:
                                                            {
                                                                id:
                                                                    price
                                                                        .eventTicketCategory
                                                                        .id,

                                                                priceCategoryTemplate:
                                                                {
                                                                    id:
                                                                        price
                                                                            .eventTicketCategory
                                                                            .priceCategoryTemplate
                                                                            .id,

                                                                    name:
                                                                        price
                                                                            .eventTicketCategory
                                                                            .priceCategoryTemplate
                                                                            .name,

                                                                    normalizedName:
                                                                        price
                                                                            .eventTicketCategory
                                                                            .priceCategoryTemplate
                                                                            .normalizedName,
                                                                },
                                                            },
                                                        })
                                                    ),
                                            };

                                            return {
                                                ...modality,

                                                batches:
                                                    [
                                                        publicBatch,
                                                    ],
                                            };
                                        }
                                    )
                            );

                        return {
                            ...sector,
                            modalities,
                        };
                    }
                )
            );

        return res
            .status(200)
            .json({
                event: {
                    ...event,
                    sectors,
                },
            });
    } catch (error) {
        console.error(
            "Erro ao buscar evento:",
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
// TEMPLATES PARA O PAINEL DO ORGANIZADOR
// ======================================================

export async function listEventTemplates(
    req,
    res
) {
    try {
        const categories =
            await prisma
                .eventCategoryTemplate
                .findMany({
                    orderBy: {
                        name:
                            "asc",
                    },

                    select: {
                        id: true,
                        name: true,
                        normalizedName:
                            true,
                    },
                });

        const sectors =
            await prisma
                .sectorTemplate
                .findMany({
                    orderBy: {
                        name:
                            "asc",
                    },

                    select: {
                        id: true,
                        name: true,
                        normalizedName:
                            true,
                    },
                });

        const modalities =
            await prisma
                .modalityTemplate
                .findMany({
                    orderBy: {
                        name:
                            "asc",
                    },

                    select: {
                        id: true,
                        name: true,
                        normalizedName:
                            true,
                    },
                });

        const priceCategories =
            await prisma
                .priceCategoryTemplate
                .findMany({
                    orderBy: {
                        name:
                            "asc",
                    },

                    select: {
                        id: true,
                        name: true,
                        normalizedName:
                            true,
                        quotaGroupId:
                            true,
                    },
                });

        return res
            .status(200)
            .json({
                categories,
                sectors,
                modalities,
                priceCategories,
            });
    } catch (error) {
        console.error(
            "Erro ao listar templates:",
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
// LISTAR EVENTOS DO ORGANIZADOR
// ======================================================

export async function listOrganizerEvents(
    req,
    res
) {
    try {
        const events =
            await prisma.event.findMany({
                where: {
                    organizerId:
                        req.user.id,
                },

                orderBy: {
                    createdAt:
                        "desc",
                },

                select:
                    organizerEventSelect,
            });

        const eventsWithMetrics =
            await Promise.all(
                events.map(
                    async (event) => {
                        const tickets =
                            await prisma.ticket.findMany({
                                where: {
                                    status: {
                                        in: [
                                            "VALID",
                                            "USED",
                                        ],
                                    },

                                    ticketBatchPrice: {
                                        ticketBatch: {
                                            eventSectorModality: {
                                                eventSector: {
                                                    eventId:
                                                        event.id,
                                                },
                                            },
                                        },
                                    },
                                },

                                select: {
                                    unitPriceInCents:
                                        true,

                                    ticketBatchPrice: {
                                        select: {
                                            eventTicketCategory: {
                                                select: {
                                                    priceCategoryTemplate: {
                                                        select: {
                                                            name: true,
                                                        },
                                                    },
                                                },
                                            },

                                            ticketBatch: {
                                                select: {
                                                    eventSectorModality: {
                                                        select: {
                                                            eventSector: {
                                                                select: {
                                                                    sectorTemplate: {
                                                                        select: {
                                                                            name: true,
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

                        const soldTickets =
                            tickets.length;

                        const revenueInCents =
                            tickets.reduce(
                                (
                                    total,
                                    ticket
                                ) =>
                                    total +
                                    ticket
                                        .unitPriceInCents,
                                0
                            );

                        const remainingCapacity =
                            Math.max(
                                event.capacity -
                                    soldTickets,
                                0
                            );

                        const occupancyPercentage =
                            event.capacity >
                            0
                                ? Math.min(
                                      Math.round(
                                          (
                                              soldTickets /
                                              event.capacity
                                          ) *
                                              100
                                      ),
                                      100
                                  )
                                : 0;

                        const categoryMap =
                            new Map();

                        const sectorMap =
                            new Map();

                        for (
                            const ticket
                            of tickets
                        ) {
                            const categoryName =
                                ticket
                                    .ticketBatchPrice
                                    .eventTicketCategory
                                    .priceCategoryTemplate
                                    .name;

                            const sectorName =
                                ticket
                                    .ticketBatchPrice
                                    .ticketBatch
                                    .eventSectorModality
                                    .eventSector
                                    .sectorTemplate
                                    .name;

                            const categoryData =
                                categoryMap.get(
                                    categoryName
                                ) || {
                                    quantity:
                                        0,

                                    revenueInCents:
                                        0,
                                };

                            categoryData.quantity +=
                                1;

                            categoryData.revenueInCents +=
                                ticket
                                    .unitPriceInCents;

                            categoryMap.set(
                                categoryName,
                                categoryData
                            );

                            const sectorData =
                                sectorMap.get(
                                    sectorName
                                ) || {
                                    quantity:
                                        0,

                                    revenueInCents:
                                        0,
                                };

                            sectorData.quantity +=
                                1;

                            sectorData.revenueInCents +=
                                ticket
                                    .unitPriceInCents;

                            sectorMap.set(
                                sectorName,
                                sectorData
                            );
                        }

                        const byCategory =
                            Array.from(
                                categoryMap
                                    .entries()
                            )
                                .map(
                                    (
                                        [
                                            name,
                                            data,
                                        ]
                                    ) => ({
                                        name,

                                        quantity:
                                            data.quantity,

                                        revenueInCents:
                                            data
                                                .revenueInCents,
                                    })
                                )
                                .sort(
                                    (
                                        a,
                                        b
                                    ) =>
                                        b.quantity -
                                        a.quantity
                                );

                        const bySector =
                            Array.from(
                                sectorMap
                                    .entries()
                            )
                                .map(
                                    (
                                        [
                                            name,
                                            data,
                                        ]
                                    ) => ({
                                        name,

                                        quantity:
                                            data.quantity,

                                        revenueInCents:
                                            data
                                                .revenueInCents,
                                    })
                                )
                                .sort(
                                    (
                                        a,
                                        b
                                    ) =>
                                        b.quantity -
                                        a.quantity
                                );

                        return {
                            ...event,

                            metrics: {
                                soldTickets,
                                revenueInCents,
                                occupancyPercentage,
                                remainingCapacity,
                                byCategory,
                                bySector,
                            },
                        };
                    }
                )
            );

        return res
            .status(200)
            .json({
                events:
                    eventsWithMetrics,
            });
    } catch (error) {
        console.error(
            "Erro ao listar eventos do organizador:",
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
// BUSCAR EVENTO DO ORGANIZADOR
// ======================================================

export async function getOrganizerEventById(
    req,
    res
) {
    try {
        const {
            eventId,
        } = req.params;

        const event =
            await prisma.event.findFirst({
                where: {
                    id:
                        eventId,

                    organizerId:
                        req.user.id,
                },

                select:
                    organizerEventSelect,
            });

        if (!event) {
            return res
                .status(404)
                .json({
                    message:
                        "Evento não encontrado.",
                });
        }

        return res
            .status(200)
            .json({
                event,
            });
    } catch (error) {
        console.error(
            "Erro ao buscar evento do organizador:",
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
// CRIAR EVENTO
// ======================================================

export async function createOrganizerEvent(
    req,
    res
) {
    try {
        const {
            title,
            description,
            imageUrl,
            capacity,

            venueName,
            address,
            city,
            state,
            country,

            latitude,
            longitude,

            dateTime,
            categoryTemplateId,
        } = req.body;

        if (
            !title?.trim() ||
            !venueName?.trim() ||
            !city?.trim() ||
            !state?.trim() ||
            !country?.trim() ||
            !dateTime ||
            !categoryTemplateId
        ) {
            return res
                .status(400)
                .json({
                    message:
                        "Preencha todos os campos obrigatórios do evento.",
                });
        }

        const parsedCapacity =
            Number(
                capacity
            );

        if (
            !Number.isInteger(
                parsedCapacity
            ) ||
            parsedCapacity <=
                0
        ) {
            return res
                .status(400)
                .json({
                    message:
                        "A capacidade deve ser um número inteiro maior que zero.",
                });
        }

        const parsedDate =
            new Date(
                dateTime
            );

        if (
            Number.isNaN(
                parsedDate
                    .getTime()
            )
        ) {
            return res
                .status(400)
                .json({
                    message:
                        "Data e hora do evento inválidas.",
                });
        }

        const category =
            await prisma
                .eventCategoryTemplate
                .findUnique({
                    where: {
                        id:
                            categoryTemplateId,
                    },

                    select: {
                        id: true,
                    },
                });

        if (!category) {
            return res
                .status(400)
                .json({
                    message:
                        "Categoria do evento inválida.",
                });
        }

        const createdEvent =
            await prisma.event.create({
                data: {
                    title:
                        title.trim(),

                    description:
                        description
                            ?.trim() ||
                        null,

                    imageUrl:
                        imageUrl
                            ?.trim() ||
                        null,

                    source:
                        "LOCAL",

                    capacity:
                        parsedCapacity,

                    venueName:
                        venueName
                            .trim(),

                    address:
                        address
                            ?.trim() ||
                        null,

                    city:
                        city.trim(),

                    state:
                        state.trim(),

                    country:
                        country
                            .trim(),

                    latitude:
                        latitude ===
                            "" ||
                        latitude ===
                            null ||
                        latitude ===
                            undefined
                            ? null
                            : Number(
                                latitude
                            ),

                    longitude:
                        longitude ===
                            "" ||
                        longitude ===
                            null ||
                        longitude ===
                            undefined
                            ? null
                            : Number(
                                longitude
                            ),

                    dateTime:
                        parsedDate,

                    status:
                        "DRAFT",

                    organizerId:
                        req.user.id,

                    categoryTemplateId,
                },

                select:
                    organizerEventSelect,
            });

        return res
            .status(201)
            .json({
                message:
                    "Evento criado com sucesso.",

                event:
                    createdEvent,
            });
    } catch (error) {
        console.error(
            "Erro ao criar evento:",
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
// EDITAR EVENTO
// ======================================================

export async function updateOrganizerEvent(
    req,
    res
) {
    try {
        const {
            eventId,
        } = req.params;

        const existingEvent =
            await prisma.event.findFirst({
                where: {
                    id:
                        eventId,

                    organizerId:
                        req.user.id,
                },

                select: {
                    id: true,
                },
            });

        if (!existingEvent) {
            return res
                .status(404)
                .json({
                    message:
                        "Evento não encontrado.",
                });
        }

        const {
            title,
            description,
            imageUrl,
            capacity,

            venueName,
            address,
            city,
            state,
            country,

            latitude,
            longitude,

            dateTime,
            categoryTemplateId,
        } = req.body;

        if (
            !title?.trim() ||
            !venueName?.trim() ||
            !city?.trim() ||
            !state?.trim() ||
            !country?.trim() ||
            !dateTime ||
            !categoryTemplateId
        ) {
            return res
                .status(400)
                .json({
                    message:
                        "Preencha todos os campos obrigatórios do evento.",
                });
        }

        const parsedCapacity =
            Number(
                capacity
            );

        if (
            !Number.isInteger(
                parsedCapacity
            ) ||
            parsedCapacity <=
                0
        ) {
            return res
                .status(400)
                .json({
                    message:
                        "A capacidade deve ser um número inteiro maior que zero.",
                });
        }

        const parsedDate =
            new Date(
                dateTime
            );

        if (
            Number.isNaN(
                parsedDate
                    .getTime()
            )
        ) {
            return res
                .status(400)
                .json({
                    message:
                        "Data e hora do evento inválidas.",
                });
        }

        const category =
            await prisma
                .eventCategoryTemplate
                .findUnique({
                    where: {
                        id:
                            categoryTemplateId,
                    },

                    select: {
                        id: true,
                    },
                });

        if (!category) {
            return res
                .status(400)
                .json({
                    message:
                        "Categoria do evento inválida.",
                });
        }

        const updatedEvent =
            await prisma.event.update({
                where: {
                    id:
                        eventId,
                },

                data: {
                    title:
                        title.trim(),

                    description:
                        description
                            ?.trim() ||
                        null,

                    imageUrl:
                        imageUrl
                            ?.trim() ||
                        null,

                    capacity:
                        parsedCapacity,

                    venueName:
                        venueName
                            .trim(),

                    address:
                        address
                            ?.trim() ||
                        null,

                    city:
                        city.trim(),

                    state:
                        state.trim(),

                    country:
                        country
                            .trim(),

                    latitude:
                        latitude ===
                            "" ||
                        latitude ===
                            null ||
                        latitude ===
                            undefined
                            ? null
                            : Number(
                                latitude
                            ),

                    longitude:
                        longitude ===
                            "" ||
                        longitude ===
                            null ||
                        longitude ===
                            undefined
                            ? null
                            : Number(
                                longitude
                            ),

                    dateTime:
                        parsedDate,

                    categoryTemplateId,
                },

                select:
                    organizerEventSelect,
            });

        return res
            .status(200)
            .json({
                message:
                    "Evento atualizado com sucesso.",

                event:
                    updatedEvent,
            });
    } catch (error) {
        console.error(
            "Erro ao atualizar evento:",
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