import prisma from "../lib/prisma.js";

function normalizeName(
    value
) {
    return String(value)
        .trim()
        .toLowerCase()
        .normalize("NFD")
        .replace(
            /[\u0300-\u036f]/g,
            ""
        );
}

// ======================================================
// CRIAR TEMPLATE DE SETOR
// ======================================================

export async function createSectorTemplate(
    req,
    res
) {
    try {
        const {
            name,
        } = req.body;

        const trimmedName =
            String(
                name || ""
            ).trim();

        if (!trimmedName) {
            return res.status(400).json({
                message:
                    "Informe o nome do setor.",
            });
        }

        const normalizedName =
            normalizeName(
                trimmedName
            );

        const existingTemplate =
            await prisma
                .sectorTemplate
                .findUnique({
                    where: {
                        normalizedName,
                    },
                });

        if (existingTemplate) {
            return res.status(409).json({
                message:
                    "Já existe um setor com este nome.",
                sectorTemplate:
                    existingTemplate,
            });
        }

        const sectorTemplate =
            await prisma
                .sectorTemplate
                .create({
                    data: {
                        name:
                            trimmedName,
                        normalizedName,
                    },
                });

        return res.status(201).json({
            message:
                "Setor criado com sucesso.",
            sectorTemplate,
        });
    } catch (error) {
        if (
            error.code ===
            "P2002"
        ) {
            return res.status(409).json({
                message:
                    "Já existe um setor com este nome.",
            });
        }

        console.error(
            "Erro ao criar template de setor:",
            error
        );

        return res.status(500).json({
            message:
                "Erro interno do servidor.",
        });
    }
}

// ======================================================
// CRIAR TEMPLATE DE MODALIDADE
// ======================================================

export async function createModalityTemplate(
    req,
    res
) {
    try {
        const {
            name,
        } = req.body;

        const trimmedName =
            String(
                name || ""
            ).trim();

        if (!trimmedName) {
            return res.status(400).json({
                message:
                    "Informe o nome da modalidade.",
            });
        }

        const normalizedName =
            normalizeName(
                trimmedName
            );

        const existingTemplate =
            await prisma
                .modalityTemplate
                .findUnique({
                    where: {
                        normalizedName,
                    },
                });

        if (existingTemplate) {
            return res.status(409).json({
                message:
                    "Já existe uma modalidade com este nome.",
                modalityTemplate:
                    existingTemplate,
            });
        }

        const modalityTemplate =
            await prisma
                .modalityTemplate
                .create({
                    data: {
                        name:
                            trimmedName,
                        normalizedName,
                    },
                });

        return res.status(201).json({
            message:
                "Modalidade criada com sucesso.",
            modalityTemplate,
        });
    } catch (error) {
        if (
            error.code ===
            "P2002"
        ) {
            return res.status(409).json({
                message:
                    "Já existe uma modalidade com este nome.",
            });
        }

        console.error(
            "Erro ao criar template de modalidade:",
            error
        );

        return res.status(500).json({
            message:
                "Erro interno do servidor.",
        });
    }
}

// ======================================================
// BUSCAR CONFIGURAÇÃO COMPLETA DO EVENTO
// ======================================================

export async function getEventConfiguration(
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
                    organizerId:
                        req.user.id,
                },

                select: {
                    id: true,
                    title: true,
                    capacity: true,
                    status: true,

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

                                    ticketCategories: {
                                        orderBy: {
                                            createdAt:
                                                "asc",
                                        },

                                        select: {
                                            id: true,

                                            priceCategoryTemplate: {
                                                select: {
                                                    id: true,
                                                    name: true,
                                                    normalizedName:
                                                        true,
                                                },
                                            },
                                        },
                                    },

                                    batches: {
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
                                            isActive:
                                                true,

                                            prices: {
                                                select: {
                                                    id: true,
                                                    priceInCents:
                                                        true,
                                                    eventTicketCategoryId:
                                                        true,

                                                    eventTicketCategory: {
                                                        select: {
                                                            priceCategoryTemplate: {
                                                                select: {
                                                                    id: true,
                                                                    name: true,
                                                                },
                                                            },
                                                        },
                                                    },
                                                },
                                            },
                                        },
                                    },

                                    seats: {
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
            "Erro ao buscar configuração do evento:",
            error
        );

        return res.status(500).json({
            message:
                "Erro interno do servidor.",
        });
    }
}

// ======================================================
// CRIAR SETOR
// ======================================================

export async function createEventSector(
    req,
    res
) {
    try {
        const { eventId } =
            req.params;

        const {
            sectorTemplateId,
            capacity,
        } = req.body;

        const parsedCapacity =
            Number(capacity);

        if (
            !sectorTemplateId ||
            !Number.isInteger(
                parsedCapacity
            ) ||
            parsedCapacity <= 0
        ) {
            return res.status(400).json({
                message:
                    "Informe setor e capacidade válidos.",
            });
        }

        const event =
            await prisma.event.findFirst({
                where: {
                    id: eventId,
                    organizerId:
                        req.user.id,
                    status: "DRAFT",
                },

                include: {
                    sectors: {
                        select: {
                            capacity: true,
                        },
                    },
                },
            });

        if (!event) {
            return res.status(404).json({
                message:
                    "Evento em rascunho não encontrado.",
            });
        }

        const usedCapacity =
            event.sectors.reduce(
                (total, sector) =>
                    total +
                    sector.capacity,
                0
            );

        if (
            usedCapacity +
                parsedCapacity >
            event.capacity
        ) {
            return res.status(400).json({
                message:
                    "A capacidade dos setores não pode ultrapassar a capacidade do evento.",
            });
        }

        const existingSector =
            await prisma.eventSector
                .findFirst({
                    where: {
                        eventId,
                        sectorTemplateId,
                    },
                });

        if (existingSector) {
            return res.status(409).json({
                message:
                    "Este setor já foi adicionado ao evento.",
            });
        }

        const sector =
            await prisma.eventSector.create({
                data: {
                    eventId,
                    sectorTemplateId,
                    capacity:
                        parsedCapacity,
                },

                include: {
                    sectorTemplate:
                        true,
                },
            });

        return res.status(201).json({
            message:
                "Setor criado com sucesso.",
            sector,
        });
    } catch (error) {
        console.error(
            "Erro ao criar setor:",
            error
        );

        return res.status(500).json({
            message:
                "Erro interno do servidor.",
        });
    }
}

// ======================================================
// CRIAR MODALIDADE
// ======================================================

export async function createSectorModality(
    req,
    res
) {
    try {
        const {
            eventId,
            sectorId,
        } = req.params;

        const {
            modalityTemplateId,
            capacity,
            occupancyMode,
        } = req.body;

        const parsedCapacity =
            Number(capacity);

        if (
            !modalityTemplateId ||
            !Number.isInteger(
                parsedCapacity
            ) ||
            parsedCapacity <= 0 ||
            ![
                "QUANTITY",
                "SEAT",
            ].includes(
                occupancyMode
            )
        ) {
            return res.status(400).json({
                message:
                    "Informe modalidade, capacidade e tipo válidos.",
            });
        }

        const sector =
            await prisma.eventSector
                .findFirst({
                    where: {
                        id: sectorId,
                        eventId,

                        event: {
                            organizerId:
                                req.user.id,
                            status:
                                "DRAFT",
                        },
                    },

                    include: {
                        modalities: {
                            select: {
                                capacity:
                                    true,
                            },
                        },
                    },
                });

        if (!sector) {
            return res.status(404).json({
                message:
                    "Setor não encontrado.",
            });
        }

        const usedCapacity =
            sector.modalities.reduce(
                (
                    total,
                    modality
                ) =>
                    total +
                    modality.capacity,
                0
            );

        if (
            usedCapacity +
                parsedCapacity >
            sector.capacity
        ) {
            return res.status(400).json({
                message:
                    "A capacidade das modalidades não pode ultrapassar a capacidade do setor.",
            });
        }

        const existing =
            await prisma
                .eventSectorModality
                .findFirst({
                    where: {
                        eventSectorId:
                            sectorId,
                        modalityTemplateId,
                    },
                });

        if (existing) {
            return res.status(409).json({
                message:
                    "Esta modalidade já existe neste setor.",
            });
        }

        const modality =
            await prisma
                .eventSectorModality
                .create({
                    data: {
                        eventSectorId:
                            sectorId,
                        modalityTemplateId,
                        capacity:
                            parsedCapacity,
                        occupancyMode,
                    },

                    include: {
                        modalityTemplate:
                            true,
                    },
                });

        return res.status(201).json({
            message:
                "Modalidade criada com sucesso.",
            modality,
        });
    } catch (error) {
        console.error(
            "Erro ao criar modalidade:",
            error
        );

        return res.status(500).json({
            message:
                "Erro interno do servidor.",
        });
    }
}

// ======================================================
// CRIAR CATEGORIA DE PREÇO
// ======================================================

export async function createTicketCategory(
    req,
    res
) {
    try {
        const {
            eventId,
            modalityId,
        } = req.params;

        const {
            priceCategoryTemplateId,
        } = req.body;

        if (
            !priceCategoryTemplateId
        ) {
            return res.status(400).json({
                message:
                    "Informe a categoria de preço.",
            });
        }

        const modality =
            await prisma
                .eventSectorModality
                .findFirst({
                    where: {
                        id: modalityId,

                        eventSector: {
                            eventId,

                            event: {
                                organizerId:
                                    req.user.id,
                                status:
                                    "DRAFT",
                            },
                        },
                    },
                });

        if (!modality) {
            return res.status(404).json({
                message:
                    "Modalidade não encontrada.",
            });
        }

        const existing =
            await prisma
                .eventTicketCategory
                .findFirst({
                    where: {
                        eventSectorModalityId:
                            modalityId,
                        priceCategoryTemplateId,
                    },
                });

        if (existing) {
            return res.status(409).json({
                message:
                    "Esta categoria já foi adicionada à modalidade.",
            });
        }

        const category =
            await prisma
                .eventTicketCategory
                .create({
                    data: {
                        eventSectorModalityId:
                            modalityId,
                        priceCategoryTemplateId,
                    },

                    include: {
                        priceCategoryTemplate:
                            true,
                    },
                });

        return res.status(201).json({
            message:
                "Categoria criada com sucesso.",
            category,
        });
    } catch (error) {
        console.error(
            "Erro ao criar categoria:",
            error
        );

        return res.status(500).json({
            message:
                "Erro interno do servidor.",
        });
    }
}

// ======================================================
// CRIAR LOTE
// ======================================================

export async function createTicketBatch(
    req,
    res
) {
    try {
        const {
            eventId,
            modalityId,
        } = req.params;

        const {
            name,
            sequence,
            quantity,
            prices,
        } = req.body;

        const parsedSequence =
            Number(sequence);

        const parsedQuantity =
            Number(quantity);

        if (
            !name?.trim() ||
            !Number.isInteger(
                parsedSequence
            ) ||
            parsedSequence <= 0 ||
            !Number.isInteger(
                parsedQuantity
            ) ||
            parsedQuantity <= 0 ||
            !Array.isArray(
                prices
            ) ||
            prices.length === 0
        ) {
            return res.status(400).json({
                message:
                    "Informe os dados do lote corretamente.",
            });
        }

        const modality =
            await prisma
                .eventSectorModality
                .findFirst({
                    where: {
                        id: modalityId,

                        eventSector: {
                            eventId,

                            event: {
                                organizerId:
                                    req.user.id,
                                status:
                                    "DRAFT",
                            },
                        },
                    },

                    include: {
                        ticketCategories:
                            true,

                        batches: {
                            select: {
                                sequence:
                                    true,
                                quantity:
                                    true,
                            },
                        },
                    },
                });

        if (!modality) {
            return res.status(404).json({
                message:
                    "Modalidade não encontrada.",
            });
        }

        const existingSequence =
            modality.batches.some(
                (batch) =>
                    batch.sequence ===
                    parsedSequence
            );

        if (existingSequence) {
            return res.status(409).json({
                message:
                    "Já existe um lote com esta ordem.",
            });
        }

        const usedQuantity =
            modality.batches.reduce(
                (total, batch) =>
                    total +
                    batch.quantity,
                0
            );

        if (
            usedQuantity +
                parsedQuantity >
            modality.capacity
        ) {
            return res.status(400).json({
                message:
                    "A quantidade dos lotes não pode ultrapassar a capacidade da modalidade.",
            });
        }

        const categoryIds =
            new Set(
                modality
                    .ticketCategories
                    .map(
                        (category) =>
                            category.id
                    )
            );

        for (
            const price
            of prices
        ) {
            if (
                !categoryIds.has(
                    price.eventTicketCategoryId
                ) ||
                !Number.isInteger(
                    Number(
                        price.priceInCents
                    )
                ) ||
                Number(
                    price.priceInCents
                ) < 0
            ) {
                return res.status(400).json({
                    message:
                        "Existe uma categoria ou preço inválido no lote.",
                });
            }
        }

        const normalizedName =
            normalizeName(
                name
            );

        const existingName =
            await prisma.ticketBatch
                .findFirst({
                    where: {
                        eventSectorModalityId:
                            modalityId,
                        normalizedName,
                    },
                });

        if (existingName) {
            return res.status(409).json({
                message:
                    "Já existe um lote com este nome nesta modalidade.",
            });
        }

        const batch =
            await prisma.$transaction(
                async (
                    transaction
                ) => {
                    const createdBatch =
                        await transaction
                            .ticketBatch
                            .create({
                                data: {
                                    eventSectorModalityId:
                                        modalityId,

                                    name:
                                        name.trim(),

                                    normalizedName,

                                    sequence:
                                        parsedSequence,

                                    quantity:
                                        parsedQuantity,
                                },
                            });

                    await transaction
                        .ticketBatchPrice
                        .createMany({
                            data:
                                prices.map(
                                    (price) => ({
                                        ticketBatchId:
                                            createdBatch.id,

                                        eventTicketCategoryId:
                                            price.eventTicketCategoryId,

                                        priceInCents:
                                            Number(
                                                price.priceInCents
                                            ),
                                    })
                                ),
                        });

                    return createdBatch;
                }
            );

        return res.status(201).json({
            message:
                "Lote criado com sucesso.",
            batch,
        });
    } catch (error) {
        if (
            error.code ===
            "P2002"
        ) {
            return res.status(409).json({
                message:
                    "Já existe um lote com este nome ou ordem.",
            });
        }

        console.error(
            "Erro ao criar lote:",
            error
        );

        return res.status(500).json({
            message:
                "Erro interno do servidor.",
        });
    }
}

// ======================================================
// CRIAR ASSENTOS
// ======================================================

export async function createModalitySeats(
    req,
    res
) {
    try {
        const {
            eventId,
            modalityId,
        } = req.params;

        const {
            rowLabel,
            startNumber,
            quantity,
        } = req.body;

        const modality =
            await prisma
                .eventSectorModality
                .findFirst({
                    where: {
                        id: modalityId,

                        eventSector: {
                            eventId,

                            event: {
                                organizerId:
                                    req.user.id,
                                status:
                                    "DRAFT",
                            },
                        },
                    },

                    include: {
                        seats: {
                            select: {
                                id: true,
                                normalizedLabel:
                                    true,
                            },
                        },
                    },
                });

        if (!modality) {
            return res.status(404).json({
                message:
                    "Modalidade não encontrada.",
            });
        }

        if (
            modality.occupancyMode !==
            "SEAT"
        ) {
            return res.status(400).json({
                message:
                    "Assentos só podem ser criados em modalidades do tipo assento marcado.",
            });
        }

        const normalizedRow =
            String(
                rowLabel || ""
            )
                .trim()
                .toUpperCase();

        const parsedStartNumber =
            Number(startNumber);

        const parsedQuantity =
            Number(quantity);

        if (
            !normalizedRow ||
            !Number.isInteger(
                parsedStartNumber
            ) ||
            parsedStartNumber <= 0 ||
            !Number.isInteger(
                parsedQuantity
            ) ||
            parsedQuantity <= 0
        ) {
            return res.status(400).json({
                message:
                    "Informe fileira, número inicial e quantidade válidos.",
            });
        }

        const remainingCapacity =
            modality.capacity -
            modality.seats.length;

        if (
            parsedQuantity >
            remainingCapacity
        ) {
            return res.status(400).json({
                message:
                    `Só existem ${remainingCapacity} assentos disponíveis para configuração nesta modalidade.`,
            });
        }

        const existingLabels =
            new Set(
                modality.seats.map(
                    (seat) =>
                        seat.normalizedLabel
                )
            );

        const seatsToCreate =
            [];

        for (
            let index = 0;
            index < parsedQuantity;
            index += 1
        ) {
            const number =
                parsedStartNumber +
                index;

            const label =
                `${normalizedRow}${number}`;

            const normalizedLabel =
                normalizeName(
                    label
                );

            if (
                existingLabels.has(
                    normalizedLabel
                )
            ) {
                return res.status(409).json({
                    message:
                        `O assento ${label} já existe nesta modalidade.`,
                });
            }

            existingLabels.add(
                normalizedLabel
            );

            seatsToCreate.push({
                eventSectorModalityId:
                    modalityId,
                label,
                normalizedLabel,
            });
        }

        await prisma.$transaction(
            seatsToCreate.map(
                (seat) =>
                    prisma.seat.create({
                        data: seat,
                    })
            )
        );

        const seats =
            await prisma.seat.findMany({
                where: {
                    eventSectorModalityId:
                        modalityId,
                },

                orderBy: {
                    normalizedLabel:
                        "asc",
                },
            });

        return res.status(201).json({
            message:
                `${parsedQuantity} assento(s) criado(s) com sucesso.`,
            seats,
        });
    } catch (error) {
        if (
            error.code ===
            "P2002"
        ) {
            return res.status(409).json({
                message:
                    "Um ou mais assentos já existem nesta modalidade.",
            });
        }

        console.error(
            "Erro ao criar assentos:",
            error
        );

        return res.status(500).json({
            message:
                "Erro interno do servidor.",
        });
    }
}

// ======================================================
// EXCLUIR SETOR
// ======================================================

export async function deleteEventSector(
    req,
    res
) {
    try {
        const {
            eventId,
            sectorId,
        } = req.params;

        const sector =
            await prisma.eventSector
                .findFirst({
                    where: {
                        id: sectorId,
                        eventId,

                        event: {
                            organizerId:
                                req.user.id,
                            status:
                                "DRAFT",
                        },
                    },
                });

        if (!sector) {
            return res.status(404).json({
                message:
                    "Setor não encontrado em um evento em rascunho.",
            });
        }

        await prisma.eventSector.delete({
            where: {
                id: sectorId,
            },
        });

        return res.status(200).json({
            message:
                "Setor excluído com sucesso.",
        });
    } catch (error) {
        console.error(
            "Erro ao excluir setor:",
            error
        );

        return res.status(500).json({
            message:
                "Erro interno do servidor.",
        });
    }
}

// ======================================================
// EXCLUIR MODALIDADE
// ======================================================

export async function deleteSectorModality(
    req,
    res
) {
    try {
        const {
            eventId,
            modalityId,
        } = req.params;

        const modality =
            await prisma
                .eventSectorModality
                .findFirst({
                    where: {
                        id: modalityId,

                        eventSector: {
                            eventId,

                            event: {
                                organizerId:
                                    req.user.id,
                                status:
                                    "DRAFT",
                            },
                        },
                    },
                });

        if (!modality) {
            return res.status(404).json({
                message:
                    "Modalidade não encontrada em um evento em rascunho.",
            });
        }

        await prisma
            .eventSectorModality
            .delete({
                where: {
                    id: modalityId,
                },
            });

        return res.status(200).json({
            message:
                "Modalidade excluída com sucesso.",
        });
    } catch (error) {
        console.error(
            "Erro ao excluir modalidade:",
            error
        );

        return res.status(500).json({
            message:
                "Erro interno do servidor.",
        });
    }
}

// ======================================================
// EXCLUIR CATEGORIA
// ======================================================

export async function deleteTicketCategory(
    req,
    res
) {
    try {
        const {
            eventId,
            modalityId,
            categoryId,
        } = req.params;

        const category =
            await prisma
                .eventTicketCategory
                .findFirst({
                    where: {
                        id: categoryId,
                        eventSectorModalityId:
                            modalityId,

                        eventSectorModality: {
                            eventSector: {
                                eventId,

                                event: {
                                    organizerId:
                                        req.user.id,
                                    status:
                                        "DRAFT",
                                },
                            },
                        },
                    },
                });

        if (!category) {
            return res.status(404).json({
                message:
                    "Categoria não encontrada em um evento em rascunho.",
            });
        }

        await prisma
            .eventTicketCategory
            .delete({
                where: {
                    id: categoryId,
                },
            });

        return res.status(200).json({
            message:
                "Categoria excluída com sucesso.",
        });
    } catch (error) {
        console.error(
            "Erro ao excluir categoria:",
            error
        );

        return res.status(500).json({
            message:
                "Erro interno do servidor.",
        });
    }
}

// ======================================================
// EXCLUIR LOTE
// ======================================================

export async function deleteTicketBatch(
    req,
    res
) {
    try {
        const {
            eventId,
            modalityId,
            batchId,
        } = req.params;

        const batch =
            await prisma.ticketBatch
                .findFirst({
                    where: {
                        id: batchId,
                        eventSectorModalityId:
                            modalityId,

                        eventSectorModality: {
                            eventSector: {
                                eventId,

                                event: {
                                    organizerId:
                                        req.user.id,
                                    status:
                                        "DRAFT",
                                },
                            },
                        },
                    },
                });

        if (!batch) {
            return res.status(404).json({
                message:
                    "Lote não encontrado em um evento em rascunho.",
            });
        }

        await prisma.ticketBatch.delete({
            where: {
                id: batchId,
            },
        });

        return res.status(200).json({
            message:
                "Lote excluído com sucesso.",
        });
    } catch (error) {
        console.error(
            "Erro ao excluir lote:",
            error
        );

        return res.status(500).json({
            message:
                "Erro interno do servidor.",
        });
    }
}

// ======================================================
// EXCLUIR ASSENTO
// ======================================================

export async function deleteModalitySeat(
    req,
    res
) {
    try {
        const {
            eventId,
            modalityId,
            seatId,
        } = req.params;

        const seat =
            await prisma.seat.findFirst({
                where: {
                    id: seatId,
                    eventSectorModalityId:
                        modalityId,

                    eventSectorModality: {
                        eventSector: {
                            eventId,

                            event: {
                                organizerId:
                                    req.user.id,
                                status:
                                    "DRAFT",
                            },
                        },
                    },
                },
            });

        if (!seat) {
            return res.status(404).json({
                message:
                    "Assento não encontrado em um evento em rascunho.",
            });
        }

        await prisma.seat.delete({
            where: {
                id: seatId,
            },
        });

        return res.status(200).json({
            message:
                "Assento excluído com sucesso.",
        });
    } catch (error) {
        console.error(
            "Erro ao excluir assento:",
            error
        );

        return res.status(500).json({
            message:
                "Erro interno do servidor.",
        });
    }
}