import prisma from "../lib/prisma.js";

function validationError(
    res,
    message
) {
    return res
        .status(400)
        .json({
            message,
        });
}

function hasText(
    value
) {
    return Boolean(
        String(
            value || ""
        ).trim()
    );
}

export async function publishOrganizerEvent(
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

                include: {
                    categoryTemplate:
                        true,

                    sectors: {
                        include: {
                            sectorTemplate:
                                true,

                            modalities: {
                                include: {
                                    modalityTemplate:
                                        true,

                                    ticketCategories: {
                                        include: {
                                            priceCategoryTemplate:
                                                true,
                                        },
                                    },

                                    batches: {
                                        include: {
                                            prices:
                                                true,
                                        },
                                    },

                                    seats:
                                        true,
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
        // STATUS
        // ==================================================

        if (
            event.status !==
            "DRAFT"
        ) {
            return validationError(
                res,
                "Somente eventos em rascunho podem ser publicados."
            );
        }

        // ==================================================
        // DADOS BÁSICOS
        // ==================================================

        if (
            !hasText(
                event.title
            )
        ) {
            return validationError(
                res,
                "Informe o nome do evento antes de publicar."
            );
        }

        if (
            !event.categoryTemplateId ||
            !event.categoryTemplate
        ) {
            return validationError(
                res,
                "Selecione uma categoria para o evento antes de publicar."
            );
        }

        if (
            !Number.isInteger(
                event.capacity
            ) ||
            event.capacity <=
                0
        ) {
            return validationError(
                res,
                "Informe uma capacidade total válida antes de publicar o evento."
            );
        }

        if (
            !event.dateTime
        ) {
            return validationError(
                res,
                "Informe a data e a hora do evento antes de publicar."
            );
        }

        const eventDate =
            new Date(
                event.dateTime
            );

        if (
            Number.isNaN(
                eventDate.getTime()
            )
        ) {
            return validationError(
                res,
                "A data e a hora do evento são inválidas."
            );
        }

        if (
            !hasText(
                event.venueName
            )
        ) {
            return validationError(
                res,
                "Informe o local do evento antes de publicar."
            );
        }

        if (
            !hasText(
                event.city
            )
        ) {
            return validationError(
                res,
                "Informe a cidade do evento antes de publicar."
            );
        }

        if (
            !hasText(
                event.state
            )
        ) {
            return validationError(
                res,
                "Informe o estado do evento antes de publicar."
            );
        }

        if (
            !hasText(
                event.country
            )
        ) {
            return validationError(
                res,
                "Informe o país do evento antes de publicar."
            );
        }

        // ==================================================
        // SETORES
        // ==================================================

        if (
            event.sectors.length ===
            0
        ) {
            return validationError(
                res,
                "Adicione pelo menos um setor antes de publicar o evento."
            );
        }

        const sectorCapacity =
            event.sectors.reduce(
                (
                    total,
                    sector
                ) =>
                    total +
                    sector.capacity,
                0
            );

        if (
            sectorCapacity !==
            event.capacity
        ) {
            return validationError(
                res,
                `A capacidade configurada nos setores (${sectorCapacity}) deve ser igual à capacidade total do evento (${event.capacity}).`
            );
        }

        // ==================================================
        // MODALIDADES / CATEGORIAS / LOTES / ASSENTOS
        // ==================================================

        for (
            const sector
            of event.sectors
        ) {
            if (
                !sector.sectorTemplate
            ) {
                return validationError(
                    res,
                    "Existe um setor sem template associado."
                );
            }

            if (
                !Number.isInteger(
                    sector.capacity
                ) ||
                sector.capacity <=
                    0
            ) {
                return validationError(
                    res,
                    `O setor "${sector.sectorTemplate.name}" possui capacidade inválida.`
                );
            }

            if (
                sector.modalities.length ===
                0
            ) {
                return validationError(
                    res,
                    `O setor "${sector.sectorTemplate.name}" precisa possuir pelo menos uma modalidade.`
                );
            }

            const modalityCapacity =
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
                modalityCapacity !==
                sector.capacity
            ) {
                return validationError(
                    res,
                    `A capacidade das modalidades do setor "${sector.sectorTemplate.name}" deve totalizar ${sector.capacity}. Atualmente está em ${modalityCapacity}.`
                );
            }

            for (
                const modality
                of sector.modalities
            ) {
                if (
                    !modality.modalityTemplate
                ) {
                    return validationError(
                        res,
                        `Existe uma modalidade inválida no setor "${sector.sectorTemplate.name}".`
                    );
                }

                const modalityName =
                    `${sector.sectorTemplate.name} / ${modality.modalityTemplate.name}`;

                if (
                    !Number.isInteger(
                        modality.capacity
                    ) ||
                    modality.capacity <=
                        0
                ) {
                    return validationError(
                        res,
                        `A modalidade "${modalityName}" possui capacidade inválida.`
                    );
                }

                // ==========================================
                // CATEGORIAS
                // ==========================================

                if (
                    modality
                        .ticketCategories
                        .length ===
                    0
                ) {
                    return validationError(
                        res,
                        `A modalidade "${modalityName}" precisa possuir pelo menos uma categoria de preço.`
                    );
                }

                for (
                    const category
                    of modality.ticketCategories
                ) {
                    if (
                        !category
                            .priceCategoryTemplate
                    ) {
                        return validationError(
                            res,
                            `A modalidade "${modalityName}" possui uma categoria de preço inválida.`
                        );
                    }
                }

                // ==========================================
                // LOTES
                // ==========================================

                if (
                    modality.batches.length ===
                    0
                ) {
                    return validationError(
                        res,
                        `A modalidade "${modalityName}" precisa possuir pelo menos um lote.`
                    );
                }

                const batchQuantity =
                    modality.batches.reduce(
                        (
                            total,
                            batch
                        ) =>
                            total +
                            batch.quantity,
                        0
                    );

                if (
                    batchQuantity !==
                    modality.capacity
                ) {
                    return validationError(
                        res,
                        `Os lotes da modalidade "${modalityName}" devem totalizar ${modality.capacity} ingressos. Atualmente totalizam ${batchQuantity}.`
                    );
                }

                const orderedBatches =
                    [
                        ...modality.batches,
                    ].sort(
                        (
                            a,
                            b
                        ) =>
                            a.sequence -
                            b.sequence
                    );

                for (
                    let index =
                        0;
                    index <
                    orderedBatches.length;
                    index +=
                        1
                ) {
                    const batch =
                        orderedBatches[
                            index
                        ];

                    if (
                        !Number.isInteger(
                            batch.quantity
                        ) ||
                        batch.quantity <=
                            0
                    ) {
                        return validationError(
                            res,
                            `O lote "${batch.name}" da modalidade "${modalityName}" possui quantidade inválida.`
                        );
                    }

                    const expectedSequence =
                        index +
                        1;

                    if (
                        batch.sequence !==
                        expectedSequence
                    ) {
                        return validationError(
                            res,
                            `Os lotes da modalidade "${modalityName}" precisam possuir sequência contínua a partir de 1.`
                        );
                    }

                    // ======================================
                    // PREÇOS
                    // ======================================

                    if (
                        batch.prices.length !==
                        modality
                            .ticketCategories
                            .length
                    ) {
                        return validationError(
                            res,
                            `O lote "${batch.name}" da modalidade "${modalityName}" precisa possuir preço para todas as categorias.`
                        );
                    }

                    const priceCategoryIds =
                        new Set(
                            batch.prices.map(
                                (
                                    price
                                ) =>
                                    price.eventTicketCategoryId
                            )
                        );

                    if (
                        priceCategoryIds.size !==
                        modality
                            .ticketCategories
                            .length
                    ) {
                        return validationError(
                            res,
                            `O lote "${batch.name}" da modalidade "${modalityName}" possui categorias de preço duplicadas ou ausentes.`
                        );
                    }

                    for (
                        const price
                        of batch.prices
                    ) {
                        if (
                            !Number.isInteger(
                                price.priceInCents
                            ) ||
                            price.priceInCents <
                                0
                        ) {
                            return validationError(
                                res,
                                `O lote "${batch.name}" da modalidade "${modalityName}" possui preço inválido.`
                            );
                        }
                    }
                }

                // ==========================================
                // ASSENTOS
                // ==========================================

                if (
                    modality.occupancyMode ===
                    "SEAT"
                ) {
                    if (
                        modality.seats.length !==
                        modality.capacity
                    ) {
                        return validationError(
                            res,
                            `A modalidade "${modalityName}" possui ${modality.seats.length} assentos configurados, mas precisa possuir ${modality.capacity}.`
                        );
                    }

                    const seatLabels =
                        new Set(
                            modality.seats.map(
                                (
                                    seat
                                ) =>
                                    seat.normalizedLabel ||
                                    seat.label
                            )
                        );

                    if (
                        seatLabels.size !==
                        modality.seats.length
                    ) {
                        return validationError(
                            res,
                            `A modalidade "${modalityName}" possui assentos duplicados.`
                        );
                    }
                }
            }
        }

        // ==================================================
        // PUBLICAÇÃO
        // ==================================================

        const publishedEvent =
            await prisma.event.update({
                where: {
                    id:
                        eventId,
                },

                data: {
                    status:
                        "PUBLISHED",
                },

                select: {
                    id:
                        true,

                    title:
                        true,

                    status:
                        true,

                    capacity:
                        true,

                    dateTime:
                        true,

                    categoryTemplate: {
                        select: {
                            id:
                                true,

                            name:
                                true,
                        },
                    },
                },
            });

        return res
            .status(200)
            .json({
                message:
                    "Evento publicado com sucesso.",

                event:
                    publishedEvent,
            });
    } catch (
        error
    ) {
        console.error(
            "Erro ao publicar evento:",
            error
        );

        return res
            .status(500)
            .json({
                message:
                    "Erro interno do servidor ao publicar o evento.",
            });
    }
}