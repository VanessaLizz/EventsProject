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

function formatDate(
    dateTime
) {
    return new Intl.DateTimeFormat(
        "pt-BR",
        {
            dateStyle:
                "medium",

            timeStyle:
                "short",
        }
    ).format(
        new Date(
            dateTime
        )
    );
}

function formatCurrency(
    valueInCents
) {
    return (
        valueInCents / 100
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

function EventCard({
    event,
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

    return (
        <article className="organizer-event-card">
            <div className="organizer-event-card-top">
                <span
                    className={`organizer-event-status organizer-event-status-${event.status.toLowerCase()}`}
                >
                    {getStatusLabel(
                        event.status
                    )}
                </span>

                <span className="organizer-event-category">
                    {
                        event
                            .categoryTemplate
                            ?.name
                    }
                </span>
            </div>

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
                    {
                        event.venueName
                    }

                    <br />

                    {
                        event.city
                    }{" "}
                    -{" "}
                    {
                        event.state
                    }
                </p>
            </div>

            <div className="organizer-event-meta">
                <div>
                    <span>
                        Capacidade
                    </span>

                    <strong>
                        {
                            event.capacity
                        }
                    </strong>
                </div>

                <div>
                    <span>
                        Status
                    </span>

                    <strong>
                        {getStatusLabel(
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
        "upcoming"
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
    ] = useState(true);

    const [
        error,
        setError,
    ] = useState("");

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
            } catch (error) {
                if (active) {
                    setError(
                        error.message ||
                        "Não foi possível carregar seus eventos."
                    );
                }
            } finally {
                if (active) {
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

    const {
        upcomingEvents,
        pastEvents,
    } =
        useMemo(
            () => {
                const now =
                    new Date();

                const upcoming =
                    events
                        .filter(
                            (
                                event
                            ) =>
                                new Date(
                                    event.dateTime
                                ) >=
                                now
                        )
                        .sort(
                            (
                                a,
                                b
                            ) =>
                                new Date(
                                    a.dateTime
                                ) -
                                new Date(
                                    b.dateTime
                                )
                        );

                const past =
                    events
                        .filter(
                            (
                                event
                            ) =>
                                new Date(
                                    event.dateTime
                                ) <
                                now
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
                    upcomingEvents:
                        upcoming,

                    pastEvents:
                        past,
                };
            },
            [
                events,
            ]
        );

    const overviewCategories =
        useMemo(
            () =>
                Array.from(
                    new Set(
                        events
                            .filter(
                                (event) =>
                                    event.status ===
                                    "PUBLISHED"
                            )
                            .map(
                                (event) =>
                                    event
                                        .categoryTemplate
                                        ?.name
                            )
                            .filter(
                                Boolean
                            )
                    )
                ).sort(
                    (a, b) =>
                        a.localeCompare(
                            b,
                            "pt-BR"
                        )
                ),
            [
                events,
            ]
        );

    const overviewYears =
        useMemo(
            () =>
                Array.from(
                    new Set(
                        events
                            .filter(
                                (event) =>
                                    event.status ===
                                    "PUBLISHED"
                            )
                            .map(
                                (event) =>
                                    new Date(
                                        event.dateTime
                                    ).getFullYear()
                            )
                    )
                ).sort(
                    (a, b) =>
                        b - a
                ),
            [
                events,
            ]
        );

    const overviewEvents =
        useMemo(
            () => {
                const now =
                    new Date();

                return events.filter(
                    (event) => {
                        if (
                            event.status !==
                            "PUBLISHED"
                        ) {
                            return false;
                        }

                        const eventDate =
                            new Date(
                                event.dateTime
                            );

                        const matchesCategory =
                            overviewCategory ===
                                "ALL" ||
                            event
                                .categoryTemplate
                                ?.name ===
                                overviewCategory;

                        const matchesYear =
                            overviewYear ===
                                "ALL" ||
                            eventDate
                                .getFullYear() ===
                                Number(
                                    overviewYear
                                );

                        const matchesPeriod =
                            overviewPeriod ===
                                "ALL" ||
                            (
                                overviewPeriod ===
                                    "UPCOMING" &&
                                eventDate >=
                                    now
                            ) ||
                            (
                                overviewPeriod ===
                                    "PAST" &&
                                eventDate <
                                    now
                            );

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

    const generalMetrics =
        useMemo(
            () => {
                const publishedEvents =
                    overviewEvents;

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
                    of publishedEvents
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
                        publishedEvents.length,

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
                                category
                                    .soldTickets
                        ),
                    1
                ),
            [
                generalMetrics
                    .byEventCategory,
            ]
        );

    const visibleEvents =
        activeTab ===
        "upcoming"
            ? upcomingEvents
            : pastEvents;

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

            <section className="organizer-toolbar">
                <div>
                    <p className="account-eyebrow">
                        Seus eventos
                    </p>

                    <h2>
                        Gerenciamento
                    </h2>

                    <p>
                        Crie novos eventos ou
                        acompanhe os eventos
                        existentes.
                    </p>
                </div>

                <Link
                    to="/organizador/eventos/novo"
                    className="organizer-create-button"
                >
                    + Criar evento
                </Link>
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
                            Você ainda não
                            possui eventos
                        </h2>

                        <p>
                            Crie seu primeiro
                            evento para
                            configurar setores,
                            modalidades, lotes
                            e ingressos.
                        </p>
                    </section>
                )}

            {!isLoading &&
                !error &&
                events.length >
                    0 && (
                    <>
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
                                            Realizados
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
                                        generalMetrics
                                            .publishedEvents
                                    }
                                    {" "}
                                    {generalMetrics
                                        .publishedEvents ===
                                    1
                                        ? "evento publicado"
                                        : "eventos publicados"}
                                    {" "}
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
                                            generalMetrics
                                                .revenueInCents
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
                                            generalMetrics
                                                .soldTickets
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
                                            generalMetrics
                                                .averageTicketInCents
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
                                            generalMetrics
                                                .occupancyPercentage
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
                                            generalMetrics
                                                .publishedEvents
                                        }
                                    </strong>

                                    <small>
                                        no filtro atual
                                    </small>
                                </article>
                            </div>

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
                                                        generalMetrics
                                                            .soldTickets >
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
                                                                        }
                                                                        {" "}
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
                                                                        category
                                                                            .revenueInCents
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

                        <section
                            className="organizer-event-tabs"
                            aria-label="Filtro de eventos do organizador"
                        >
                            <button
                                type="button"
                                className={
                                    activeTab ===
                                    "upcoming"
                                        ? "organizer-event-tab organizer-event-tab-active"
                                        : "organizer-event-tab"
                                }
                                onClick={() =>
                                    setActiveTab(
                                        "upcoming"
                                    )
                                }
                            >
                                Próximos

                                <span>
                                    {
                                        upcomingEvents.length
                                    }
                                </span>
                            </button>

                            <button
                                type="button"
                                className={
                                    activeTab ===
                                    "past"
                                        ? "organizer-event-tab organizer-event-tab-active"
                                        : "organizer-event-tab"
                                }
                                onClick={() =>
                                    setActiveTab(
                                        "past"
                                    )
                                }
                            >
                                Realizados

                                <span>
                                    {
                                        pastEvents.length
                                    }
                                </span>
                            </button>
                        </section>

                        {visibleEvents.length ===
                        0 ? (
                            <section className="organizer-empty organizer-tab-empty">
                                <h2>
                                    {activeTab ===
                                    "upcoming"
                                        ? "Nenhum evento futuro"
                                        : "Nenhum evento realizado"}
                                </h2>

                                <p>
                                    {activeTab ===
                                    "upcoming"
                                        ? "Seus próximos eventos aparecerão nesta aba."
                                        : "Os eventos já realizados aparecerão nesta aba."}
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