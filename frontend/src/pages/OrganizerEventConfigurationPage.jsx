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
} from "../services/eventService.js";

import "./OrganizerEventConfigurationPage.css";

function formatMoneyInputToCents(
    value
) {
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

function formatPrice(
    cents
) {
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
            total +
            batch.quantity,
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
                if (
                    mounted
                ) {
                    setError(
                        error.message
                    );
                }
            } finally {
                if (
                    mounted
                ) {
                    setIsLoading(
                        false
                    );
                }
            }
        }

        load();

        return () => {
            mounted =
                false;
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
                        rowLabel:
                            "",
                        startNumber:
                            "1",
                        quantity:
                            "",
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

    if (isLoading) {
        return (
            <main className="event-config-page">
                <p>
                    Carregando configuração...
                </p>
            </main>
        );
    }

    if (
        !eventData ||
        !templates
    ) {
        return (
            <main className="event-config-page">
                <p className="event-config-error">
                    {error ||
                        "Não foi possível carregar o evento."}
                </p>
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

    return (
        <main className="event-config-page">
            <Link
                to="/organizador"
                className="event-config-back"
            >
                ← Voltar ao painel
            </Link>

            <header className="event-config-header">
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
            </header>

            <section className="event-config-summary">
                <div>
                    <span>
                        Capacidade
                    </span>

                    <strong>
                        {eventData.capacity}
                    </strong>
                </div>

                <div>
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
                </div>

                <div>
                    <span>
                        Status
                    </span>

                    <strong>
                        {eventData.status ===
                            "DRAFT"
                            ? "Rascunho"
                            : eventData.status}
                    </strong>
                </div>
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
                            Divida a capacidade
                            do evento em setores.
                        </p>
                    </div>
                </div>

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

                <div className="event-config-sector-list">
                    {eventData.sectors.map(
                        (sector) => {
                            const modalityForm =
                                getModalityForm(
                                    sector.id
                                );

                            return (
                                <article
                                    className="event-config-sector"
                                    key={
                                        sector.id
                                    }
                                >
                                    <header className="event-config-sector-header">
                                        <div>
                                            <span>
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

                                        <div className="event-config-header-actions">
                                            <strong>
                                                {
                                                    sector.capacity
                                                }{" "}
                                                lugares
                                            </strong>

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
                                        </div>
                                    </header>

                                    <section className="event-config-substep">
                                        <h4>
                                            Modalidades
                                        </h4>

                                        <p>
                                            Configure
                                            os tipos de
                                            ingresso
                                            deste setor.
                                        </p>

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
                                                Adicionar modalidade
                                            </button>
                                        </form>
                                    </section>

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
                                                    modality.capacity -
                                                    usedQuantity;

                                                const batchForm =
                                                    getBatchForm(
                                                        modality.id
                                                    );

                                                const nextSequence =
                                                    getNextSequence(
                                                        modality
                                                    );

                                                return (
                                                    <article
                                                        className="event-config-modality"
                                                        key={
                                                            modality.id
                                                        }
                                                    >
                                                        <header className="event-config-modality-header">
                                                            <div>
                                                                <h4>
                                                                    {
                                                                        modality
                                                                            .modalityTemplate
                                                                            .name
                                                                    }
                                                                </h4>

                                                                <span>
                                                                    {modality.occupancyMode ===
                                                                        "SEAT"
                                                                        ? "Assento marcado"
                                                                        : "Controle por quantidade"}
                                                                </span>
                                                            </div>

                                                            <div className="event-config-header-actions">
                                                                <div className="event-config-stock">
                                                                    <strong>
                                                                        {
                                                                            remainingQuantity
                                                                        }
                                                                    </strong>

                                                                    <span>
                                                                        disponíveis de{" "}
                                                                        {
                                                                            modality.capacity
                                                                        }
                                                                    </span>
                                                                </div>

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
                                                            </div>
                                                        </header>

                                                        {modality.occupancyMode ===
                                                            "SEAT" && (
                                                                <section className="event-config-box">
                                                                    <div className="event-config-box-heading">
                                                                        <div>
                                                                            <h5>
                                                                                Assentos marcados
                                                                            </h5>

                                                                            <p>
                                                                                Cadastre os lugares por fileira.
                                                                            </p>
                                                                        </div>

                                                                        <span>
                                                                            {
                                                                                modality
                                                                                    .seats
                                                                                    ?.length ||
                                                                                0
                                                                            }
                                                                            /
                                                                            {
                                                                                modality.capacity
                                                                            }{" "}
                                                                            configurados
                                                                        </span>
                                                                    </div>

                                                                    {(modality
                                                                        .seats
                                                                        ?.length ||
                                                                        0) <
                                                                        modality.capacity && (
                                                                            <form
                                                                                className="event-config-inline-form"
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
                                                                                            (modality
                                                                                                .seats
                                                                                                ?.length ||
                                                                                                0)
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
                                                                                    Adicionar assentos
                                                                                </button>
                                                                            </form>
                                                                        )}

                                                                    {modality
                                                                        .seats
                                                                        ?.length >
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
                                                                                        </span>
                                                                                    )
                                                                                )}
                                                                            </div>
                                                                        )}
                                                                </section>
                                                            )}

                                                        <section className="event-config-box">
                                                            <h5>
                                                                Categorias de preço
                                                            </h5>

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
                                                                                </span>
                                                                            )
                                                                        )}
                                                                    </div>
                                                                )}

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
                                                        </section>

                                                        <section className="event-config-box">
                                                            <div className="event-config-box-heading">
                                                                <div>
                                                                    <h5>
                                                                        Novo lote
                                                                    </h5>

                                                                    <p>
                                                                        Configure quantidade e preços.
                                                                    </p>
                                                                </div>

                                                                <span>
                                                                    Será criado como Lote{" "}
                                                                    {
                                                                        nextSequence
                                                                    }
                                                                </span>
                                                            </div>

                                                            {modality
                                                                .ticketCategories
                                                                ?.length ===
                                                                0 ? (
                                                                <p>
                                                                    Adicione pelo menos uma categoria antes de criar um lote.
                                                                </p>
                                                            ) : (
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
                                                                            isSaving ||
                                                                            remainingQuantity <=
                                                                            0
                                                                        }
                                                                    >
                                                                        Criar Lote{" "}
                                                                        {
                                                                            nextSequence
                                                                        }
                                                                    </button>
                                                                </form>
                                                            )}
                                                        </section>

                                                        {modality
                                                            .batches
                                                            ?.length >
                                                            0 && (
                                                                <section className="event-config-box">
                                                                    <h5>
                                                                        Lotes cadastrados
                                                                    </h5>

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
                                                                                    <div>
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
                                                                                            Excluir lote
                                                                                        </button>
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
                                                                </section>
                                                            )}
                                                    </article>
                                                );
                                            }
                                        )}
                                    </div>
                                </article>
                            );
                        }
                    )}
                </div>
            </section>
        </main>
    );
}