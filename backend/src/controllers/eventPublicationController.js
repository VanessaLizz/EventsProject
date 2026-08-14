import prisma from "../lib/prisma.js";

function validationError(
    res,
    message
) {
    return res.status(400).json({
        message,
    });
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
                    id: eventId,
                    organizerId:
                        req.user.id,
                },

                include: {
                    sectors: {
                        include: {
                            sectorTemplate: true,

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

                                    seats: true,
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

        if (
            event.status !==
            "DRAFT"
        ) {
            return validationError(
                res,
                "Somente eventos em rascunho podem ser publicados."
            );
        }

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

        for (
            const sector
            of event.sectors
        ) {
            if (
                sector.modalities
                    .length === 0
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
                const modalityName =
                    `${sector.sectorTemplate.name} / ${modality.modalityTemplate.name}`;

                if (
                    modality
                        .ticketCategories
                        .length === 0
                ) {
                    return validationError(
                        res,
                        `A modalidade "${modalityName}" precisa possuir pelo menos uma categoria de preço.`
                    );
                }

                if (
                    modality.batches
                        .length === 0
                ) {
                    return validationError(
                        res,
                        `A modalidade "${modalityName}" precisa possuir pelo menos um lote.`
                    );
                }

                const batchQuantity =
                    modality.batches
                        .reduce(
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

                for (
                    const batch
                    of modality.batches
                ) {
                    if (
                        batch.prices
                            .length !==
                        modality
                            .ticketCategories
                            .length
                    ) {
                        return validationError(
                            res,
                            `O lote "${batch.name}" da modalidade "${modalityName}" precisa possuir preço para todas as categorias.`
                        );
                    }
                }

                if (
                    modality
                        .occupancyMode ===
                    "SEAT"
                ) {
                    if (
                        modality.seats
                            .length !==
                        modality.capacity
                    ) {
                        return validationError(
                            res,
                            `A modalidade "${modalityName}" possui ${modality.seats.length} assentos configurados, mas precisa possuir ${modality.capacity}.`
                        );
                    }
                }
            }
        }

        const publishedEvent =
            await prisma.event.update({
                where: {
                    id: eventId,
                },

                data: {
                    status:
                        "PUBLISHED",
                },

                select: {
                    id: true,
                    title: true,
                    status: true,
                    capacity: true,
                    dateTime: true,
                },
            });

        return res.status(200).json({
            message:
                "Evento publicado com sucesso.",
            event:
                publishedEvent,
        });
    } catch (error) {
        console.error(
            "Erro ao publicar evento:",
            error
        );

        return res.status(500).json({
            message:
                "Erro interno do servidor ao publicar o evento.",
        });
    }
}