import {
    useCallback,
    useEffect,
    useState,
} from "react";

import {
    Link,
    useParams,
} from "react-router";

import {
    useAuth,
} from "../contexts/authContext.js";

import {
    createEventSector,
    createModalitySeats,
    createSectorModality,
    createTicketBatch,
    createTicketCategory,
    deleteEventSector,
    deleteModalitySeat,
    deleteSectorModality,
    deleteTicketBatch,
    deleteTicketCategory,
    getEventConfiguration,
    getEventTemplates,
    publishOrganizerEvent,
} from "../services/eventService.js";

import "./OrganizerEventConfigurationPage.css";

function formatMoneyInputToCents(value) {
    const normalized =
        String(value)
            .trim()
            .replace(",", ".");

    const number =
        Number(normalized);

    if (
        !Number.isFinite(number) ||
        number < 0
    ) {
        return null;
    }

    return Math.round(
        number * 100
    );
}

function formatPrice(cents) {
    return new Intl.NumberFormat(
        "pt-BR",
        {
            style: "currency",
            currency: "BRL",
        }
    ).format(
        cents / 100
    );
}

function getUsedBatchQuantity(
    modality
) {
    return (
        modality.batches || []
    ).reduce(
        (total, batch) =>
            total + batch.quantity,
        0
    );
}

function getNextSequence(
    modality
) {
    const batches =
        modality.batches || [];

    if (
        batches.length === 0
    ) {
        return 1;
    }

    return (
        Math.max(
            ...batches.map(
                (batch) =>
                    batch.sequence
            )
        ) + 1
    );
}

function getPercent(
    used,
    total
) {
    if (!total) {
        return 0;
    }

    return Math.min(
        100,
        Math.round(
            (used / total) * 100
        )
    );
}

function CapacityProgress({
    used,
    total,
}) {
    const percent =
        getPercent(
            used,
            total
        );

    return (
        <div className="event-config-progress">
            <div className="event-config-progress-copy">
                <span>
                    {used} / {total}
                </span>

                <strong>
                    {percent}%
                </strong>
            </div>

            <div className="event-config-progress-track">
                <span
                    style={{
                        width:
                            `${percent}%`,
                    }}
                />
            </div>
        </div>
    );
}

export default function OrganizerEventConfigurationPage() {
    const {
        eventId,
    } = useParams();

    const {
        token,
    } = useAuth();

    const [
        eventData,
        setEventData,
    ] = useState(null);

    const [
        templates,
        setTemplates,
    ] = useState(null);

    const [
        sectorForm,
        setSectorForm,
    ] = useState({
        sectorTemplateId: "",
        capacity: "",
    });

    const [
        modalityForms,
        setModalityForms,
    ] = useState({});

    const [
        categoryForms,
        setCategoryForms,
    ] = useState({});

    const [
        batchForms,
        setBatchForms,
    ] = useState({});

    const [
        priceForms,
        setPriceForms,
    ] = useState({});

    const [
        seatForms,
        setSeatForms,
    ] = useState({});

    const [
        isLoading,
        setIsLoading,
    ] = useState(true);

    const [
        isSaving,
        setIsSaving,
    ] = useState(false);

    const [
        isPublishing,
        setIsPublishing,
    ] = useState(false);

    const [
        error,
        setError,
    ] = useState("");

    const [
        success,
        setSuccess,
    ] = useState("");

    const loadData =
        useCallback(
            async () => {
                const [
                    configurationResponse,
                    templatesResponse,
                ] =
                    await Promise.all([
                        getEventConfiguration(
                            eventId,
                            token
                        ),

                        getEventTemplates(
                            token
                        ),
                    ]);

                setEventData(
                    configurationResponse.event
                );

                setTemplates(
                    templatesResponse
                );
            },
            [
                eventId,
                token,
            ]
        );

    useEffect(() => {
        let mounted =
            true;

        async function load() {
            try {
                await loadData();
            } catch (error) {
                if (mounted) {
                    setError(
                        error.message
                    );
                }
            } finally {
                if (mounted) {
                    setIsLoading(
                        false
                    );
                }
            }
        }

        load();

        return () => {
            mounted = false;
        };
    }, [loadData]);

    async function refresh(
        message
    ) {
        await loadData();

        setSuccess(
            message
        );

        setError("");
    }

    function getModalityForm(
        sectorId
    ) {
        return (
            modalityForms[
                sectorId
            ] || {
                modalityTemplateId:
                    "",
                capacity: "",
                occupancyMode:
                    "QUANTITY",
            }
        );
    }

    function updateModalityForm(
        sectorId,
        field,
        value
    ) {
        setModalityForms(
            (current) => ({
                ...current,

                [sectorId]: {
                    ...getModalityForm(
                        sectorId
                    ),

                    [field]:
                        value,
                },
            })
        );
    }

    function getCategoryForm(
        modalityId
    ) {
        return (
            categoryForms[
                modalityId
            ] || ""
        );
    }

    function getBatchForm(
        modalityId
    ) {
        return (
            batchForms[
                modalityId
            ] || {
                name: "",
                quantity: "",
            }
        );
    }

    function updateBatchForm(
        modalityId,
        field,
        value
    ) {
        setBatchForms(
            (current) => ({
                ...current,

                [modalityId]: {
                    ...getBatchForm(
                        modalityId
                    ),

                    [field]:
                        value,
                },
            })
        );
    }

    function getPriceForm(
        modalityId,
        categoryId
    ) {
        return (
            priceForms[
                modalityId
            ]?.[
                categoryId
            ] || ""
        );
    }

    function updatePriceForm(
        modalityId,
        categoryId,
        value
    ) {
        setPriceForms(
            (current) => ({
                ...current,

                [modalityId]: {
                    ...(
                        current[
                            modalityId
                        ] || {}
                    ),

                    [categoryId]:
                        value,
                },
            })
        );
    }

    function getSeatForm(
        modalityId
    ) {
        return (
            seatForms[
                modalityId
            ] || {
                rowLabel: "",
                startNumber:
                    "1",
                quantity: "",
            }
        );
    }

    function updateSeatForm(
        modalityId,
        field,
        value
    ) {
        setSeatForms(
            (current) => ({
                ...current,

                [modalityId]: {
                    ...getSeatForm(
                        modalityId
                    ),

                    [field]:
                        value,
                },
            })
        );
    }

    async function handleDelete(
        message,
        deleteAction,
        successMessage
    ) {
        const confirmed =
            window.confirm(
                message
            );

        if (!confirmed) {
            return;
        }

        setIsSaving(true);
        setError("");
        setSuccess("");

        try {
            await deleteAction();

            await refresh(
                successMessage
            );
        } catch (error) {
            setError(
                error.message
            );
        } finally {
            setIsSaving(
                false
            );
        }
    }

    function handleDeleteSector(
        sector
    ) {
        return handleDelete(
            `Excluir o setor "${sector.sectorTemplate?.name}"? Todas as configurações dentro dele também serão excluídas.`,
            () =>
                deleteEventSector(
                    eventId,
                    sector.id,
                    token
                ),
            "Setor excluído com sucesso."
        );
    }

    function handleDeleteModality(
        modality
    ) {
        return handleDelete(
            `Excluir a modalidade "${modality.modalityTemplate?.name}"? Categorias, lotes, preços e assentos vinculados também serão excluídos.`,
            () =>
                deleteSectorModality(
                    eventId,
                    modality.id,
                    token
                ),
            "Modalidade excluída com sucesso."
        );
    }

    function handleDeleteCategory(
        modality,
        category
    ) {
        return handleDelete(
            `Excluir a categoria "${category.priceCategoryTemplate?.name}"?`,
            () =>
                deleteTicketCategory(
                    eventId,
                    modality.id,
                    category.id,
                    token
                ),
            "Categoria excluída com sucesso."
        );
    }

    function handleDeleteBatch(
        modality,
        batch
    ) {
        return handleDelete(
            `Excluir o lote "${batch.name}"?`,
            () =>
                deleteTicketBatch(
                    eventId,
                    modality.id,
                    batch.id,
                    token
                ),
            "Lote excluído com sucesso."
        );
    }

    function handleDeleteSeat(
        modality,
        seat
    ) {
        return handleDelete(
            `Excluir o assento "${seat.label}"?`,
            () =>
                deleteModalitySeat(
                    eventId,
                    modality.id,
                    seat.id,
                    token
                ),
            "Assento excluído com sucesso."
        );
    }

    async function handleCreateSector(
        event
    ) {
        event.preventDefault();

        setIsSaving(true);
        setError("");
        setSuccess("");

        try {
            await createEventSector(
                eventId,
                {
                    sectorTemplateId:
                        sectorForm
                            .sectorTemplateId,

                    capacity:
                        Number(
                            sectorForm
                                .capacity
                        ),
                },
                token
            );

            setSectorForm({
                sectorTemplateId:
                    "",
                capacity: "",
            });

            await refresh(
                "Setor criado com sucesso."
            );
        } catch (error) {
            setError(
                error.message
            );
        } finally {
            setIsSaving(
                false
            );
        }
    }

    async function handleCreateModality(
        event,
        sector
    ) {
        event.preventDefault();

        const form =
            getModalityForm(
                sector.id
            );

        setIsSaving(true);
        setError("");
        setSuccess("");

        try {
            await createSectorModality(
                eventId,
                sector.id,
                {
                    modalityTemplateId:
                        form.modalityTemplateId,

                    capacity:
                        Number(
                            form.capacity
                        ),

                    occupancyMode:
                        form.occupancyMode,
                },
                token
            );

            setModalityForms(
                (current) => ({
                    ...current,

                    [sector.id]: {
                        modalityTemplateId:
                            "",
                        capacity:
                            "",
                        occupancyMode:
                            "QUANTITY",
                    },
                })
            );

            await refresh(
                "Modalidade criada com sucesso."
            );
        } catch (error) {
            setError(
                error.message
            );
        } finally {
            setIsSaving(
                false
            );
        }
    }

    async function handleCreateCategory(
        event,
        modality
    ) {
        event.preventDefault();

        const templateId =
            getCategoryForm(
                modality.id
            );

        setIsSaving(true);
        setError("");
        setSuccess("");

        try {
            await createTicketCategory(
                eventId,
                modality.id,
                {
                    priceCategoryTemplateId:
                        templateId,
                },
                token
            );

            setCategoryForms(
                (current) => ({
                    ...current,
                    [modality.id]:
                        "",
                })
            );

            await refresh(
                "Categoria criada com sucesso."
            );
        } catch (error) {
            setError(
                error.message
            );
        } finally {
            setIsSaving(
                false
            );
        }
    }

    async function handleCreateSeats(
        event,
        modality
    ) {
        event.preventDefault();

        const form =
            getSeatForm(
                modality.id
            );

        setIsSaving(true);
        setError("");
        setSuccess("");

        try {
            await createModalitySeats(
                eventId,
                modality.id,
                {
                    rowLabel:
                        form.rowLabel,

                    startNumber:
                        Number(
                            form.startNumber
                        ),

                    quantity:
                        Number(
                            form.quantity
                        ),
                },
                token
            );

            setSeatForms(
                (current) => ({
                    ...current,

                    [modality.id]: {
                        rowLabel: "",
                        startNumber:
                            "1",
                        quantity: "",
                    },
                })
            );

            await refresh(
                "Assentos adicionados com sucesso."
            );
        } catch (error) {
            setError(
                error.message
            );
        } finally {
            setIsSaving(
                false
            );
        }
    }

    async function handleCreateBatch(
        event,
        modality
    ) {
        event.preventDefault();

        const form =
            getBatchForm(
                modality.id
            );

        const prices =
            (
                modality
                    .ticketCategories ||
                []
            ).map(
                (category) => ({
                    eventTicketCategoryId:
                        category.id,

                    priceInCents:
                        formatMoneyInputToCents(
                            getPriceForm(
                                modality.id,
                                category.id
                            )
                        ),
                })
            );

        if (
            prices.some(
                (price) =>
                    price.priceInCents ===
                    null
            )
        ) {
            setError(
                "Informe preços válidos para todas as categorias."
            );

            return;
        }

        setIsSaving(true);
        setError("");
        setSuccess("");

        try {
            await createTicketBatch(
                eventId,
                modality.id,
                {
                    name:
                        form.name,

                    sequence:
                        getNextSequence(
                            modality
                        ),

                    quantity:
                        Number(
                            form.quantity
                        ),

                    prices,
                },
                token
            );

            setBatchForms(
                (current) => ({
                    ...current,

                    [modality.id]: {
                        name: "",
                        quantity:
                            "",
                    },
                })
            );

            setPriceForms(
                (current) => ({
                    ...current,

                    [modality.id]:
                        {},
                })
            );

            await refresh(
                "Lote criado com sucesso."
            );
        } catch (error) {
            setError(
                error.message
            );
        } finally {
            setIsSaving(
                false
            );
        }
    }

    async function handlePublishEvent() {
        const confirmed =
            window.confirm(
                `Publicar "${eventData.title}"?`
            );

        if (!confirmed) {
            return;
        }

        setIsPublishing(true);
        setError("");
        setSuccess("");

        try {
            const response =
                await publishOrganizerEvent(
                    eventId,
                    token
                );

            await loadData();

            setSuccess(
                response.message ||
                "Evento publicado com sucesso."
            );
        } catch (error) {
            setError(
                error.message ||
                "Não foi possível publicar o evento."
            );
        } finally {
            setIsPublishing(
                false
            );
        }
    }

    if (isLoading) {
        return (
            <main className="event-config-page">
                <div className="event-config-message">
                    Carregando configuração...
                </div>
            </main>
        );
    }

    if (
        !eventData ||
        !templates
    ) {
        return (
            <main className="event-config-page">
                <div className="event-config-error">
                    {error ||
                        "Não foi possível carregar o evento."}
                </div>
            </main>
        );
    }

    const sectorTemplates =
        templates.sectorTemplates ||
        templates.sectors ||
        [];

    const modalityTemplates =
        templates.modalityTemplates ||
        templates.modalities ||
        [];

    const priceCategoryTemplates =
        templates.priceCategoryTemplates ||
        templates.priceCategories ||
        [];

    const eventCapacityUsed =
        eventData.sectors.reduce(
            (
                total,
                sector
            ) =>
                total +
                sector.capacity,
            0
        );

    const eventRemainingCapacity =
        Math.max(
            0,
            eventData.capacity -
            eventCapacityUsed
        );

    const publicationProblems =
        [];

    if (
        eventData.sectors.length ===
        0
    ) {
        publicationProblems.push(
            "Adicione pelo menos um setor."
        );
    }

    if (
        eventCapacityUsed !==
        eventData.capacity
    ) {
        publicationProblems.push(
            `A capacidade dos setores deve totalizar ${eventData.capacity}. Atualmente está em ${eventCapacityUsed}.`
        );
    }

    for (
        const sector
        of eventData.sectors
    ) {
        const sectorUsed =
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
            sector.modalities.length ===
            0
        ) {
            publicationProblems.push(
                `O setor "${sector.sectorTemplate.name}" não possui modalidade.`
            );
        }

        if (
            sectorUsed !==
            sector.capacity
        ) {
            publicationProblems.push(
                `As modalidades do setor "${sector.sectorTemplate.name}" totalizam ${sectorUsed} de ${sector.capacity} lugares.`
            );
        }

        for (
            const modality
            of sector.modalities
        ) {
            const modalityName =
                `${sector.sectorTemplate.name} / ${modality.modalityTemplate.name}`;

            const usedQuantity =
                getUsedBatchQuantity(
                    modality
                );

            if (
                !modality
                    .ticketCategories ||
                modality
                    .ticketCategories
                    .length === 0
            ) {
                publicationProblems.push(
                    `"${modalityName}" não possui categoria de preço.`
                );
            }

            if (
                !modality.batches ||
                modality.batches
                    .length === 0
            ) {
                publicationProblems.push(
                    `"${modalityName}" não possui lote.`
                );
            }

            if (
                usedQuantity !==
                modality.capacity
            ) {
                publicationProblems.push(
                    `Os lotes de "${modalityName}" totalizam ${usedQuantity} de ${modality.capacity} ingressos.`
                );
            }

            if (
                modality
                    .occupancyMode ===
                    "SEAT" &&
                (
                    modality
                        .seats
                        ?.length ||
                    0
                ) !==
                    modality.capacity
            ) {
                publicationProblems.push(
                    `"${modalityName}" precisa possuir todos os ${modality.capacity} assentos configurados.`
                );
            }

            for (
                const batch
                of modality.batches ||
                []
            ) {
                if (
                    batch.prices.length !==
                    modality
                        .ticketCategories
                        .length
                ) {
                    publicationProblems.push(
                        `O lote "${batch.name}" de "${modalityName}" não possui preço para todas as categorias.`
                    );
                }
            }
        }
    }

    const canPublish =
        publicationProblems.length ===
            0 &&
        eventData.status ===
            "DRAFT";

    return (
        <main className="event-config-page">
            <Link
                to="/organizador"
                className="event-config-back"
            >
                ← Voltar ao painel
            </Link>

            <header className="event-config-header">
                <div>
                    <p className="event-config-eyebrow">
                        Configuração comercial
                    </p>

                    <h1>
                        {eventData.title}
                    </h1>

                    <p>
                        Configure setores,
                        modalidades, categorias,
                        lotes e assentos do evento.
                    </p>
                </div>

                <span className="event-config-status-pill">
                    {eventData.status ===
                    "DRAFT"
                        ? "Rascunho"
                        : eventData.status ===
                          "PUBLISHED"
                        ? "Publicado"
                        : eventData.status}
                </span>
            </header>

            <section className="event-config-summary">
                <div className="event-config-summary-card">
                    <span>
                        Capacidade máxima
                    </span>

                    <strong>
                        {eventData.capacity}
                    </strong>

                    <small>
                        lugares
                    </small>
                </div>

                <div className="event-config-summary-card">
                    <span>
                        Em uso
                    </span>

                    <strong>
                        {eventCapacityUsed}
                    </strong>

                    <small>
                        distribuídos
                    </small>
                </div>

                <div className="event-config-summary-card">
                    <span>
                        Disponível
                    </span>

                    <strong>
                        {eventRemainingCapacity}
                    </strong>

                    <small>
                        restantes
                    </small>
                </div>

                <div className="event-config-summary-card">
                    <span>
                        Setores
                    </span>

                    <strong>
                        {
                            eventData
                                .sectors
                                .length
                        }
                    </strong>

                    <small>
                        cadastrados
                    </small>
                </div>
            </section>

            <section className="event-config-overall-progress">
                <div className="event-config-progress-title">
                    <strong>
                        Distribuição da capacidade
                    </strong>

                    <span>
                        {eventCapacityUsed} /{" "}
                        {eventData.capacity} lugares
                    </span>
                </div>

                <CapacityProgress
                    used={
                        eventCapacityUsed
                    }
                    total={
                        eventData.capacity
                    }
                />
            </section>

            {error && (
                <div
                    className="event-config-error"
                    role="alert"
                >
                    {error}
                </div>
            )}

            {success && (
                <div className="event-config-success">
                    {success}
                </div>
            )}

            <section className="event-config-step">
                <div className="event-config-step-header">
                    <span className="event-config-step-number">
                        1
                    </span>

                    <div>
                        <h2>
                            Setores
                        </h2>

                        <p>
                            Distribua a capacidade
                            do evento e configure
                            os ingressos.
                        </p>
                    </div>
                </div>

                {eventData.status ===
                    "DRAFT" &&
                    eventRemainingCapacity >
                        0 && (
                        <details className="event-config-create-panel">
                            <summary>
                                + Adicionar setor
                            </summary>

                            <form
                                className="event-config-inline-form"
                                onSubmit={
                                    handleCreateSector
                                }
                            >
                                <label>
                                    Setor

                                    <select
                                        value={
                                            sectorForm
                                                .sectorTemplateId
                                        }
                                        onChange={(
                                            event
                                        ) =>
                                            setSectorForm(
                                                (
                                                    current
                                                ) => ({
                                                    ...current,

                                                    sectorTemplateId:
                                                        event
                                                            .target
                                                            .value,
                                                })
                                            )
                                        }
                                        required
                                    >
                                        <option value="">
                                            Selecione
                                        </option>

                                        {sectorTemplates.map(
                                            (
                                                template
                                            ) => (
                                                <option
                                                    key={
                                                        template.id
                                                    }
                                                    value={
                                                        template.id
                                                    }
                                                >
                                                    {
                                                        template.name
                                                    }
                                                </option>
                                            )
                                        )}
                                    </select>
                                </label>

                                <label>
                                    Capacidade

                                    <input
                                        type="number"
                                        min="1"
                                        max={
                                            eventRemainingCapacity
                                        }
                                        value={
                                            sectorForm
                                                .capacity
                                        }
                                        onChange={(
                                            event
                                        ) =>
                                            setSectorForm(
                                                (
                                                    current
                                                ) => ({
                                                    ...current,

                                                    capacity:
                                                        event
                                                            .target
                                                            .value,
                                                })
                                            )
                                        }
                                        required
                                    />
                                </label>

                                <button
                                    type="submit"
                                    disabled={
                                        isSaving
                                    }
                                >
                                    Adicionar setor
                                </button>
                            </form>
                        </details>
                    )}

                <div className="event-config-sector-list">
                    {eventData.sectors.map(
                        (sector) => {
                            const modalityForm =
                                getModalityForm(
                                    sector.id
                                );

                            const sectorUsed =
                                sector.modalities.reduce(
                                    (
                                        total,
                                        modality
                                    ) =>
                                        total +
                                        modality.capacity,
                                    0
                                );

                            const sectorRemaining =
                                Math.max(
                                    0,
                                    sector.capacity -
                                    sectorUsed
                                );

                            return (
                                <details
                                    className="event-config-sector"
                                    key={
                                        sector.id
                                    }
                                    open
                                >
                                    <summary className="event-config-sector-summary">
                                        <div>
                                            <span className="event-config-label">
                                                Setor
                                            </span>

                                            <h3>
                                                {
                                                    sector
                                                        .sectorTemplate
                                                        .name
                                                }
                                            </h3>
                                        </div>

                                        <div className="event-config-capacity-inline">
                                            <div>
                                                <span>
                                                    Capacidade
                                                </span>

                                                <strong>
                                                    {
                                                        sector.capacity
                                                    }
                                                </strong>
                                            </div>

                                            <div>
                                                <span>
                                                    Em uso
                                                </span>

                                                <strong>
                                                    {
                                                        sectorUsed
                                                    }
                                                </strong>
                                            </div>

                                            <div>
                                                <span>
                                                    Disponível
                                                </span>

                                                <strong>
                                                    {
                                                        sectorRemaining
                                                    }
                                                </strong>
                                            </div>
                                        </div>
                                    </summary>

                                    <div className="event-config-sector-body">
                                        <div className="event-config-action-row">
                                            <CapacityProgress
                                                used={
                                                    sectorUsed
                                                }
                                                total={
                                                    sector.capacity
                                                }
                                            />

                                            {eventData.status ===
                                                "DRAFT" && (
                                                <button
                                                    type="button"
                                                    className="event-config-delete-button"
                                                    disabled={
                                                        isSaving
                                                    }
                                                    onClick={() =>
                                                        handleDeleteSector(
                                                            sector
                                                        )
                                                    }
                                                >
                                                    Excluir setor
                                                </button>
                                            )}
                                        </div>

                                        {eventData.status ===
                                            "DRAFT" &&
                                            sectorRemaining >
                                                0 && (
                                                <details className="event-config-create-panel event-config-create-panel-small">
                                                    <summary>
                                                        + Adicionar modalidade
                                                    </summary>

                                                    <form
                                                        className="event-config-inline-form"
                                                        onSubmit={(
                                                            event
                                                        ) =>
                                                            handleCreateModality(
                                                                event,
                                                                sector
                                                            )
                                                        }
                                                    >
                                                        <label>
                                                            Modalidade

                                                            <select
                                                                value={
                                                                    modalityForm
                                                                        .modalityTemplateId
                                                                }
                                                                onChange={(
                                                                    event
                                                                ) =>
                                                                    updateModalityForm(
                                                                        sector.id,
                                                                        "modalityTemplateId",
                                                                        event
                                                                            .target
                                                                            .value
                                                                    )
                                                                }
                                                                required
                                                            >
                                                                <option value="">
                                                                    Selecione
                                                                </option>

                                                                {modalityTemplates.map(
                                                                    (
                                                                        template
                                                                    ) => (
                                                                        <option
                                                                            key={
                                                                                template.id
                                                                            }
                                                                            value={
                                                                                template.id
                                                                            }
                                                                        >
                                                                            {
                                                                                template.name
                                                                            }
                                                                        </option>
                                                                    )
                                                                )}
                                                            </select>
                                                        </label>

                                                        <label>
                                                            Capacidade

                                                            <input
                                                                type="number"
                                                                min="1"
                                                                max={
                                                                    sectorRemaining
                                                                }
                                                                value={
                                                                    modalityForm
                                                                        .capacity
                                                                }
                                                                onChange={(
                                                                    event
                                                                ) =>
                                                                    updateModalityForm(
                                                                        sector.id,
                                                                        "capacity",
                                                                        event
                                                                            .target
                                                                            .value
                                                                    )
                                                                }
                                                                required
                                                            />
                                                        </label>

                                                        <label>
                                                            Controle

                                                            <select
                                                                value={
                                                                    modalityForm
                                                                        .occupancyMode
                                                                }
                                                                onChange={(
                                                                    event
                                                                ) =>
                                                                    updateModalityForm(
                                                                        sector.id,
                                                                        "occupancyMode",
                                                                        event
                                                                            .target
                                                                            .value
                                                                    )
                                                                }
                                                            >
                                                                <option value="QUANTITY">
                                                                    Quantidade
                                                                </option>

                                                                <option value="SEAT">
                                                                    Assento marcado
                                                                </option>
                                                            </select>
                                                        </label>

                                                        <button
                                                            type="submit"
                                                            disabled={
                                                                isSaving
                                                            }
                                                        >
                                                            Adicionar
                                                        </button>
                                                    </form>
                                                </details>
                                            )}

                                        <div className="event-config-modality-list">
                                            {sector.modalities.map(
                                                (
                                                    modality
                                                ) => {
                                                    const usedQuantity =
                                                        getUsedBatchQuantity(
                                                            modality
                                                        );

                                                    const remainingQuantity =
                                                        Math.max(
                                                            0,
                                                            modality.capacity -
                                                            usedQuantity
                                                        );

                                                    const batchForm =
                                                        getBatchForm(
                                                            modality.id
                                                        );

                                                    const nextSequence =
                                                        getNextSequence(
                                                            modality
                                                        );

                                                    const configuredSeats =
                                                        modality
                                                            .seats
                                                            ?.length ||
                                                        0;

                                                    return (
                                                        <details
                                                            className="event-config-modality"
                                                            key={
                                                                modality.id
                                                            }
                                                        >
                                                            <summary className="event-config-modality-summary">
                                                                <div>
                                                                    <h4>
                                                                        {
                                                                            modality
                                                                                .modalityTemplate
                                                                                .name
                                                                        }
                                                                    </h4>

                                                                    <span className="event-config-mode-pill">
                                                                        {modality.occupancyMode ===
                                                                        "SEAT"
                                                                            ? "Assento marcado"
                                                                            : "Quantidade"}
                                                                    </span>
                                                                </div>

                                                                <div className="event-config-capacity-inline">
                                                                    <div>
                                                                        <span>
                                                                            Capacidade
                                                                        </span>

                                                                        <strong>
                                                                            {
                                                                                modality.capacity
                                                                            }
                                                                        </strong>
                                                                    </div>

                                                                    <div>
                                                                        <span>
                                                                            Em lotes
                                                                        </span>

                                                                        <strong>
                                                                            {
                                                                                usedQuantity
                                                                            }
                                                                        </strong>
                                                                    </div>

                                                                    <div>
                                                                        <span>
                                                                            Disponível
                                                                        </span>

                                                                        <strong>
                                                                            {
                                                                                remainingQuantity
                                                                            }
                                                                        </strong>
                                                                    </div>
                                                                </div>
                                                            </summary>

                                                            <div className="event-config-modality-body">
                                                                <div className="event-config-action-row">
                                                                    <CapacityProgress
                                                                        used={
                                                                            usedQuantity
                                                                        }
                                                                        total={
                                                                            modality.capacity
                                                                        }
                                                                    />

                                                                    {eventData.status ===
                                                                        "DRAFT" && (
                                                                        <button
                                                                            type="button"
                                                                            className="event-config-delete-button"
                                                                            disabled={
                                                                                isSaving
                                                                            }
                                                                            onClick={() =>
                                                                                handleDeleteModality(
                                                                                    modality
                                                                                )
                                                                            }
                                                                        >
                                                                            Excluir modalidade
                                                                        </button>
                                                                    )}
                                                                </div>

                                                                {modality.occupancyMode ===
                                                                    "SEAT" && (
                                                                    <section className="event-config-box">
                                                                        <div className="event-config-box-heading">
                                                                            <div>
                                                                                <h5>
                                                                                    Assentos
                                                                                </h5>

                                                                                <p>
                                                                                    {
                                                                                        configuredSeats
                                                                                    }{" "}
                                                                                    de{" "}
                                                                                    {
                                                                                        modality.capacity
                                                                                    }{" "}
                                                                                    configurados
                                                                                </p>
                                                                            </div>
                                                                        </div>

                                                                        <CapacityProgress
                                                                            used={
                                                                                configuredSeats
                                                                            }
                                                                            total={
                                                                                modality.capacity
                                                                            }
                                                                        />

                                                                        {eventData.status ===
                                                                            "DRAFT" &&
                                                                            configuredSeats <
                                                                                modality.capacity && (
                                                                                <form
                                                                                    className="event-config-inline-form event-config-seat-form"
                                                                                    onSubmit={(
                                                                                        event
                                                                                    ) =>
                                                                                        handleCreateSeats(
                                                                                            event,
                                                                                            modality
                                                                                        )
                                                                                    }
                                                                                >
                                                                                    <label>
                                                                                        Fileira

                                                                                        <input
                                                                                            value={
                                                                                                getSeatForm(
                                                                                                    modality.id
                                                                                                )
                                                                                                    .rowLabel
                                                                                            }
                                                                                            onChange={(
                                                                                                event
                                                                                            ) =>
                                                                                                updateSeatForm(
                                                                                                    modality.id,
                                                                                                    "rowLabel",
                                                                                                    event
                                                                                                        .target
                                                                                                        .value
                                                                                                )
                                                                                            }
                                                                                            placeholder="A"
                                                                                            required
                                                                                        />
                                                                                    </label>

                                                                                    <label>
                                                                                        Primeiro número

                                                                                        <input
                                                                                            type="number"
                                                                                            min="1"
                                                                                            value={
                                                                                                getSeatForm(
                                                                                                    modality.id
                                                                                                )
                                                                                                    .startNumber
                                                                                            }
                                                                                            onChange={(
                                                                                                event
                                                                                            ) =>
                                                                                                updateSeatForm(
                                                                                                    modality.id,
                                                                                                    "startNumber",
                                                                                                    event
                                                                                                        .target
                                                                                                        .value
                                                                                                )
                                                                                            }
                                                                                            required
                                                                                        />
                                                                                    </label>

                                                                                    <label>
                                                                                        Quantidade

                                                                                        <input
                                                                                            type="number"
                                                                                            min="1"
                                                                                            max={
                                                                                                modality.capacity -
                                                                                                configuredSeats
                                                                                            }
                                                                                            value={
                                                                                                getSeatForm(
                                                                                                    modality.id
                                                                                                )
                                                                                                    .quantity
                                                                                            }
                                                                                            onChange={(
                                                                                                event
                                                                                            ) =>
                                                                                                updateSeatForm(
                                                                                                    modality.id,
                                                                                                    "quantity",
                                                                                                    event
                                                                                                        .target
                                                                                                        .value
                                                                                                )
                                                                                            }
                                                                                            required
                                                                                        />
                                                                                    </label>

                                                                                    <button
                                                                                        type="submit"
                                                                                        disabled={
                                                                                            isSaving
                                                                                        }
                                                                                    >
                                                                                        Adicionar
                                                                                    </button>
                                                                                </form>
                                                                            )}

                                                                        {configuredSeats >
                                                                            0 && (
                                                                            <div className="event-config-tags">
                                                                                {modality.seats.map(
                                                                                    (
                                                                                        seat
                                                                                    ) => (
                                                                                        <span
                                                                                            className="event-config-removable-tag"
                                                                                            key={
                                                                                                seat.id
                                                                                            }
                                                                                        >
                                                                                            {
                                                                                                seat.label
                                                                                            }

                                                                                            {eventData.status ===
                                                                                                "DRAFT" && (
                                                                                                <button
                                                                                                    type="button"
                                                                                                    disabled={
                                                                                                        isSaving
                                                                                                    }
                                                                                                    onClick={() =>
                                                                                                        handleDeleteSeat(
                                                                                                            modality,
                                                                                                            seat
                                                                                                        )
                                                                                                    }
                                                                                                >
                                                                                                    ×
                                                                                                </button>
                                                                                            )}
                                                                                        </span>
                                                                                    )
                                                                                )}
                                                                            </div>
                                                                        )}
                                                                    </section>
                                                                )}

                                                                <section className="event-config-box">
                                                                    <div className="event-config-box-heading">
                                                                        <div>
                                                                            <h5>
                                                                                Categorias de preço
                                                                            </h5>

                                                                            <p>
                                                                                {
                                                                                    modality
                                                                                        .ticketCategories
                                                                                        ?.length ||
                                                                                    0
                                                                                }{" "}
                                                                                cadastradas
                                                                            </p>
                                                                        </div>
                                                                    </div>

                                                                    {modality
                                                                        .ticketCategories
                                                                        ?.length >
                                                                        0 && (
                                                                        <div className="event-config-tags">
                                                                            {modality.ticketCategories.map(
                                                                                (
                                                                                    category
                                                                                ) => (
                                                                                    <span
                                                                                        className="event-config-removable-tag"
                                                                                        key={
                                                                                            category.id
                                                                                        }
                                                                                    >
                                                                                        {
                                                                                            category
                                                                                                .priceCategoryTemplate
                                                                                                .name
                                                                                        }

                                                                                        {eventData.status ===
                                                                                            "DRAFT" && (
                                                                                            <button
                                                                                                type="button"
                                                                                                disabled={
                                                                                                    isSaving
                                                                                                }
                                                                                                onClick={() =>
                                                                                                    handleDeleteCategory(
                                                                                                        modality,
                                                                                                        category
                                                                                                    )
                                                                                                }
                                                                                            >
                                                                                                ×
                                                                                            </button>
                                                                                        )}
                                                                                    </span>
                                                                                )
                                                                            )}
                                                                        </div>
                                                                    )}

                                                                    {eventData.status ===
                                                                        "DRAFT" && (
                                                                        <form
                                                                            className="event-config-category-add"
                                                                            onSubmit={(
                                                                                event
                                                                            ) =>
                                                                                handleCreateCategory(
                                                                                    event,
                                                                                    modality
                                                                                )
                                                                            }
                                                                        >
                                                                            <select
                                                                                value={
                                                                                    getCategoryForm(
                                                                                        modality.id
                                                                                    )
                                                                                }
                                                                                onChange={(
                                                                                    event
                                                                                ) =>
                                                                                    setCategoryForms(
                                                                                        (
                                                                                            current
                                                                                        ) => ({
                                                                                            ...current,

                                                                                            [modality.id]:
                                                                                                event
                                                                                                    .target
                                                                                                    .value,
                                                                                        })
                                                                                    )
                                                                                }
                                                                                required
                                                                            >
                                                                                <option value="">
                                                                                    Adicionar categoria
                                                                                </option>

                                                                                {priceCategoryTemplates.map(
                                                                                    (
                                                                                        template
                                                                                    ) => (
                                                                                        <option
                                                                                            key={
                                                                                                template.id
                                                                                            }
                                                                                            value={
                                                                                                template.id
                                                                                            }
                                                                                        >
                                                                                            {
                                                                                                template.name
                                                                                            }
                                                                                        </option>
                                                                                    )
                                                                                )}
                                                                            </select>

                                                                            <button
                                                                                type="submit"
                                                                                disabled={
                                                                                    isSaving
                                                                                }
                                                                            >
                                                                                Adicionar
                                                                            </button>
                                                                        </form>
                                                                    )}
                                                                </section>

                                                                <section className="event-config-box">
                                                                    <div className="event-config-box-heading">
                                                                        <div>
                                                                            <h5>
                                                                                Lotes de venda
                                                                            </h5>

                                                                            <p>
                                                                                {
                                                                                    usedQuantity
                                                                                }{" "}
                                                                                de{" "}
                                                                                {
                                                                                    modality.capacity
                                                                                }{" "}
                                                                                ingressos distribuídos
                                                                            </p>
                                                                        </div>
                                                                    </div>

                                                                    {modality
                                                                        .batches
                                                                        ?.length >
                                                                        0 && (
                                                                        <div className="event-config-batches">
                                                                            {modality.batches.map(
                                                                                (
                                                                                    batch
                                                                                ) => (
                                                                                    <article
                                                                                        key={
                                                                                            batch.id
                                                                                        }
                                                                                    >
                                                                                        <div className="event-config-batch-main">
                                                                                            <div>
                                                                                                <strong>
                                                                                                    {
                                                                                                        batch.name
                                                                                                    }
                                                                                                </strong>

                                                                                                <span>
                                                                                                    {
                                                                                                        batch.quantity
                                                                                                    }{" "}
                                                                                                    ingressos
                                                                                                </span>
                                                                                            </div>

                                                                                            {eventData.status ===
                                                                                                "DRAFT" && (
                                                                                                <button
                                                                                                    type="button"
                                                                                                    className="event-config-delete-button"
                                                                                                    disabled={
                                                                                                        isSaving
                                                                                                    }
                                                                                                    onClick={() =>
                                                                                                        handleDeleteBatch(
                                                                                                            modality,
                                                                                                            batch
                                                                                                        )
                                                                                                    }
                                                                                                >
                                                                                                    Excluir
                                                                                                </button>
                                                                                            )}
                                                                                        </div>

                                                                                        <ul>
                                                                                            {batch.prices.map(
                                                                                                (
                                                                                                    price
                                                                                                ) => (
                                                                                                    <li
                                                                                                        key={
                                                                                                            price.id
                                                                                                        }
                                                                                                    >
                                                                                                        <span>
                                                                                                            {
                                                                                                                price
                                                                                                                    .eventTicketCategory
                                                                                                                    .priceCategoryTemplate
                                                                                                                    .name
                                                                                                            }
                                                                                                        </span>

                                                                                                        <strong>
                                                                                                            {formatPrice(
                                                                                                                price.priceInCents
                                                                                                            )}
                                                                                                        </strong>
                                                                                                    </li>
                                                                                                )
                                                                                            )}
                                                                                        </ul>
                                                                                    </article>
                                                                                )
                                                                            )}
                                                                        </div>
                                                                    )}

                                                                    {eventData.status ===
                                                                        "DRAFT" &&
                                                                        modality
                                                                            .ticketCategories
                                                                            ?.length >
                                                                            0 &&
                                                                        remainingQuantity >
                                                                            0 && (
                                                                            <details className="event-config-create-panel event-config-create-panel-small">
                                                                                <summary>
                                                                                    + Adicionar lote
                                                                                </summary>

                                                                                <form
                                                                                    className="event-config-batch-form"
                                                                                    onSubmit={(
                                                                                        event
                                                                                    ) =>
                                                                                        handleCreateBatch(
                                                                                            event,
                                                                                            modality
                                                                                        )
                                                                                    }
                                                                                >
                                                                                    <label>
                                                                                        Nome

                                                                                        <input
                                                                                            value={
                                                                                                batchForm.name
                                                                                            }
                                                                                            onChange={(
                                                                                                event
                                                                                            ) =>
                                                                                                updateBatchForm(
                                                                                                    modality.id,
                                                                                                    "name",
                                                                                                    event
                                                                                                        .target
                                                                                                        .value
                                                                                                )
                                                                                            }
                                                                                            placeholder={`Lote ${nextSequence}`}
                                                                                            required
                                                                                        />
                                                                                    </label>

                                                                                    <label>
                                                                                        Quantidade

                                                                                        <input
                                                                                            type="number"
                                                                                            min="1"
                                                                                            max={
                                                                                                remainingQuantity
                                                                                            }
                                                                                            value={
                                                                                                batchForm.quantity
                                                                                            }
                                                                                            onChange={(
                                                                                                event
                                                                                            ) =>
                                                                                                updateBatchForm(
                                                                                                    modality.id,
                                                                                                    "quantity",
                                                                                                    event
                                                                                                        .target
                                                                                                        .value
                                                                                                )
                                                                                            }
                                                                                            required
                                                                                        />
                                                                                    </label>

                                                                                    <div className="event-config-prices">
                                                                                        {modality.ticketCategories.map(
                                                                                            (
                                                                                                category
                                                                                            ) => (
                                                                                                <label
                                                                                                    key={
                                                                                                        category.id
                                                                                                    }
                                                                                                >
                                                                                                    {
                                                                                                        category
                                                                                                            .priceCategoryTemplate
                                                                                                            .name
                                                                                                    }

                                                                                                    <div className="event-config-money">
                                                                                                        <span>
                                                                                                            R$
                                                                                                        </span>

                                                                                                        <input
                                                                                                            inputMode="decimal"
                                                                                                            value={
                                                                                                                getPriceForm(
                                                                                                                    modality.id,
                                                                                                                    category.id
                                                                                                                )
                                                                                                            }
                                                                                                            onChange={(
                                                                                                                event
                                                                                                            ) =>
                                                                                                                updatePriceForm(
                                                                                                                    modality.id,
                                                                                                                    category.id,
                                                                                                                    event
                                                                                                                        .target
                                                                                                                        .value
                                                                                                                )
                                                                                                            }
                                                                                                            placeholder="0,00"
                                                                                                            required
                                                                                                        />
                                                                                                    </div>
                                                                                                </label>
                                                                                            )
                                                                                        )}
                                                                                    </div>

                                                                                    <button
                                                                                        type="submit"
                                                                                        disabled={
                                                                                            isSaving
                                                                                        }
                                                                                    >
                                                                                        Criar Lote{" "}
                                                                                        {
                                                                                            nextSequence
                                                                                        }
                                                                                    </button>
                                                                                </form>
                                                                            </details>
                                                                        )}
                                                                </section>
                                                            </div>
                                                        </details>
                                                    );
                                                }
                                            )}
                                        </div>
                                    </div>
                                </details>
                            );
                        }
                    )}
                </div>
            </section>

            <section className="event-config-publish">
                <div className="event-config-publish-heading">
                    <div>
                        <p className="event-config-eyebrow">
                            Finalização
                        </p>

                        <h2>
                            Pronto para publicar?
                        </h2>

                        <p>
                            A publicação é feita
                            aqui, dentro da
                            configuração deste
                            evento.
                        </p>
                    </div>

                    {eventData.status ===
                    "PUBLISHED" ? (
                        <span className="event-config-publish-status event-config-publish-status-ready">
                            Publicado
                        </span>
                    ) : (
                        <span
                            className={
                                publicationProblems.length ===
                                0
                                    ? "event-config-publish-status event-config-publish-status-ready"
                                    : "event-config-publish-status"
                            }
                        >
                            {publicationProblems.length ===
                            0
                                ? "Configuração completa"
                                : `${publicationProblems.length} pendência(s)`}
                        </span>
                    )}
                </div>

                {eventData.status ===
                    "PUBLISHED" ? (
                    <div className="event-config-published">
                        <div>
                            <strong>
                                Evento publicado
                            </strong>

                            <p>
                                Este evento já
                                está disponível
                                no catálogo
                                público.
                            </p>
                        </div>

                        <Link
                            to={`/eventos/${eventData.id}`}
                            className="event-config-publish-button"
                        >
                            Ver evento publicado
                        </Link>
                    </div>
                ) : (
                    <>
                        {publicationProblems.length >
                        0 ? (
                            <div className="event-config-checklist">
                                <h3>
                                    O que falta
                                </h3>

                                <ul>
                                    {publicationProblems.map(
                                        (
                                            problem,
                                            index
                                        ) => (
                                            <li
                                                key={`${problem}-${index}`}
                                            >
                                                <span>
                                                    !
                                                </span>

                                                {
                                                    problem
                                                }
                                            </li>
                                        )
                                    )}
                                </ul>
                            </div>
                        ) : (
                            <div className="event-config-checklist event-config-checklist-ready">
                                <strong>
                                    ✓ Tudo pronto
                                </strong>

                                <p>
                                    A configuração
                                    comercial está
                                    completa.
                                </p>
                            </div>
                        )}

                        <div className="event-config-publish-footer">
                            <p>
                                O botão será
                                liberado quando
                                todas as
                                pendências forem
                                resolvidas.
                            </p>

                            <button
                                type="button"
                                className="event-config-publish-button"
                                disabled={
                                    !canPublish ||
                                    isPublishing
                                }
                                onClick={
                                    handlePublishEvent
                                }
                            >
                                {isPublishing
                                    ? "Publicando..."
                                    : "Publicar evento"}
                            </button>
                        </div>
                    </>
                )}
            </section>
        </main>
    );
}