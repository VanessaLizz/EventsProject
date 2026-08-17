import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// ======================================================
// NORMALIZAÇÃO
// ======================================================

function normalizeName(value) {
    return value
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .trim()
        .replace(/\s+/g, " ")
        .toUpperCase();
}

async function upsertTemplate(
    model,
    name,
    extraData = {}
) {
    const normalizedName = normalizeName(name);

    return model.upsert({
        where: {
            normalizedName,
        },
        update: {
            ...extraData,
        },
        create: {
            name: normalizedName,
            normalizedName,
            ...extraData,
        },
    });
}

// ======================================================
// FUNÇÕES AUXILIARES
// ======================================================

async function createTicketCategory(
    eventSectorModalityId,
    priceCategoryTemplateId
) {
    return prisma.eventTicketCategory.create({
        data: {
            eventSectorModalityId,
            priceCategoryTemplateId,
        },
    });
}

async function createBatch(
    eventSectorModalityId,
    name,
    sequence,
    quantity,
    prices
) {
    const normalizedName = normalizeName(name);

    const batch = await prisma.ticketBatch.create({
        data: {
            eventSectorModalityId,
            name: normalizedName,
            normalizedName,
            sequence,
            quantity,
        },
    });

    await prisma.ticketBatchPrice.createMany({
        data: prices.map((price) => ({
            ticketBatchId: batch.id,
            eventTicketCategoryId:
                price.categoryId,
            priceInCents:
                price.priceInCents,
        })),
    });

    return batch;
}

// ======================================================
// CRIAÇÃO DE ASSENTOS
// ======================================================

async function createSeats(
    eventSectorModalityId,
    capacity,
    prefix = "A"
) {
    if (
        !Number.isInteger(capacity) ||
        capacity < 1
    ) {
        throw new Error(
            "Capacidade inválida para criação de assentos."
        );
    }

    const seats = Array.from(
        { length: capacity },
        (_, index) => {
            const label =
                `${prefix}${index + 1}`;

            return {
                eventSectorModalityId,
                label,
                normalizedLabel:
                    normalizeName(label),
                isAvailable: true,
            };
        }
    );

    await prisma.seat.createMany({
        data: seats,
    });
}

// ======================================================
// LIMPEZA DE CHECKOUTS DOS EVENTOS DE DEMONSTRAÇÃO
// ======================================================

async function deleteDemoCheckoutSessions(
    demoEventIds
) {
    const sessions =
        await prisma.checkoutSession.findMany({
            where: {
                items: {
                    some: {
                        ticketBatchPrice: {
                            ticketBatch: {
                                eventSectorModality: {
                                    eventSector: {
                                        eventId: {
                                            in: demoEventIds,
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            },

            select: {
                id: true,
            },
        });

    const sessionIds =
        sessions.map(
            (session) =>
                session.id
        );

    if (
        sessionIds.length === 0
    ) {
        return;
    }

    await prisma.checkoutSession.deleteMany({
        where: {
            id: {
                in: sessionIds,
            },
        },
    });
}

// ======================================================
// LIMPEZA DE INGRESSOS/PEDIDOS DOS EVENTOS DE DEMONSTRAÇÃO
// ======================================================
//
// Ingressos apontam para TicketBatchPrice e Seat.
// Essas relações não usam onDelete: Cascade.
//
// Portanto, antes de excluir os eventos seed, precisamos
// remover os ingressos vinculados a eles.
//
// Depois disso, pedidos que ficarem sem ingressos também
// são removidos. Pedidos que ainda possuírem ingressos de
// outros eventos são preservados.
// ======================================================

async function deleteDemoTicketsAndEmptyOrders(
    demoEventIds
) {
    const tickets =
        await prisma.ticket.findMany({
            where: {
                ticketBatchPrice: {
                    ticketBatch: {
                        eventSectorModality: {
                            eventSector: {
                                eventId: {
                                    in: demoEventIds,
                                },
                            },
                        },
                    },
                },
            },

            select: {
                id: true,
                orderId: true,
            },
        });

    if (
        tickets.length === 0
    ) {
        return;
    }

    const ticketIds =
        tickets.map(
            (ticket) =>
                ticket.id
        );

    const affectedOrderIds =
        [
            ...new Set(
                tickets.map(
                    (ticket) =>
                        ticket.orderId
                )
            ),
        ];

    await prisma.ticket.deleteMany({
        where: {
            id: {
                in: ticketIds,
            },
        },
    });

    await prisma.order.deleteMany({
        where: {
            id: {
                in: affectedOrderIds,
            },

            tickets: {
                none: {},
            },
        },
    });
}

// ======================================================
// SEED
// ======================================================

async function main() {
    const passwordHash =
        await bcrypt.hash(
            "123456",
            10
        );

    // ==================================================
    // EVENTOS CONTROLADOS PELO SEED
    // ==================================================

    const demoEventIds = [
        "seed-event-theater",
        "seed-event-epica",
        "seed-event-book",
        "seed-event-movie",
    ];

    await deleteDemoCheckoutSessions(
        demoEventIds
    );

    await deleteDemoTicketsAndEmptyOrders(
        demoEventIds
    );

    await prisma.event.deleteMany({
        where: {
            id: {
                in: demoEventIds,
            },
        },
    });

    // ==================================================
    // USUÁRIOS
    // ==================================================

    const organizer =
        await prisma.user.upsert({
            where: {
                email:
                    "organizador@teste.com",
            },

            update: {
                name:
                    "Organizador Teste",
                passwordHash,
                role:
                    "ORGANIZER",
            },

            create: {
                name:
                    "Organizador Teste",
                email:
                    "organizador@teste.com",
                passwordHash,
                role:
                    "ORGANIZER",
            },
        });

    await prisma.user.upsert({
        where: {
            email:
                "cliente1@teste.com",
        },

        update: {
            name:
                "Cliente Teste 1",
            passwordHash,
            role:
                "CLIENT",
        },

        create: {
            name:
                "Cliente Teste 1",
            email:
                "cliente1@teste.com",
            passwordHash,
            role:
                "CLIENT",
        },
    });

    await prisma.user.upsert({
        where: {
            email:
                "cliente2@teste.com",
        },

        update: {
            name:
                "Cliente Teste 2",
            passwordHash,
            role:
                "CLIENT",
        },

        create: {
            name:
                "Cliente Teste 2",
            email:
                "cliente2@teste.com",
            passwordHash,
            role:
                "CLIENT",
        },
    });

    await prisma.user.upsert({
        where: {
            email:
                "portaria@teste.com",
        },

        update: {
            name:
                "Portaria Teste",
            passwordHash,
            role:
                "CHECKIN",
        },

        create: {
            name:
                "Portaria Teste",
            email:
                "portaria@teste.com",
            passwordHash,
            role:
                "CHECKIN",
        },
    });

    // ==================================================
    // GRUPO GLOBAL DE COTA
    // ==================================================

    const halfPriceQuotaGroup =
        await prisma.priceQuotaGroup.upsert({
            where: {
                normalizedName:
                    "MEIA ENTRADA",
            },

            update: {
                maxPercentage:
                    50,
            },

            create: {
                name:
                    "MEIA ENTRADA",
                normalizedName:
                    "MEIA ENTRADA",
                maxPercentage:
                    50,
            },
        });

    // ==================================================
    // CATEGORIAS DE EVENTO
    // ==================================================

    const categoryShow =
        await upsertTemplate(
            prisma.eventCategoryTemplate,
            "SHOWS E FESTAS"
        );

    const categoryCinema =
        await upsertTemplate(
            prisma.eventCategoryTemplate,
            "CINEMA"
        );

    const categoryTheater =
        await upsertTemplate(
            prisma.eventCategoryTemplate,
            "TEATRO E ESPETÁCULOS"
        );

    const categoryLiterature =
        await upsertTemplate(
            prisma.eventCategoryTemplate,
            "LITERATURA | LANÇAMENTOS"
        );

    await upsertTemplate(
        prisma.eventCategoryTemplate,
        "CURSOS | PALESTRAS | WORKSHOPS"
    );

    await upsertTemplate(
        prisma.eventCategoryTemplate,
        "COMÉDIA | STAND UP"
    );

    await upsertTemplate(
        prisma.eventCategoryTemplate,
        "ESPORTES"
    );

    // ==================================================
    // SETORES
    // ==================================================

    const sectorPista =
        await upsertTemplate(
            prisma.sectorTemplate,
            "PISTA"
        );

    const sectorCamarote =
        await upsertTemplate(
            prisma.sectorTemplate,
            "CAMAROTE"
        );

    const sectorCadeiraSuperior =
        await upsertTemplate(
            prisma.sectorTemplate,
            "CADEIRA SUPERIOR"
        );

    const sectorCadeiraInferior =
        await upsertTemplate(
            prisma.sectorTemplate,
            "CADEIRA INFERIOR"
        );

    const sectorSalaCinema =
        await upsertTemplate(
            prisma.sectorTemplate,
            "SALA DE CINEMA"
        );

    const sectorEntradaGeral =
        await upsertTemplate(
            prisma.sectorTemplate,
            "ENTRADA GERAL"
        );

    const sectorPlateia =
        await upsertTemplate(
            prisma.sectorTemplate,
            "PLATEIA"
        );

    // ==================================================
    // MODALIDADES
    // ==================================================

    const modalityNormal =
        await upsertTemplate(
            prisma.modalityTemplate,
            "NORMAL"
        );

    const modalityOpenBar =
        await upsertTemplate(
            prisma.modalityTemplate,
            "OPEN BAR"
        );

    const modalityOpenFood =
        await upsertTemplate(
            prisma.modalityTemplate,
            "OPEN FOOD"
        );

    const modalityOpenBarFood =
        await upsertTemplate(
            prisma.modalityTemplate,
            "OPEN BAR + FOOD"
        );

    const modalityAutografoLivro =
        await upsertTemplate(
            prisma.modalityTemplate,
            "AUTÓGRAFO + LIVRO"
        );

    const modalityAutografoFotoLivro =
        await upsertTemplate(
            prisma.modalityTemplate,
            "AUTÓGRAFO + FOTO + LIVRO"
        );

    // ==================================================
    // CATEGORIAS DE PREÇO
    // ==================================================

    const priceInteira =
        await upsertTemplate(
            prisma.priceCategoryTemplate,
            "INTEIRA",
            {
                quotaGroupId:
                    null,
            }
        );

    const priceMeia =
        await upsertTemplate(
            prisma.priceCategoryTemplate,
            "MEIA",
            {
                quotaGroupId:
                    halfPriceQuotaGroup.id,
            }
        );

    const priceMeiaSocial =
        await upsertTemplate(
            prisma.priceCategoryTemplate,
            "MEIA SOCIAL",
            {
                quotaGroupId:
                    halfPriceQuotaGroup.id,
            }
        );

    const priceValorUnico =
        await upsertTemplate(
            prisma.priceCategoryTemplate,
            "VALOR ÚNICO",
            {
                quotaGroupId:
                    null,
            }
        );

    // ==================================================
    // EVENTO 1 — TEATRO
    // ==================================================

    const theaterEvent =
        await prisma.event.create({
            data: {
                id:
                    "seed-event-theater",

                title:
                    "Filhos do Éden: Paraíso Perdido",

                description:
                    "Peça teatral de fantasia épica baseada no universo de Filhos do Éden.",

                source:
                    "LOCAL",

                capacity:
                    300,

                venueName:
                    "Teatro Via Sul",

                city:
                    "Fortaleza",

                state:
                    "CE",

                country:
                    "BR",

                dateTime:
                    new Date(
                        "2026-10-10T20:00:00"
                    ),

                status:
                    "PUBLISHED",

                organizerId:
                    organizer.id,

                categoryTemplateId:
                    categoryTheater.id,
            },
        });

    const theaterSector =
        await prisma.eventSector.create({
            data: {
                eventId:
                    theaterEvent.id,

                sectorTemplateId:
                    sectorPlateia.id,

                capacity:
                    300,

                layoutRow:
                    1,

                layoutColumn:
                    1,
            },
        });

    const theaterModality =
        await prisma
            .eventSectorModality
            .create({
                data: {
                    eventSectorId:
                        theaterSector.id,

                    modalityTemplateId:
                        modalityNormal.id,

                    capacity:
                        300,

                    occupancyMode:
                        "SEAT",
                },
            });

    await createSeats(
        theaterModality.id,
        theaterModality.capacity
    );

    const theaterFull =
        await createTicketCategory(
            theaterModality.id,
            priceInteira.id
        );

    const theaterHalf =
        await createTicketCategory(
            theaterModality.id,
            priceMeia.id
        );

    const theaterSocial =
        await createTicketCategory(
            theaterModality.id,
            priceMeiaSocial.id
        );

    await createBatch(
        theaterModality.id,
        "LOTE 1",
        1,
        150,
        [
            {
                categoryId:
                    theaterFull.id,
                priceInCents:
                    12000,
            },
            {
                categoryId:
                    theaterHalf.id,
                priceInCents:
                    6000,
            },
            {
                categoryId:
                    theaterSocial.id,
                priceInCents:
                    7000,
            },
        ]
    );

    await createBatch(
        theaterModality.id,
        "LOTE 2",
        2,
        150,
        [
            {
                categoryId:
                    theaterFull.id,
                priceInCents:
                    14000,
            },
            {
                categoryId:
                    theaterHalf.id,
                priceInCents:
                    7000,
            },
            {
                categoryId:
                    theaterSocial.id,
                priceInCents:
                    8000,
            },
        ]
    );

    // ==================================================
    // EVENTO 2 — EPICA
    // ==================================================

    const epicaEvent =
        await prisma.event.create({
            data: {
                id:
                    "seed-event-epica",

                title:
                    "Epica - Live in Brazil",

                description:
                    "Latin America Tour 2026 - A banda de metal sinfônico Epica chega ao Brasil para uma apresentação especial.",

                source:
                    "LOCAL",

                capacity:
                    2000,

                venueName:
                    "Arena Boraí",

                city:
                    "São Paulo",

                state:
                    "SP",

                country:
                    "BR",

                dateTime:
                    new Date(
                        "2026-11-15T21:00:00"
                    ),

                status:
                    "PUBLISHED",

                organizerId:
                    organizer.id,

                categoryTemplateId:
                    categoryShow.id,
            },
        });

    const epicaPista =
        await prisma.eventSector.create({
            data: {
                eventId:
                    epicaEvent.id,

                sectorTemplateId:
                    sectorPista.id,

                capacity:
                    800,

                layoutRow:
                    1,

                layoutColumn:
                    1,
            },
        });

    const epicaPistaNormal =
        await prisma
            .eventSectorModality
            .create({
                data: {
                    eventSectorId:
                        epicaPista.id,

                    modalityTemplateId:
                        modalityNormal.id,

                    capacity:
                        800,

                    occupancyMode:
                        "QUANTITY",
                },
            });

    const pistaInteira =
        await createTicketCategory(
            epicaPistaNormal.id,
            priceInteira.id
        );

    const pistaMeia =
        await createTicketCategory(
            epicaPistaNormal.id,
            priceMeia.id
        );

    const pistaMeiaSocial =
        await createTicketCategory(
            epicaPistaNormal.id,
            priceMeiaSocial.id
        );

    await createBatch(
        epicaPistaNormal.id,
        "LOTE 1",
        1,
        400,
        [
            {
                categoryId:
                    pistaInteira.id,
                priceInCents:
                    22000,
            },
            {
                categoryId:
                    pistaMeia.id,
                priceInCents:
                    11000,
            },
            {
                categoryId:
                    pistaMeiaSocial.id,
                priceInCents:
                    14000,
            },
        ]
    );

    await createBatch(
        epicaPistaNormal.id,
        "LOTE 2",
        2,
        400,
        [
            {
                categoryId:
                    pistaInteira.id,
                priceInCents:
                    26000,
            },
            {
                categoryId:
                    pistaMeia.id,
                priceInCents:
                    13000,
            },
            {
                categoryId:
                    pistaMeiaSocial.id,
                priceInCents:
                    16000,
            },
        ]
    );

    const epicaCamarote =
        await prisma.eventSector.create({
            data: {
                eventId:
                    epicaEvent.id,

                sectorTemplateId:
                    sectorCamarote.id,

                capacity:
                    200,

                layoutRow:
                    2,

                layoutColumn:
                    1,
            },
        });

    const camaroteNormal =
        await prisma
            .eventSectorModality
            .create({
                data: {
                    eventSectorId:
                        epicaCamarote.id,

                    modalityTemplateId:
                        modalityNormal.id,

                    capacity:
                        50,

                    occupancyMode:
                        "SEAT",
                },
            });

    await createSeats(
        camaroteNormal.id,
        camaroteNormal.capacity
    );

    const camaroteNormalInteira =
        await createTicketCategory(
            camaroteNormal.id,
            priceInteira.id
        );

    const camaroteNormalMeia =
        await createTicketCategory(
            camaroteNormal.id,
            priceMeia.id
        );

    const camaroteNormalSocial =
        await createTicketCategory(
            camaroteNormal.id,
            priceMeiaSocial.id
        );

    await createBatch(
        camaroteNormal.id,
        "LOTE 1",
        1,
        50,
        [
            {
                categoryId:
                    camaroteNormalInteira.id,
                priceInCents:
                    40000,
            },
            {
                categoryId:
                    camaroteNormalMeia.id,
                priceInCents:
                    20000,
            },
            {
                categoryId:
                    camaroteNormalSocial.id,
                priceInCents:
                    24000,
            },
        ]
    );

    const camaroteOpenBar =
        await prisma
            .eventSectorModality
            .create({
                data: {
                    eventSectorId:
                        epicaCamarote.id,

                    modalityTemplateId:
                        modalityOpenBar.id,

                    capacity:
                        50,

                    occupancyMode:
                        "SEAT",
                },
            });

    await createSeats(
        camaroteOpenBar.id,
        camaroteOpenBar.capacity
    );

    const camaroteOpenBarInteira =
        await createTicketCategory(
            camaroteOpenBar.id,
            priceInteira.id
        );

    const camaroteOpenBarMeia =
        await createTicketCategory(
            camaroteOpenBar.id,
            priceMeia.id
        );

    const camaroteOpenBarSocial =
        await createTicketCategory(
            camaroteOpenBar.id,
            priceMeiaSocial.id
        );

    await createBatch(
        camaroteOpenBar.id,
        "LOTE 1",
        1,
        50,
        [
            {
                categoryId:
                    camaroteOpenBarInteira.id,
                priceInCents:
                    50000,
            },
            {
                categoryId:
                    camaroteOpenBarMeia.id,
                priceInCents:
                    25000,
            },
            {
                categoryId:
                    camaroteOpenBarSocial.id,
                priceInCents:
                    29000,
            },
        ]
    );

    const camaroteOpenFood =
        await prisma
            .eventSectorModality
            .create({
                data: {
                    eventSectorId:
                        epicaCamarote.id,

                    modalityTemplateId:
                        modalityOpenFood.id,

                    capacity:
                        50,

                    occupancyMode:
                        "SEAT",
                },
            });

    await createSeats(
        camaroteOpenFood.id,
        camaroteOpenFood.capacity
    );

    const camaroteOpenFoodInteira =
        await createTicketCategory(
            camaroteOpenFood.id,
            priceInteira.id
        );

    const camaroteOpenFoodMeia =
        await createTicketCategory(
            camaroteOpenFood.id,
            priceMeia.id
        );

    const camaroteOpenFoodSocial =
        await createTicketCategory(
            camaroteOpenFood.id,
            priceMeiaSocial.id
        );

    await createBatch(
        camaroteOpenFood.id,
        "LOTE 1",
        1,
        50,
        [
            {
                categoryId:
                    camaroteOpenFoodInteira.id,
                priceInCents:
                    50000,
            },
            {
                categoryId:
                    camaroteOpenFoodMeia.id,
                priceInCents:
                    25000,
            },
            {
                categoryId:
                    camaroteOpenFoodSocial.id,
                priceInCents:
                    29000,
            },
        ]
    );

    const camaroteOpenBarFood =
        await prisma
            .eventSectorModality
            .create({
                data: {
                    eventSectorId:
                        epicaCamarote.id,

                    modalityTemplateId:
                        modalityOpenBarFood.id,

                    capacity:
                        50,

                    occupancyMode:
                        "SEAT",
                },
            });

    await createSeats(
        camaroteOpenBarFood.id,
        camaroteOpenBarFood.capacity
    );

    const camaroteOpenBarFoodInteira =
        await createTicketCategory(
            camaroteOpenBarFood.id,
            priceInteira.id
        );

    const camaroteOpenBarFoodMeia =
        await createTicketCategory(
            camaroteOpenBarFood.id,
            priceMeia.id
        );

    const camaroteOpenBarFoodSocial =
        await createTicketCategory(
            camaroteOpenBarFood.id,
            priceMeiaSocial.id
        );

    await createBatch(
        camaroteOpenBarFood.id,
        "LOTE 1",
        1,
        50,
        [
            {
                categoryId:
                    camaroteOpenBarFoodInteira.id,
                priceInCents:
                    60000,
            },
            {
                categoryId:
                    camaroteOpenBarFoodMeia.id,
                priceInCents:
                    30000,
            },
            {
                categoryId:
                    camaroteOpenBarFoodSocial.id,
                priceInCents:
                    34000,
            },
        ]
    );

    const epicaSuperior =
        await prisma.eventSector.create({
            data: {
                eventId:
                    epicaEvent.id,

                sectorTemplateId:
                    sectorCadeiraSuperior.id,

                capacity:
                    500,

                layoutRow:
                    4,

                layoutColumn:
                    1,
            },
        });

    const superiorNormal =
        await prisma
            .eventSectorModality
            .create({
                data: {
                    eventSectorId:
                        epicaSuperior.id,

                    modalityTemplateId:
                        modalityNormal.id,

                    capacity:
                        500,

                    occupancyMode:
                        "SEAT",
                },
            });

    await createSeats(
        superiorNormal.id,
        superiorNormal.capacity
    );

    const superiorInteira =
        await createTicketCategory(
            superiorNormal.id,
            priceInteira.id
        );

    const superiorMeia =
        await createTicketCategory(
            superiorNormal.id,
            priceMeia.id
        );

    const superiorSocial =
        await createTicketCategory(
            superiorNormal.id,
            priceMeiaSocial.id
        );

    await createBatch(
        superiorNormal.id,
        "LOTE 1",
        1,
        250,
        [
            {
                categoryId:
                    superiorInteira.id,
                priceInCents:
                    30000,
            },
            {
                categoryId:
                    superiorMeia.id,
                priceInCents:
                    15000,
            },
            {
                categoryId:
                    superiorSocial.id,
                priceInCents:
                    18000,
            },
        ]
    );

    await createBatch(
        superiorNormal.id,
        "LOTE 2",
        2,
        250,
        [
            {
                categoryId:
                    superiorInteira.id,
                priceInCents:
                    34000,
            },
            {
                categoryId:
                    superiorMeia.id,
                priceInCents:
                    17000,
            },
            {
                categoryId:
                    superiorSocial.id,
                priceInCents:
                    20000,
            },
        ]
    );

    const epicaInferior =
        await prisma.eventSector.create({
            data: {
                eventId:
                    epicaEvent.id,

                sectorTemplateId:
                    sectorCadeiraInferior.id,

                capacity:
                    500,

                layoutRow:
                    3,

                layoutColumn:
                    1,
            },
        });

    const inferiorNormal =
        await prisma
            .eventSectorModality
            .create({
                data: {
                    eventSectorId:
                        epicaInferior.id,

                    modalityTemplateId:
                        modalityNormal.id,

                    capacity:
                        500,

                    occupancyMode:
                        "SEAT",
                },
            });

    await createSeats(
        inferiorNormal.id,
        inferiorNormal.capacity
    );

    const inferiorInteira =
        await createTicketCategory(
            inferiorNormal.id,
            priceInteira.id
        );

    const inferiorMeia =
        await createTicketCategory(
            inferiorNormal.id,
            priceMeia.id
        );

    const inferiorSocial =
        await createTicketCategory(
            inferiorNormal.id,
            priceMeiaSocial.id
        );

    await createBatch(
        inferiorNormal.id,
        "LOTE 1",
        1,
        250,
        [
            {
                categoryId:
                    inferiorInteira.id,
                priceInCents:
                    36000,
            },
            {
                categoryId:
                    inferiorMeia.id,
                priceInCents:
                    18000,
            },
            {
                categoryId:
                    inferiorSocial.id,
                priceInCents:
                    21000,
            },
        ]
    );

    await createBatch(
        inferiorNormal.id,
        "LOTE 2",
        2,
        250,
        [
            {
                categoryId:
                    inferiorInteira.id,
                priceInCents:
                    40000,
            },
            {
                categoryId:
                    inferiorMeia.id,
                priceInCents:
                    20000,
            },
            {
                categoryId:
                    inferiorSocial.id,
                priceInCents:
                    23000,
            },
        ]
    );

    // ==================================================
    // EVENTO 3 — HAROLD SCHECHTER
    // ==================================================

    const bookEvent =
        await prisma.event.create({
            data: {
                id:
                    "seed-event-book",

                title:
                    "Lançamento e Autógrafos - Enciclopédia Serial Killers: A Maldade de A a Z",

                description:
                    "Sessão especial de lançamento do livro, com autógrafos e fotos com Harold Schechter.",

                source:
                    "LOCAL",

                capacity:
                    250,

                venueName:
                    "Livraria Boraí",

                city:
                    "Brasília",

                state:
                    "DF",

                country:
                    "BR",

                dateTime:
                    new Date(
                        "2026-10-25T17:00:00"
                    ),

                status:
                    "PUBLISHED",

                organizerId:
                    organizer.id,

                categoryTemplateId:
                    categoryLiterature.id,
            },
        });

    const bookSector =
        await prisma.eventSector.create({
            data: {
                eventId:
                    bookEvent.id,

                sectorTemplateId:
                    sectorEntradaGeral.id,

                capacity:
                    250,

                layoutRow:
                    1,

                layoutColumn:
                    1,
            },
        });

    const autographBook =
        await prisma
            .eventSectorModality
            .create({
                data: {
                    eventSectorId:
                        bookSector.id,

                    modalityTemplateId:
                        modalityAutografoLivro.id,

                    capacity:
                        150,

                    occupancyMode:
                        "QUANTITY",
                },
            });

    const autographBookPrice =
        await createTicketCategory(
            autographBook.id,
            priceValorUnico.id
        );

    await createBatch(
        autographBook.id,
        "LOTE 1",
        1,
        150,
        [
            {
                categoryId:
                    autographBookPrice.id,
                priceInCents:
                    18000,
            },
        ]
    );

    const autographPhoto =
        await prisma
            .eventSectorModality
            .create({
                data: {
                    eventSectorId:
                        bookSector.id,

                    modalityTemplateId:
                        modalityAutografoFotoLivro.id,

                    capacity:
                        100,

                    occupancyMode:
                        "QUANTITY",
                },
            });

    const autographPhotoPrice =
        await createTicketCategory(
            autographPhoto.id,
            priceValorUnico.id
        );

    await createBatch(
        autographPhoto.id,
        "LOTE 1",
        1,
        100,
        [
            {
                categoryId:
                    autographPhotoPrice.id,
                priceInCents:
                    25000,
            },
        ]
    );

    // ==================================================
    // EVENTO 4 — CINEMA
    // ==================================================

    const movieEvent =
        await prisma.event.create({
            data: {
                id:
                    "seed-event-movie",

                title:
                    "Amanhecer - Parte 1 | Relançamento",

                description:
                    "Sessão especial de relançamento de Amanhecer - Parte 1.",

                source:
                    "LOCAL",

                capacity:
                    120,

                venueName:
                    "Cinema Boraí",

                city:
                    "Fortaleza",

                state:
                    "CE",

                country:
                    "BR",

                dateTime:
                    new Date(
                        "2026-11-20T19:30:00"
                    ),

                status:
                    "PUBLISHED",

                organizerId:
                    organizer.id,

                categoryTemplateId:
                    categoryCinema.id,
            },
        });

    const movieSector =
        await prisma.eventSector.create({
            data: {
                eventId:
                    movieEvent.id,

                sectorTemplateId:
                    sectorSalaCinema.id,

                capacity:
                    120,

                layoutRow:
                    1,

                layoutColumn:
                    1,
            },
        });

    const movieNormal =
        await prisma
            .eventSectorModality
            .create({
                data: {
                    eventSectorId:
                        movieSector.id,

                    modalityTemplateId:
                        modalityNormal.id,

                    capacity:
                        120,

                    occupancyMode:
                        "SEAT",
                },
            });

    await createSeats(
        movieNormal.id,
        movieNormal.capacity
    );

    const movieInteira =
        await createTicketCategory(
            movieNormal.id,
            priceInteira.id
        );

    const movieMeia =
        await createTicketCategory(
            movieNormal.id,
            priceMeia.id
        );

    const movieSocial =
        await createTicketCategory(
            movieNormal.id,
            priceMeiaSocial.id
        );

    await createBatch(
        movieNormal.id,
        "LOTE 1",
        1,
        120,
        [
            {
                categoryId:
                    movieInteira.id,
                priceInCents:
                    4000,
            },
            {
                categoryId:
                    movieMeia.id,
                priceInCents:
                    2000,
            },
            {
                categoryId:
                    movieSocial.id,
                priceInCents:
                    2400,
            },
        ]
    );

    // ==================================================
    // RESUMO
    // ==================================================

    const seatCount =
        await prisma.seat.count();

    console.log("");
    console.log(
        "Seeds inseridos com sucesso."
    );

    console.log("");
    console.log(
        "USUÁRIOS:"
    );
    console.log(
        "- 1 Organizador"
    );
    console.log(
        "- 2 Clientes"
    );
    console.log(
        "- 1 Portaria"
    );

    console.log("");
    console.log(
        "EVENTOS:"
    );
    console.log(
        "- Filhos do Éden: Paraíso Perdido | TEATRO"
    );
    console.log(
        "- Epica - Live in Brazil | SHOWS E FESTAS"
    );
    console.log(
        "- Lançamento e Autógrafos - Harold Schechter | LITERATURA"
    );
    console.log(
        "- Amanhecer - Parte 1 | CINEMA"
    );

    console.log("");
    console.log(
        `Assentos cadastrados: ${seatCount}`
    );

    console.log(
        "MEIA + MEIA SOCIAL compartilham limite máximo de 50%."
    );

    console.log(
        "INTEIRA não possui cota reservada."
    );

    console.log(
        "Taxa de serviço padrão do Boraí: 12%."
    );

    console.log("");
}

// ======================================================
// EXECUÇÃO
// ======================================================

main()
    .catch((error) => {
        console.error(
            "Erro ao executar seeds:",
            error
        );

        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });