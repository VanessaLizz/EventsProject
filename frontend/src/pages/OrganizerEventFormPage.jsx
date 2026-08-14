import {
    useEffect,
    useState,
} from "react";

import {
    Link,
    useNavigate,
    useParams,
} from "react-router";

import {
    useAuth,
} from "../contexts/authContext.js";

import {
    createOrganizerEvent,
    getEventTemplates,
    getOrganizerEventById,
    updateOrganizerEvent,
    searchTmdbEvents,
    searchTicketmasterEvents,
} from "../services/eventService.js";

const IMPORT_QUEUE_KEY =
    "borai_external_event_import_queue";

const INITIAL_FORM = {
    title: "",
    description: "",
    imageUrl: "",
    capacity: "",

    venueName: "",
    address: "",
    city: "",
    state: "",
    country: "BR",

    latitude: "",
    longitude: "",

    dateTime: "",
    categoryTemplateId: "",

    source: "LOCAL",
    externalId: null,
};

// ======================================================
// DATA PARA INPUT DATETIME-LOCAL
// ======================================================

function toDateTimeLocal(
    value
) {
    if (!value) {
        return "";
    }

    const date =
        new Date(
            value
        );

    const offset =
        date.getTimezoneOffset();

    const localDate =
        new Date(
            date.getTime() -
                offset *
                    60 *
                    1000
        );

    return localDate
        .toISOString()
        .slice(
            0,
            16
        );
}

// ======================================================
// DATA DA TICKETMASTER
// ======================================================

function buildTicketmasterDateTime(
    date,
    time
) {
    if (!date) {
        return "";
    }

    const normalizedTime =
        time
            ? String(
                  time
              ).slice(
                  0,
                  5
              )
            : "19:00";

    return `${date}T${normalizedTime}`;
}

// ======================================================
// NORMALIZAÇÃO DE TEXTO
// ======================================================

function normalizeText(
    value
) {
    return String(
        value ||
            ""
    )
        .normalize(
            "NFD"
        )
        .replace(
            /[\u0300-\u036f]/g,
            ""
        )
        .trim()
        .toUpperCase();
}

// ======================================================
// TENTA ENCONTRAR CATEGORIA EXISTENTE
// ======================================================

function findCategoryId(
    categories,
    names
) {
    const normalizedNames =
        names
            .filter(
                Boolean
            )
            .map(
                normalizeText
            );

    if (
        normalizedNames.length ===
        0
    ) {
        return "";
    }

    const category =
        categories.find(
            (
                item
            ) => {
                const normalized =
                    normalizeText(
                        item.name
                    );

                return normalizedNames.some(
                    (
                        name
                    ) =>
                        normalized ===
                            name ||
                        normalized.includes(
                            name
                        ) ||
                        name.includes(
                            normalized
                        )
                );
            }
        );

    return (
        category?.id ||
        ""
    );
}

// ======================================================
// FILA TEMPORÁRIA DE IMPORTAÇÃO
// ======================================================

function getImportQueue() {
    try {
        const stored =
            sessionStorage.getItem(
                IMPORT_QUEUE_KEY
            );

        if (!stored) {
            return [];
        }

        const parsed =
            JSON.parse(
                stored
            );

        return Array.isArray(
            parsed
        )
            ? parsed
            : [];
    } catch (
        error
    ) {
        console.error(
            "Erro ao carregar fila de importação:",
            error
        );

        return [];
    }
}

function saveImportQueue(
    queue
) {
    if (
        queue.length ===
        0
    ) {
        sessionStorage.removeItem(
            IMPORT_QUEUE_KEY
        );

        return;
    }

    sessionStorage.setItem(
        IMPORT_QUEUE_KEY,
        JSON.stringify(
            queue
        )
    );
}

// ======================================================
// PÁGINA
// ======================================================

export default function OrganizerEventFormPage() {
    const {
        eventId,
    } = useParams();

    const navigate =
        useNavigate();

    const {
        token,
    } = useAuth();

    const isEditing =
        Boolean(
            eventId
        );

    const isImportFlow =
        !isEditing &&
        new URLSearchParams(
            window.location.search
        ).get(
            "import"
        ) ===
            "1";

    const [
        form,
        setForm,
    ] = useState(
        INITIAL_FORM
    );

    const [
        categories,
        setCategories,
    ] = useState(
        []
    );

    const [
        creationMode,
        setCreationMode,
    ] = useState(
        "LOCAL"
    );

    const [
        externalQuery,
        setExternalQuery,
    ] = useState(
        ""
    );

    const [
        externalResults,
        setExternalResults,
    ] = useState(
        []
    );

    const [
        isSearching,
        setIsSearching,
    ] = useState(
        false
    );

    const [
        searchError,
        setSearchError,
    ] = useState(
        ""
    );

    const [
        selectedExternal,
        setSelectedExternal,
    ] = useState(
        null
    );

    const [
        importQueue,
        setImportQueue,
    ] = useState(
        []
    );

    const [
        isLoading,
        setIsLoading,
    ] = useState(
        true
    );

    const [
        isSaving,
        setIsSaving,
    ] = useState(
        false
    );

    const [
        error,
        setError,
    ] = useState(
        ""
    );

    // ==================================================
    // PREENCHE FORMULÁRIO COM EVENTO IMPORTADO
    // ==================================================

    function applyImportedEvent(
        importedEvent,
        availableCategories =
            categories
    ) {
        if (
            !importedEvent
        ) {
            return;
        }

        const source =
            importedEvent.source ||
            "LOCAL";

        let categoryId =
            "";

        if (
            source ===
            "TMDB"
        ) {
            categoryId =
                findCategoryId(
                    availableCategories,
                    [
                        "CINEMA",
                        "FILME",
                        "FILMES",
                    ]
                );
        }

        if (
            source ===
            "TICKETMASTER"
        ) {
            categoryId =
                findCategoryId(
                    availableCategories,
                    [
                        importedEvent.category,
                        importedEvent.genre,
                        importedEvent.subGenre,
                    ]
                );
        }

        const dateTime =
            source ===
            "TICKETMASTER"
                ? buildTicketmasterDateTime(
                      importedEvent.date,
                      importedEvent.time
                  )
                : "";

        setCreationMode(
            source
        );

        setSelectedExternal(
            importedEvent
        );

        setExternalQuery(
            ""
        );

        setExternalResults(
            []
        );

        setSearchError(
            ""
        );

        setForm({
            ...INITIAL_FORM,

            title:
                importedEvent.title ||
                "",

            description:
                importedEvent.description ||
                "",

            imageUrl:
                importedEvent.imageUrl ||
                "",

            venueName:
                importedEvent.venueName ||
                "",

            address:
                importedEvent.address ||
                "",

            city:
                importedEvent.city ||
                "",

            state:
                importedEvent.state ||
                "",

            country:
                importedEvent.country ||
                "BR",

            latitude:
                importedEvent.latitude ??
                "",

            longitude:
                importedEvent.longitude ??
                "",

            dateTime,

            categoryTemplateId:
                categoryId,

            source,

            externalId:
                importedEvent.externalId ||
                null,
        });
    }

    // ==================================================
    // CARREGAMENTO DA PÁGINA
    // ==================================================

    useEffect(() => {
        let isMounted =
            true;

        async function loadPage() {
            try {
                const templates =
                    await getEventTemplates(
                        token
                    );

                if (
                    !isMounted
                ) {
                    return;
                }

                const loadedCategories =
                    templates.categories ||
                    [];

                setCategories(
                    loadedCategories
                );

                // ==========================================
                // CRIAÇÃO / IMPORTAÇÃO
                // ==========================================

                if (
                    !isEditing
                ) {
                    if (
                        isImportFlow
                    ) {
                        const queue =
                            getImportQueue();

                        setImportQueue(
                            queue
                        );

                        if (
                            queue.length >
                            0
                        ) {
                            applyImportedEvent(
                                queue[0],
                                loadedCategories
                            );
                        } else {
                            setError(
                                "Nenhum evento foi selecionado para edição."
                            );
                        }
                    }

                    return;
                }

                // ==========================================
                // EDIÇÃO DE EVENTO EXISTENTE
                // ==========================================

                const response =
                    await getOrganizerEventById(
                        eventId,
                        token
                    );

                if (
                    !isMounted
                ) {
                    return;
                }

                const event =
                    response.event;

                setCreationMode(
                    event.source ||
                    "LOCAL"
                );

                setForm({
                    title:
                        event.title ||
                        "",

                    description:
                        event.description ||
                        "",

                    imageUrl:
                        event.imageUrl ||
                        "",

                    capacity:
                        event.capacity ===
                            null ||
                        event.capacity ===
                            undefined
                            ? ""
                            : String(
                                  event.capacity
                              ),

                    venueName:
                        event.venueName ||
                        "",

                    address:
                        event.address ||
                        "",

                    city:
                        event.city ||
                        "",

                    state:
                        event.state ||
                        "",

                    country:
                        event.country ||
                        "BR",

                    latitude:
                        event.latitude ??
                        "",

                    longitude:
                        event.longitude ??
                        "",

                    dateTime:
                        toDateTimeLocal(
                            event.dateTime
                        ),

                    categoryTemplateId:
                        event
                            .categoryTemplate
                            ?.id ||
                        "",

                    source:
                        event.source ||
                        "LOCAL",

                    externalId:
                        event.externalId ||
                        null,
                });
            } catch (
                error
            ) {
                if (
                    !isMounted
                ) {
                    return;
                }

                setError(
                    error.message ||
                        "Não foi possível carregar o formulário."
                );
            } finally {
                if (
                    isMounted
                ) {
                    setIsLoading(
                        false
                    );
                }
            }
        }

        loadPage();

        return () => {
            isMounted =
                false;
        };
    }, [
        eventId,
        isEditing,
        token,
        isImportFlow,
    ]);

    // ==================================================
    // CAMPOS DO FORMULÁRIO
    // ==================================================

    function handleChange(
        event
    ) {
        const {
            name,
            value,
        } =
            event.target;

        setForm(
            (
                current
            ) => ({
                ...current,

                [name]:
                    value,
            })
        );
    }

    // ==================================================
    // ALTERAR ORIGEM MANUALMENTE
    // ==================================================

    function handleCreationModeChange(
        mode
    ) {
        if (
            isEditing ||
            isImportFlow
        ) {
            return;
        }

        setCreationMode(
            mode
        );

        setExternalQuery(
            ""
        );

        setExternalResults(
            []
        );

        setSearchError(
            ""
        );

        setSelectedExternal(
            null
        );

        setForm({
            ...INITIAL_FORM,

            source:
                mode,

            externalId:
                null,
        });
    }

    // ==================================================
    // BUSCA EXTERNA MANUAL
    // ==================================================

    async function handleExternalSearch(
        event
    ) {
        event.preventDefault();

        const query =
            externalQuery.trim();

        if (
            !query
        ) {
            setSearchError(
                "Digite um termo para realizar a busca."
            );

            return;
        }

        setSearchError(
            ""
        );

        setExternalResults(
            []
        );

        setIsSearching(
            true
        );

        try {
            let response;

            if (
                creationMode ===
                "TMDB"
            ) {
                response =
                    await searchTmdbEvents(
                        query,
                        token
                    );
            } else if (
                creationMode ===
                "TICKETMASTER"
            ) {
                response =
                    await searchTicketmasterEvents(
                        query,
                        token
                    );
            } else {
                return;
            }

            setExternalResults(
                response.results ||
                    []
            );
        } catch (
            error
        ) {
            setSearchError(
                error.message ||
                    "Não foi possível realizar a busca."
            );
        } finally {
            setIsSearching(
                false
            );
        }
    }

    // ==================================================
    // SELEÇÃO MANUAL — TMDB
    // ==================================================

    function selectTmdbMovie(
        movie
    ) {
        const cinemaCategoryId =
            findCategoryId(
                categories,
                [
                    "CINEMA",
                    "FILME",
                    "FILMES",
                ]
            );

        setSelectedExternal(
            movie
        );

        setForm(
            (
                current
            ) => ({
                ...current,

                title:
                    movie.title ||
                    "",

                description:
                    movie.description ||
                    "",

                imageUrl:
                    movie.imageUrl ||
                    "",

                categoryTemplateId:
                    cinemaCategoryId ||
                    current.categoryTemplateId,

                source:
                    "TMDB",

                externalId:
                    movie.externalId,
            })
        );
    }

    // ==================================================
    // SELEÇÃO MANUAL — TICKETMASTER
    // ==================================================

    function selectTicketmasterEvent(
        externalEvent
    ) {
        const categoryId =
            findCategoryId(
                categories,
                [
                    externalEvent.category,
                    externalEvent.genre,
                    externalEvent.subGenre,
                ]
            );

        setSelectedExternal(
            externalEvent
        );

        setForm(
            (
                current
            ) => ({
                ...current,

                title:
                    externalEvent.title ||
                    "",

                description:
                    externalEvent.description ||
                    "",

                imageUrl:
                    externalEvent.imageUrl ||
                    "",

                venueName:
                    externalEvent.venueName ||
                    "",

                address:
                    externalEvent.address ||
                    "",

                city:
                    externalEvent.city ||
                    "",

                state:
                    externalEvent.state ||
                    "",

                country:
                    externalEvent.country ||
                    "BR",

                latitude:
                    externalEvent.latitude ??
                    "",

                longitude:
                    externalEvent.longitude ??
                    "",

                dateTime:
                    buildTicketmasterDateTime(
                        externalEvent.date,
                        externalEvent.time
                    ),

                categoryTemplateId:
                    categoryId ||
                    current.categoryTemplateId,

                source:
                    "TICKETMASTER",

                externalId:
                    externalEvent.externalId,
            })
        );
    }

    // ==================================================
    // SALVAR EVENTO
    // ==================================================

    async function handleSubmit(
        event
    ) {
        event.preventDefault();

        setError(
            ""
        );

        setIsSaving(
            true
        );

        try {
            const payload = {
                ...form,

                capacity:
                    Number(
                        form.capacity
                    ),

                latitude:
                    form.latitude ===
                    ""
                        ? null
                        : Number(
                              form.latitude
                          ),

                longitude:
                    form.longitude ===
                    ""
                        ? null
                        : Number(
                              form.longitude
                          ),
            };

            if (
                isEditing
            ) {
                await updateOrganizerEvent(
                    eventId,
                    payload,
                    token
                );

                navigate(
                    "/organizador"
                );

                return;
            }

            await createOrganizerEvent(
                payload,
                token
            );

            // ==============================================
            // FILA DE IMPORTAÇÃO
            // ==============================================

            if (
                isImportFlow &&
                importQueue.length >
                    0
            ) {
                const remainingQueue =
                    importQueue.slice(
                        1
                    );

                if (
                    remainingQueue.length >
                    0
                ) {
                    saveImportQueue(
                        remainingQueue
                    );

                    setImportQueue(
                        remainingQueue
                    );

                    applyImportedEvent(
                        remainingQueue[0],
                        categories
                    );

                    window.scrollTo({
                        top:
                            0,

                        behavior:
                            "smooth",
                    });

                    return;
                }

                saveImportQueue(
                    []
                );
            }

            navigate(
                "/organizador"
            );
        } catch (
            error
        ) {
            setError(
                error.message ||
                    "Não foi possível salvar o evento."
            );
        } finally {
            setIsSaving(
                false
            );
        }
    }

    // ==================================================
    // CANCELAR
    // ==================================================

    function handleCancelImport() {
        if (
            isImportFlow
        ) {
            sessionStorage.removeItem(
                IMPORT_QUEUE_KEY
            );
        }

        navigate(
            "/organizador"
        );
    }

    // ==================================================
    // LOADING
    // ==================================================

    if (
        isLoading
    ) {
        return (
            <main className="organizer-form-page">
                <section className="organizer-status">
                    Carregando...
                </section>
            </main>
        );
    }

    return (
        <main className="organizer-form-page">
            <Link
                to="/organizador"
                className="organizer-form-back"
            >
                ← Voltar para o painel
            </Link>

            <header className="organizer-form-heading">
                <p className="account-eyebrow">
                    Organização
                </p>

                <h1>
                    {isEditing
                        ? "Editar evento"
                        : isImportFlow
                            ? "Revisar evento importado"
                            : "Criar evento"}
                </h1>

                <p>
                    {isImportFlow
                        ? "Revise e complete os dados antes de adicionar este evento aos seus rascunhos."
                        : "Preencha as informações principais do evento. Setores, modalidades, lotes e preços serão configurados em seguida."}
                </p>

                {isImportFlow &&
                    importQueue.length >
                        0 && (
                        <p>
                            Evento{" "}
                            <strong>
                                1
                            </strong>{" "}
                            de{" "}
                            <strong>
                                {
                                    importQueue.length
                                }
                            </strong>{" "}
                            restante(s) nesta
                            seleção.
                        </p>
                    )}
            </header>

            {/* ==========================================
                ORIGEM DO EVENTO
               ========================================== */}

            {!isEditing &&
                !isImportFlow && (
                    <section className="organizer-form-section">
                        <div className="organizer-form-section-heading">
                            <span>
                                00
                            </span>

                            <div>
                                <h2>
                                    Origem do evento
                                </h2>

                                <p>
                                    Crie manualmente ou
                                    utilize informações
                                    de um catálogo externo.
                                </p>
                            </div>
                        </div>

                        <div
                            style={{
                                display:
                                    "flex",

                                flexWrap:
                                    "wrap",

                                gap:
                                    "10px",

                                marginBottom:
                                    "20px",
                            }}
                        >
                            <button
                                type="button"
                                className={
                                    creationMode ===
                                    "LOCAL"
                                        ? "organizer-form-submit"
                                        : "organizer-form-cancel"
                                }
                                onClick={() =>
                                    handleCreationModeChange(
                                        "LOCAL"
                                    )
                                }
                            >
                                Manual
                            </button>

                            <button
                                type="button"
                                className={
                                    creationMode ===
                                    "TMDB"
                                        ? "organizer-form-submit"
                                        : "organizer-form-cancel"
                                }
                                onClick={() =>
                                    handleCreationModeChange(
                                        "TMDB"
                                    )
                                }
                            >
                                TMDb
                            </button>

                            <button
                                type="button"
                                className={
                                    creationMode ===
                                    "TICKETMASTER"
                                        ? "organizer-form-submit"
                                        : "organizer-form-cancel"
                                }
                                onClick={() =>
                                    handleCreationModeChange(
                                        "TICKETMASTER"
                                    )
                                }
                            >
                                Ticketmaster
                            </button>
                        </div>

                        {creationMode !==
                            "LOCAL" && (
                            <>
                                <form
                                    onSubmit={
                                        handleExternalSearch
                                    }
                                >
                                    <div className="organizer-form-grid">
                                        <label className="organizer-field organizer-field-full">
                                            <span>
                                                {creationMode ===
                                                "TMDB"
                                                    ? "Buscar filme no TMDb"
                                                    : "Buscar evento na Ticketmaster"}
                                            </span>

                                            <div
                                                style={{
                                                    display:
                                                        "flex",

                                                    gap:
                                                        "10px",
                                                }}
                                            >
                                                <input
                                                    value={
                                                        externalQuery
                                                    }
                                                    onChange={(
                                                        event
                                                    ) =>
                                                        setExternalQuery(
                                                            event
                                                                .target
                                                                .value
                                                        )
                                                    }
                                                    placeholder={
                                                        creationMode ===
                                                        "TMDB"
                                                            ? "Ex.: Interestelar"
                                                            : "Ex.: show, festival, artista..."
                                                    }
                                                />

                                                <button
                                                    type="submit"
                                                    className="organizer-form-submit"
                                                    disabled={
                                                        isSearching
                                                    }
                                                >
                                                    {isSearching
                                                        ? "Buscando..."
                                                        : "Buscar"}
                                                </button>
                                            </div>
                                        </label>
                                    </div>
                                </form>

                                {searchError && (
                                    <div
                                        className="organizer-form-error"
                                        role="alert"
                                    >
                                        {
                                            searchError
                                        }
                                    </div>
                                )}

                                {externalResults.length >
                                    0 && (
                                    <div
                                        style={{
                                            display:
                                                "grid",

                                            gridTemplateColumns:
                                                "repeat(auto-fit, minmax(220px, 1fr))",

                                            gap:
                                                "16px",

                                            marginTop:
                                                "20px",
                                        }}
                                    >
                                        {externalResults.map(
                                            (
                                                item
                                            ) => (
                                                <article
                                                    key={
                                                        item.externalId
                                                    }
                                                    className="organizer-event-card"
                                                >
                                                    {item.imageUrl && (
                                                        <img
                                                            src={
                                                                item.imageUrl
                                                            }
                                                            alt={
                                                                item.title ||
                                                                ""
                                                            }
                                                            style={{
                                                                width:
                                                                    "100%",

                                                                height:
                                                                    "220px",

                                                                objectFit:
                                                                    "cover",

                                                                borderRadius:
                                                                    "10px",

                                                                marginBottom:
                                                                    "14px",
                                                            }}
                                                        />
                                                    )}

                                                    <h3>
                                                        {
                                                            item.title
                                                        }
                                                    </h3>

                                                    {creationMode ===
                                                        "TMDB" &&
                                                        item.releaseDate && (
                                                            <p>
                                                                Lançamento:{" "}
                                                                {
                                                                    item.releaseDate
                                                                }
                                                            </p>
                                                        )}

                                                    {creationMode ===
                                                        "TICKETMASTER" && (
                                                        <>
                                                            {item.date && (
                                                                <p>
                                                                    Data:{" "}
                                                                    {
                                                                        item.date
                                                                    }
                                                                </p>
                                                            )}

                                                            {item.venueName && (
                                                                <p>
                                                                    {
                                                                        item.venueName
                                                                    }
                                                                </p>
                                                            )}

                                                            {item.city && (
                                                                <p>
                                                                    {
                                                                        item.city
                                                                    }

                                                                    {item.state
                                                                        ? ` - ${item.state}`
                                                                        : ""}
                                                                </p>
                                                            )}
                                                        </>
                                                    )}

                                                    <button
                                                        type="button"
                                                        className="organizer-edit-button"
                                                        onClick={() => {
                                                            if (
                                                                creationMode ===
                                                                "TMDB"
                                                            ) {
                                                                selectTmdbMovie(
                                                                    item
                                                                );
                                                            } else {
                                                                selectTicketmasterEvent(
                                                                    item
                                                                );
                                                            }
                                                        }}
                                                    >
                                                        Selecionar
                                                    </button>
                                                </article>
                                            )
                                        )}
                                    </div>
                                )}

                                {selectedExternal && (
                                    <div
                                        style={{
                                            marginTop:
                                                "20px",

                                            padding:
                                                "14px",

                                            border:
                                                "1px solid var(--border)",

                                            borderRadius:
                                                "10px",

                                            background:
                                                "var(--surface)",
                                        }}
                                    >
                                        <strong>
                                            Selecionado:
                                        </strong>{" "}
                                        {
                                            selectedExternal.title
                                        }

                                        <p
                                            style={{
                                                marginBottom:
                                                    0,
                                            }}
                                        >
                                            Os dados disponíveis
                                            foram preenchidos no
                                            formulário abaixo.
                                            Revise as informações
                                            antes de criar o
                                            evento.
                                        </p>
                                    </div>
                                )}
                            </>
                        )}
                    </section>
                )}

            {/* ==========================================
                IDENTIFICAÇÃO DO IMPORTADO
               ========================================== */}

            {isImportFlow &&
                selectedExternal && (
                    <section className="organizer-form-section">
                        <div className="organizer-form-section-heading">
                            <span>
                                00
                            </span>

                            <div>
                                <h2>
                                    Evento selecionado
                                </h2>

                                <p>
                                    Dados externos usados
                                    apenas como base para
                                    a criação.
                                </p>
                            </div>
                        </div>

                        <div
                            style={{
                                display:
                                    "flex",

                                gap:
                                    "18px",

                                alignItems:
                                    "center",

                                flexWrap:
                                    "wrap",
                            }}
                        >
                            {selectedExternal.imageUrl && (
                                <img
                                    src={
                                        selectedExternal.imageUrl
                                    }
                                    alt={
                                        selectedExternal.title ||
                                        ""
                                    }
                                    style={{
                                        width:
                                            "120px",

                                        height:
                                            "160px",

                                        objectFit:
                                            "cover",

                                        borderRadius:
                                            "10px",
                                    }}
                                />
                            )}

                            <div>
                                <strong>
                                    {
                                        selectedExternal.title
                                    }
                                </strong>

                                <p>
                                    Origem:{" "}
                                    {selectedExternal.source ===
                                    "TMDB"
                                        ? "TMDb"
                                        : "Ticketmaster"}
                                </p>

                                <p>
                                    Este evento ainda
                                    não foi criado no
                                    Boraí.
                                </p>
                            </div>
                        </div>
                    </section>
                )}

            {error && (
                <div
                    className="organizer-form-error"
                    role="alert"
                >
                    {error}
                </div>
            )}

            {/* ==========================================
                FORMULÁRIO PRINCIPAL
               ========================================== */}

            <form
                className="organizer-event-form"
                onSubmit={
                    handleSubmit
                }
            >
                <section className="organizer-form-section">
                    <div className="organizer-form-section-heading">
                        <span>
                            01
                        </span>

                        <div>
                            <h2>
                                Informações
                            </h2>

                            <p>
                                Dados principais
                                do evento.
                            </p>
                        </div>
                    </div>

                    <div className="organizer-form-grid">
                        <label className="organizer-field organizer-field-full">
                            <span>
                                Nome do evento *
                            </span>

                            <input
                                name="title"
                                value={
                                    form.title
                                }
                                onChange={
                                    handleChange
                                }
                                required
                            />
                        </label>

                        <label className="organizer-field organizer-field-full">
                            <span>
                                Descrição
                            </span>

                            <textarea
                                name="description"
                                value={
                                    form.description
                                }
                                onChange={
                                    handleChange
                                }
                                rows="5"
                            />
                        </label>

                        <label className="organizer-field">
                            <span>
                                Categoria *
                            </span>

                            <select
                                name="categoryTemplateId"
                                value={
                                    form.categoryTemplateId
                                }
                                onChange={
                                    handleChange
                                }
                                required
                            >
                                <option value="">
                                    Selecione
                                </option>

                                {categories.map(
                                    (
                                        category
                                    ) => (
                                        <option
                                            key={
                                                category.id
                                            }
                                            value={
                                                category.id
                                            }
                                        >
                                            {
                                                category.name
                                            }
                                        </option>
                                    )
                                )}
                            </select>
                        </label>

                        <label className="organizer-field">
                            <span>
                                Capacidade total *
                            </span>

                            <input
                                name="capacity"
                                type="number"
                                min="1"
                                step="1"
                                value={
                                    form.capacity
                                }
                                onChange={
                                    handleChange
                                }
                                required
                            />
                        </label>

                        <label className="organizer-field">
                            <span>
                                Data e hora *
                            </span>

                            <input
                                name="dateTime"
                                type="datetime-local"
                                value={
                                    form.dateTime
                                }
                                onChange={
                                    handleChange
                                }
                                required
                            />
                        </label>

                        <label className="organizer-field">
                            <span>
                                URL da imagem
                            </span>

                            <input
                                name="imageUrl"
                                type="url"
                                value={
                                    form.imageUrl
                                }
                                onChange={
                                    handleChange
                                }
                                placeholder="https://..."
                            />
                        </label>
                    </div>
                </section>

                <section className="organizer-form-section">
                    <div className="organizer-form-section-heading">
                        <span>
                            02
                        </span>

                        <div>
                            <h2>
                                Local
                            </h2>

                            <p>
                                Onde o evento
                                acontecerá.
                            </p>
                        </div>
                    </div>

                    <div className="organizer-form-grid">
                        <label className="organizer-field organizer-field-full">
                            <span>
                                Nome do local *
                            </span>

                            <input
                                name="venueName"
                                value={
                                    form.venueName
                                }
                                onChange={
                                    handleChange
                                }
                                required
                            />
                        </label>

                        <label className="organizer-field organizer-field-full">
                            <span>
                                Endereço
                            </span>

                            <input
                                name="address"
                                value={
                                    form.address
                                }
                                onChange={
                                    handleChange
                                }
                            />
                        </label>

                        <label className="organizer-field">
                            <span>
                                Cidade *
                            </span>

                            <input
                                name="city"
                                value={
                                    form.city
                                }
                                onChange={
                                    handleChange
                                }
                                required
                            />
                        </label>

                        <label className="organizer-field">
                            <span>
                                Estado *
                            </span>

                            <input
                                name="state"
                                value={
                                    form.state
                                }
                                onChange={
                                    handleChange
                                }
                                required
                                maxLength="2"
                                placeholder="CE"
                            />
                        </label>

                        <label className="organizer-field">
                            <span>
                                País *
                            </span>

                            <input
                                name="country"
                                value={
                                    form.country
                                }
                                onChange={
                                    handleChange
                                }
                                required
                            />
                        </label>

                        <label className="organizer-field">
                            <span>
                                Latitude
                            </span>

                            <input
                                name="latitude"
                                type="number"
                                step="any"
                                value={
                                    form.latitude
                                }
                                onChange={
                                    handleChange
                                }
                            />
                        </label>

                        <label className="organizer-field">
                            <span>
                                Longitude
                            </span>

                            <input
                                name="longitude"
                                type="number"
                                step="any"
                                value={
                                    form.longitude
                                }
                                onChange={
                                    handleChange
                                }
                            />
                        </label>
                    </div>
                </section>

                <div className="organizer-form-actions">
                    {isImportFlow ? (
                        <button
                            type="button"
                            className="organizer-form-cancel"
                            onClick={
                                handleCancelImport
                            }
                        >
                            Cancelar importação
                        </button>
                    ) : (
                        <Link
                            to="/organizador"
                            className="organizer-form-cancel"
                        >
                            Cancelar
                        </Link>
                    )}

                    <button
                        type="submit"
                        className="organizer-form-submit"
                        disabled={
                            isSaving
                        }
                    >
                        {isSaving
                            ? "Salvando..."
                            : isEditing
                                ? "Salvar alterações"
                                : isImportFlow &&
                                    importQueue.length >
                                        1
                                    ? "Criar e revisar próximo"
                                    : "Criar evento"}
                    </button>
                </div>
            </form>
        </main>
    );
}