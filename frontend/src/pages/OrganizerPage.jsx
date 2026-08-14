import {
    useCallback,
    useEffect,
    useMemo,
    useState,
} from "react";

import {
    Link,
} from "react-router";

import {
    useAuth,
} from "../contexts/authContext.js";

import AccountLogout from "../components/AccountLogout.jsx";

import {
    getOrganizerEvents,
} from "../services/eventService.js";

// ======================================================
// FORMATAÇÃO
// ======================================================

function formatDate(
    dateTime
) {
    if (!dateTime) {
        return "Data ainda não definida";
    }

    const date =
        new Date(
            dateTime
        );

    if (
        Number.isNaN(
            date.getTime()
        )
    ) {
        return "Data ainda não definida";
    }

    return new Intl.DateTimeFormat(
        "pt-BR",
        {
            dateStyle:
                "medium",

            timeStyle:
                "short",
        }
    ).format(
        date
    );
}

function formatCurrency(
    valueInCents
) {
    return (
        Number(
            valueInCents ||
                0
        ) / 100
    ).toLocaleString(
        "pt-BR",
        {
            style:
                "currency",

            currency:
                "BRL",
        }
    );
}

// ======================================================
// STATUS
// ======================================================

function getStatusLabel(
    status
) {
    const labels = {
        DRAFT:
            "Rascunho",

        PUBLISHED:
            "Publicado",

        CANCELLED:
            "Cancelado",
    };

    return (
        labels[status] ||
        status
    );
}

// ======================================================
// CARD DO EVENTO
// ======================================================

function EventCard({
    event,
    isEnded = false,
}) {
    const metrics =
        event.metrics ||
        {
            soldTickets:
                0,

            revenueInCents:
                0,

            occupancyPercentage:
                0,
        };

    const categoryName =
        event
            .categoryTemplate
            ?.name ||
        "Categoria não definida";

    const locationText =
        [
            event.city,
            event.state,
        ]
            .filter(
                Boolean
            )
            .join(
                " - "
            );

    const statusClass =
        String(
            event.status ||
                "DRAFT"
        ).toLowerCase();

    return (
        <article className="organizer-event-card">
            <div className="organizer-event-card-top">
                <span
                    className={`organizer-event-status organizer-event-status-${statusClass}`}
                >
                    {isEnded
                        ? "Encerrado"
                        : getStatusLabel(
                              event.status
                          )}
                </span>

                <span className="organizer-event-category">
                    {
                        categoryName
                    }
                </span>
            </div>

            {event.imageUrl && (
                <img
                    src={
                        event.imageUrl
                    }
                    alt={
                        event.title
                    }
                    style={{
                        width:
                            "100%",

                        height:
                            "190px",

                        objectFit:
                            "cover",

                        borderRadius:
                            "12px",

                        marginBottom:
                            "16px",
                    }}
                />
            )}

            <div className="organizer-event-content">
                <h3>
                    {
                        event.title
                    }
                </h3>

                <p className="organizer-event-date">
                    {formatDate(
                        event.dateTime
                    )}
                </p>

                <p className="organizer-event-location">
                    {event.venueName ||
                        "Local ainda não definido"}

                    {locationText && (
                        <>
                            <br />

                            {
                                locationText
                            }
                        </>
                    )}
                </p>

                {event.source &&
                    event.source !==
                        "LOCAL" && (
                        <p
                            style={{
                                fontSize:
                                    "0.85rem",

                                opacity:
                                    0.75,
                            }}
                        >
                            Origem:{" "}
                            {event.source ===
                            "TMDB"
                                ? "TMDb"
                                : event.source ===
                                    "TICKETMASTER"
                                  ? "Ticketmaster"
                                  : event.source}
                        </p>
                    )}
            </div>

            <div className="organizer-event-meta">
                <div>
                    <span>
                        Capacidade
                    </span>

                    <strong>
                        {event.capacity ??
                            "—"}
                    </strong>
                </div>

                <div>
                    <span>
                        Status
                    </span>

                    <strong>
                        {isEnded
                            ? "Encerrado"
                            : getStatusLabel(
                                  event.status
                              )}
                    </strong>
                </div>
            </div>

            {event.status ===
                "PUBLISHED" && (
                <div className="organizer-event-summary">
                    <div>
                        <span>
                            Vendidos
                        </span>

                        <strong>
                            {
                                metrics.soldTickets
                            }
                        </strong>
                    </div>

                    <div>
                        <span>
                            Receita
                        </span>

                        <strong>
                            {formatCurrency(
                                metrics.revenueInCents
                            )}
                        </strong>
                    </div>

                    <div>
                        <span>
                            Ocupação
                        </span>

                        <strong>
                            {
                                metrics.occupancyPercentage
                            }
                            %
                        </strong>
                    </div>
                </div>
            )}

            {event.status ===
                "DRAFT" && (
                <>
                    <Link
                        to={`/organizador/eventos/${event.id}/editar`}
                        className="organizer-edit-button"
                    >
                        Editar evento
                    </Link>

                    <Link
                        to={`/organizador/eventos/${event.id}/configurar`}
                        className="organizer-edit-button"
                    >
                        Configurar ingressos
                    </Link>
                </>
            )}

            {event.status ===
                "PUBLISHED" && (
                <>
                    <Link
                        to={`/organizador/eventos/${event.id}/metricas`}
                        className="organizer-edit-button"
                    >
                        Ver métricas
                    </Link>

                    <Link
                        to={`/eventos/${event.id}`}
                        className="organizer-edit-button organizer-secondary-button"
                    >
                        Ver evento publicado
                    </Link>
                </>
            )}
        </article>
    );
}

// ======================================================
// PÁGINA
// ======================================================

export default function OrganizerPage() {
    const {
        user,
        token,
    } = useAuth();

    const [
        events,
        setEvents,
    ] = useState([]);

    const [
        activeTab,
        setActiveTab,
    ] = useState(
        "drafts"
    );

    const [
        overviewCategory,
        setOverviewCategory,
    ] = useState(
        "ALL"
    );

    const [
        overviewPeriod,
        setOverviewPeriod,
    ] = useState(
        "ALL"
    );

    const [
        overviewYear,
        setOverviewYear,
    ] = useState(
        "ALL"
    );

    const [
        isLoading,
        setIsLoading,
    ] = useState(
        true
    );

    const [
        error,
        setError,
    ] = useState("");

    // ==================================================
    // CARREGAMENTO
    // ==================================================

    const loadEvents =
        useCallback(
            async () => {
                const response =
                    await getOrganizerEvents(
                        token
                    );

                setEvents(
                    response.events ||
                        []
                );
            },
            [
                token,
            ]
        );

    useEffect(() => {
        let active =
            true;

        async function load() {
            try {
                await loadEvents();
            } catch (
                error
            ) {
                if (
                    active
                ) {
                    setError(
                        error.message ||
                            "Não foi possível carregar seus eventos."
                    );
                }
            } finally {
                if (
                    active
                ) {
                    setIsLoading(
                        false
                    );
                }
            }
        }

        load();

        return () => {
            active =
                false;
        };
    }, [
        loadEvents,
    ]);

    // ==================================================
    // SEPARAÇÃO DOS EVENTOS
    // ==================================================

    const {
        draftEvents,
        publishedEvents,
        endedEvents,
    } =
        useMemo(
            () => {
                const now =
                    new Date();

                const drafts =
                    events
                        .filter(
                            (
                                event
                            ) =>
                                event.status ===
                                "DRAFT"
                        )
                        .sort(
                            (
                                a,
                                b
                            ) =>
                                new Date(
                                    b.createdAt ||
                                        0
                                ) -
                                new Date(
                                    a.createdAt ||
                                        0
                                )
                        );

                const published =
                    events
                        .filter(
                            (
                                event
                            ) => {
                                if (
                                    event.status !==
                                    "PUBLISHED"
                                ) {
                                    return false;
                                }

                                if (
                                    !event.dateTime
                                ) {
                                    return true;
                                }

                                const date =
                                    new Date(
                                        event.dateTime
                                    );

                                return (
                                    !Number.isNaN(
                                        date.getTime()
                                    ) &&
                                    date >=
                                        now
                                );
                            }
                        )
                        .sort(
                            (
                                a,
                                b
                            ) =>
                                new Date(
                                    a.dateTime ||
                                        0
                                ) -
                                new Date(
                                    b.dateTime ||
                                        0
                                )
                        );

                const ended =
                    events
                        .filter(
                            (
                                event
                            ) => {
                                if (
                                    event.status !==
                                        "PUBLISHED" ||
                                    !event.dateTime
                                ) {
                                    return false;
                                }

                                const date =
                                    new Date(
                                        event.dateTime
                                    );

                                return (
                                    !Number.isNaN(
                                        date.getTime()
                                    ) &&
                                    date <
                                        now
                                );
                            }
                        )
                        .sort(
                            (
                                a,
                                b
                            ) =>
                                new Date(
                                    b.dateTime
                                ) -
                                new Date(
                                    a.dateTime
                                )
                        );

                return {
                    draftEvents:
                        drafts,

                    publishedEvents:
                        published,

                    endedEvents:
                        ended,
                };
            },
            [
                events,
            ]
        );

    // ==================================================
    // CATEGORIAS DA DASHBOARD
    // ==================================================

    const overviewCategories =
        useMemo(
            () =>
                Array.from(
                    new Set(
                        events
                            .filter(
                                (
                                    event
                                ) =>
                                    event.status ===
                                        "PUBLISHED" &&
                                    event
                                        .categoryTemplate
                                        ?.name
                            )
                            .map(
                                (
                                    event
                                ) =>
                                    event
                                        .categoryTemplate
                                        .name
                            )
                    )
                ).sort(
                    (
                        a,
                        b
                    ) =>
                        a.localeCompare(
                            b,
                            "pt-BR"
                        )
                ),
            [
                events,
            ]
        );

    // ==================================================
    // ANOS DA DASHBOARD
    // ==================================================

    const overviewYears =
        useMemo(
            () =>
                Array.from(
                    new Set(
                        events
                            .filter(
                                (
                                    event
                                ) =>
                                    event.status ===
                                        "PUBLISHED" &&
                                    event.dateTime
                            )
                            .map(
                                (
                                    event
                                ) => {
                                    const date =
                                        new Date(
                                            event.dateTime
                                        );

                                    return Number.isNaN(
                                        date.getTime()
                                    )
                                        ? null
                                        : date.getFullYear();
                                }
                            )
                            .filter(
                                Boolean
                            )
                    )
                ).sort(
                    (
                        a,
                        b
                    ) =>
                        b -
                        a
                ),
            [
                events,
            ]
        );

    // ==================================================
    // FILTRO DA DASHBOARD
    // ==================================================

    const overviewEvents =
        useMemo(
            () => {
                const now =
                    new Date();

                return events.filter(
                    (
                        event
                    ) => {
                        if (
                            event.status !==
                            "PUBLISHED"
                        ) {
                            return false;
                        }

                        const matchesCategory =
                            overviewCategory ===
                                "ALL" ||
                            event
                                .categoryTemplate
                                ?.name ===
                                overviewCategory;

                        let matchesYear =
                            true;

                        let matchesPeriod =
                            true;

                        if (
                            overviewYear !==
                            "ALL"
                        ) {
                            if (
                                !event.dateTime
                            ) {
                                matchesYear =
                                    false;
                            } else {
                                const eventDate =
                                    new Date(
                                        event.dateTime
                                    );

                                matchesYear =
                                    !Number.isNaN(
                                        eventDate.getTime()
                                    ) &&
                                    eventDate.getFullYear() ===
                                        Number(
                                            overviewYear
                                        );
                            }
                        }

                        if (
                            overviewPeriod !==
                            "ALL"
                        ) {
                            if (
                                !event.dateTime
                            ) {
                                matchesPeriod =
                                    false;
                            } else {
                                const eventDate =
                                    new Date(
                                        event.dateTime
                                    );

                                if (
                                    Number.isNaN(
                                        eventDate.getTime()
                                    )
                                ) {
                                    matchesPeriod =
                                        false;
                                } else if (
                                    overviewPeriod ===
                                    "UPCOMING"
                                ) {
                                    matchesPeriod =
                                        eventDate >=
                                        now;
                                } else if (
                                    overviewPeriod ===
                                    "PAST"
                                ) {
                                    matchesPeriod =
                                        eventDate <
                                        now;
                                }
                            }
                        }

                        return (
                            matchesCategory &&
                            matchesYear &&
                            matchesPeriod
                        );
                    }
                );
            },
            [
                events,
                overviewCategory,
                overviewPeriod,
                overviewYear,
            ]
        );

    // ==================================================
    // MÉTRICAS GERAIS
    // ==================================================

    const generalMetrics =
        useMemo(
            () => {
                let soldTickets =
                    0;

                let revenueInCents =
                    0;

                let totalCapacity =
                    0;

                const categoryMap =
                    new Map();

                for (
                    const event
                    of overviewEvents
                ) {
                    const eventMetrics =
                        event.metrics ||
                        {
                            soldTickets:
                                0,

                            revenueInCents:
                                0,
                        };

                    const eventSold =
                        eventMetrics
                            .soldTickets ||
                        0;

                    const eventRevenue =
                        eventMetrics
                            .revenueInCents ||
                        0;

                    soldTickets +=
                        eventSold;

                    revenueInCents +=
                        eventRevenue;

                    totalCapacity +=
                        event.capacity ||
                        0;

                    const categoryName =
                        event
                            .categoryTemplate
                            ?.name ||
                        "SEM CATEGORIA";

                    const currentCategory =
                        categoryMap.get(
                            categoryName
                        ) || {
                            name:
                                categoryName,

                            events:
                                0,

                            soldTickets:
                                0,

                            revenueInCents:
                                0,
                        };

                    currentCategory.events +=
                        1;

                    currentCategory.soldTickets +=
                        eventSold;

                    currentCategory.revenueInCents +=
                        eventRevenue;

                    categoryMap.set(
                        categoryName,
                        currentCategory
                    );
                }

                const averageTicketInCents =
                    soldTickets >
                    0
                        ? Math.round(
                              revenueInCents /
                                  soldTickets
                          )
                        : 0;

                const occupancyPercentage =
                    totalCapacity >
                    0
                        ? Number(
                              (
                                  (
                                      soldTickets /
                                      totalCapacity
                                  ) *
                                  100
                              ).toFixed(
                                  1
                              )
                          )
                        : 0;

                const byEventCategory =
                    Array.from(
                        categoryMap.values()
                    ).sort(
                        (
                            a,
                            b
                        ) =>
                            b.soldTickets -
                            a.soldTickets
                    );

                return {
                    publishedEvents:
                        overviewEvents.length,

                    soldTickets,

                    revenueInCents,

                    totalCapacity,

                    averageTicketInCents,

                    occupancyPercentage,

                    byEventCategory,
                };
            },
            [
                overviewEvents,
            ]
        );

    const maxCategorySales =
        useMemo(
            () =>
                Math.max(
                    ...generalMetrics
                        .byEventCategory
                        .map(
                            (
                                category
                            ) =>
                                category.soldTickets
                        ),
                    1
                ),
            [
                generalMetrics
                    .byEventCategory,
            ]
        );

    // ==================================================
    // ABA VISÍVEL
    // ==================================================

    const visibleEvents =
        useMemo(
            () => {
                if (
                    activeTab ===
                    "drafts"
                ) {
                    return draftEvents;
                }

                if (
                    activeTab ===
                    "published"
                ) {
                    return publishedEvents;
                }

                return endedEvents;
            },
            [
                activeTab,
                draftEvents,
                publishedEvents,
                endedEvents,
            ]
        );

    const hasActiveOverviewFilters =
        overviewCategory !==
            "ALL" ||
        overviewPeriod !==
            "ALL" ||
        overviewYear !==
            "ALL";

    function clearOverviewFilters() {
        setOverviewCategory(
            "ALL"
        );

        setOverviewPeriod(
            "ALL"
        );

        setOverviewYear(
            "ALL"
        );
    }

    function getEmptyTabTitle() {
        if (
            activeTab ===
            "drafts"
        ) {
            return "Nenhum rascunho";
        }

        if (
            activeTab ===
            "published"
        ) {
            return "Nenhum evento publicado";
        }

        return "Nenhum evento encerrado";
    }

    function getEmptyTabDescription() {
        if (
            activeTab ===
            "drafts"
        ) {
            return "Eventos ainda em criação ou configuração aparecerão nesta aba.";
        }

        if (
            activeTab ===
            "published"
        ) {
            return "Os eventos publicados que ainda vão acontecer aparecerão nesta aba.";
        }

        return "Os eventos publicados cuja data já passou aparecerão nesta aba.";
    }

    // ==================================================
    // RENDER
    // ==================================================

    return (
        <main className="account-page organizer-page">
            <header className="account-heading organizer-heading">
                <div>
                    <p className="account-eyebrow">
                        Organização
                    </p>

                    <h1>
                        Painel do Organizador
                    </h1>

                    <p>
                        Olá, {user.name}.
                        Gerencie seus eventos,
                        ingressos e vendas.
                    </p>
                </div>

                <AccountLogout />
            </header>

            {/* ==========================================
                AÇÕES
               ========================================== */}

            <section className="organizer-toolbar">
                <div>
                    <p className="account-eyebrow">
                        Seus eventos
                    </p>

                    <h2>
                        Gerenciamento
                    </h2>

                    <p>
                        Crie um evento do zero
                        ou escolha opções dos
                        catálogos externos.
                    </p>
                </div>

                <div
                    style={{
                        display:
                            "flex",

                        gap:
                            "12px",

                        flexWrap:
                            "wrap",
                    }}
                >
                    <Link
                        to="/organizador/eventos/novo"
                        className="organizer-create-button"
                    >
                        + Criar evento
                    </Link>

                    <Link
                        to="/organizador/eventos/importar"
                        className="organizer-create-button"
                    >
                        + Importar eventos
                    </Link>
                </div>
            </section>

            {error && (
                <section
                    className="organizer-status organizer-status-error"
                    role="alert"
                >
                    <p>
                        {error}
                    </p>
                </section>
            )}

            {isLoading && (
                <section className="organizer-status">
                    <p>
                        Carregando eventos...
                    </p>
                </section>
            )}

            {!isLoading &&
                !error &&
                events.length ===
                    0 && (
                    <section className="organizer-empty">
                        <p className="account-eyebrow">
                            Comece por aqui
                        </p>

                        <h2>
                            Você ainda não possui eventos
                        </h2>

                        <p>
                            Crie um evento manualmente
                            ou escolha opções disponíveis
                            no catálogo externo.
                        </p>

                        <div
                            style={{
                                display:
                                    "flex",

                                justifyContent:
                                    "center",

                                gap:
                                    "12px",

                                flexWrap:
                                    "wrap",

                                marginTop:
                                    "20px",
                            }}
                        >
                            <Link
                                to="/organizador/eventos/novo"
                                className="organizer-create-button"
                            >
                                + Criar evento
                            </Link>

                            <Link
                                to="/organizador/eventos/importar"
                                className="organizer-create-button"
                            >
                                + Importar eventos
                            </Link>
                        </div>
                    </section>
                )}

            {!isLoading &&
                !error &&
                events.length >
                    0 && (
                    <>
                        {/* ==================================
                            DASHBOARD
                           ================================== */}

                        <section className="organizer-overview">
                            <div className="organizer-overview-heading">
                                <div>
                                    <p className="account-eyebrow">
                                        Visão geral
                                    </p>

                                    <h2>
                                        Desempenho dos eventos
                                    </h2>

                                    <p>
                                        Resumo das vendas dos
                                        eventos publicados.
                                    </p>
                                </div>
                            </div>

                            <div className="organizer-overview-filters">
                                <label>
                                    <span>
                                        Categoria
                                    </span>

                                    <select
                                        value={
                                            overviewCategory
                                        }
                                        onChange={(
                                            event
                                        ) =>
                                            setOverviewCategory(
                                                event
                                                    .target
                                                    .value
                                            )
                                        }
                                    >
                                        <option value="ALL">
                                            Todas as categorias
                                        </option>

                                        {overviewCategories.map(
                                            (
                                                category
                                            ) => (
                                                <option
                                                    key={
                                                        category
                                                    }
                                                    value={
                                                        category
                                                    }
                                                >
                                                    {
                                                        category
                                                    }
                                                </option>
                                            )
                                        )}
                                    </select>
                                </label>

                                <label>
                                    <span>
                                        Período
                                    </span>

                                    <select
                                        value={
                                            overviewPeriod
                                        }
                                        onChange={(
                                            event
                                        ) =>
                                            setOverviewPeriod(
                                                event
                                                    .target
                                                    .value
                                            )
                                        }
                                    >
                                        <option value="ALL">
                                            Todos os períodos
                                        </option>

                                        <option value="UPCOMING">
                                            Próximos
                                        </option>

                                        <option value="PAST">
                                            Encerrados
                                        </option>
                                    </select>
                                </label>

                                <label>
                                    <span>
                                        Ano
                                    </span>

                                    <select
                                        value={
                                            overviewYear
                                        }
                                        onChange={(
                                            event
                                        ) =>
                                            setOverviewYear(
                                                event
                                                    .target
                                                    .value
                                            )
                                        }
                                    >
                                        <option value="ALL">
                                            Todos os anos
                                        </option>

                                        {overviewYears.map(
                                            (
                                                year
                                            ) => (
                                                <option
                                                    key={
                                                        year
                                                    }
                                                    value={
                                                        year
                                                    }
                                                >
                                                    {
                                                        year
                                                    }
                                                </option>
                                            )
                                        )}
                                    </select>
                                </label>

                                <button
                                    type="button"
                                    className="organizer-secondary-button organizer-overview-clear-button"
                                    onClick={
                                        clearOverviewFilters
                                    }
                                    disabled={
                                        !hasActiveOverviewFilters
                                    }
                                >
                                    Limpar filtros
                                </button>
                            </div>

                            <div className="organizer-overview-filter-summary">
                                <span>
                                    {
                                        generalMetrics.publishedEvents
                                    }{" "}
                                    {generalMetrics.publishedEvents ===
                                    1
                                        ? "evento publicado"
                                        : "eventos publicados"}{" "}
                                    no filtro atual
                                </span>
                            </div>

                            <div className="organizer-overview-kpis">
                                <article>
                                    <span>
                                        Receita
                                    </span>

                                    <strong>
                                        {formatCurrency(
                                            generalMetrics.revenueInCents
                                        )}
                                    </strong>

                                    <small>
                                        receita bruta
                                    </small>
                                </article>

                                <article>
                                    <span>
                                        Ingressos vendidos
                                    </span>

                                    <strong>
                                        {
                                            generalMetrics.soldTickets
                                        }
                                    </strong>

                                    <small>
                                        total vendido
                                    </small>
                                </article>

                                <article>
                                    <span>
                                        Ticket médio
                                    </span>

                                    <strong>
                                        {formatCurrency(
                                            generalMetrics.averageTicketInCents
                                        )}
                                    </strong>

                                    <small>
                                        média por ingresso
                                    </small>
                                </article>

                                <article>
                                    <span>
                                        Ocupação geral
                                    </span>

                                    <strong>
                                        {
                                            generalMetrics.occupancyPercentage
                                        }
                                        %
                                    </strong>

                                    <small>
                                        eventos publicados
                                    </small>
                                </article>

                                <article>
                                    <span>
                                        Eventos publicados
                                    </span>

                                    <strong>
                                        {
                                            generalMetrics.publishedEvents
                                        }
                                    </strong>

                                    <small>
                                        no filtro atual
                                    </small>
                                </article>
                            </div>

                            {/* ==============================
                                VENDAS POR CATEGORIA
                               ============================== */}

                            <article className="organizer-category-dashboard">
                                <div className="organizer-category-dashboard-heading">
                                    <div>
                                        <p className="account-eyebrow">
                                            Vendas por categoria
                                        </p>

                                        <h3>
                                            Categorias de eventos
                                        </h3>
                                    </div>

                                    <span>
                                        Ingressos vendidos
                                    </span>
                                </div>

                                {generalMetrics
                                    .byEventCategory
                                    .length ===
                                0 ? (
                                    <div className="organizer-category-empty">
                                        Nenhuma venda registrada para os filtros selecionados.
                                    </div>
                                ) : (
                                    <div className="organizer-category-chart">
                                        {generalMetrics
                                            .byEventCategory
                                            .map(
                                                (
                                                    category
                                                ) => {
                                                    const barPercentage =
                                                        (
                                                            category.soldTickets /
                                                            maxCategorySales
                                                        ) *
                                                        100;

                                                    const salesPercentage =
                                                        generalMetrics.soldTickets >
                                                        0
                                                            ? Math.round(
                                                                  (
                                                                      category.soldTickets /
                                                                      generalMetrics.soldTickets
                                                                  ) *
                                                                      100
                                                              )
                                                            : 0;

                                                    return (
                                                        <div
                                                            className="organizer-category-chart-row"
                                                            key={
                                                                category.name
                                                            }
                                                        >
                                                            <div className="organizer-category-chart-info">
                                                                <div>
                                                                    <strong>
                                                                        {
                                                                            category.name
                                                                        }
                                                                    </strong>

                                                                    <span>
                                                                        {
                                                                            category.events
                                                                        }{" "}
                                                                        {category.events ===
                                                                        1
                                                                            ? "evento"
                                                                            : "eventos"}
                                                                    </span>
                                                                </div>

                                                                <div className="organizer-category-chart-values">
                                                                    <strong>
                                                                        {
                                                                            category.soldTickets
                                                                        }
                                                                    </strong>

                                                                    <span>
                                                                        {
                                                                            salesPercentage
                                                                        }
                                                                        %
                                                                    </span>
                                                                </div>
                                                            </div>

                                                            <div className="organizer-category-chart-track">
                                                                <div
                                                                    className="organizer-category-chart-fill"
                                                                    style={{
                                                                        width:
                                                                            `${barPercentage}%`,
                                                                    }}
                                                                />
                                                            </div>

                                                            <div className="organizer-category-chart-footer">
                                                                <span>
                                                                    Receita
                                                                </span>

                                                                <strong>
                                                                    {formatCurrency(
                                                                        category.revenueInCents
                                                                    )}
                                                                </strong>
                                                            </div>
                                                        </div>
                                                    );
                                                }
                                            )}
                                    </div>
                                )}
                            </article>
                        </section>

                        {/* ==================================
                            ABAS
                           ================================== */}

                        <section
                            className="organizer-event-tabs"
                            aria-label="Filtro de eventos do organizador"
                        >
                            <button
                                type="button"
                                className={
                                    activeTab ===
                                    "drafts"
                                        ? "organizer-event-tab organizer-event-tab-active"
                                        : "organizer-event-tab"
                                }
                                onClick={() =>
                                    setActiveTab(
                                        "drafts"
                                    )
                                }
                            >
                                Rascunhos

                                <span>
                                    {
                                        draftEvents.length
                                    }
                                </span>
                            </button>

                            <button
                                type="button"
                                className={
                                    activeTab ===
                                    "published"
                                        ? "organizer-event-tab organizer-event-tab-active"
                                        : "organizer-event-tab"
                                }
                                onClick={() =>
                                    setActiveTab(
                                        "published"
                                    )
                                }
                            >
                                Publicados

                                <span>
                                    {
                                        publishedEvents.length
                                    }
                                </span>
                            </button>

                            <button
                                type="button"
                                className={
                                    activeTab ===
                                    "ended"
                                        ? "organizer-event-tab organizer-event-tab-active"
                                        : "organizer-event-tab"
                                }
                                onClick={() =>
                                    setActiveTab(
                                        "ended"
                                    )
                                }
                            >
                                Encerrados

                                <span>
                                    {
                                        endedEvents.length
                                    }
                                </span>
                            </button>
                        </section>

                        {/* ==================================
                            LISTAGEM
                           ================================== */}

                        {visibleEvents.length ===
                        0 ? (
                            <section className="organizer-empty organizer-tab-empty">
                                <h2>
                                    {getEmptyTabTitle()}
                                </h2>

                                <p>
                                    {getEmptyTabDescription()}
                                </p>
                            </section>
                        ) : (
                            <section className="organizer-events-grid">
                                {visibleEvents.map(
                                    (
                                        event
                                    ) => (
                                        <EventCard
                                            key={
                                                event.id
                                            }
                                            event={
                                                event
                                            }
                                            isEnded={
                                                activeTab ===
                                                "ended"
                                            }
                                        />
                                    )
                                )}
                            </section>
                        )}
                    </>
                )}
        </main>
    );
}