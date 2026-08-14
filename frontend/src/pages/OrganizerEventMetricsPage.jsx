import {
    useCallback,
    useEffect,
    useMemo,
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
    getOrganizerEvents,
} from "../services/eventService.js";

import "./OrganizerEventMetricsPage.css";

function formatCurrency(
    valueInCents
) {
    return (
        (
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

function formatDate(
    dateTime
) {
    return new Intl.DateTimeFormat(
        "pt-BR",
        {
            dateStyle:
                "long",

            timeStyle:
                "short",
        }
    ).format(
        new Date(
            dateTime
        )
    );
}

function getPercentage(
    value,
    total
) {
    if (
        !total ||
        total <= 0
    ) {
        return 0;
    }

    return Math.min(
        Math.round(
            (
                value /
                total
            ) *
                100
        ),
        100
    );
}

export default function OrganizerEventMetricsPage() {
    const {
        eventId,
    } = useParams();

    const {
        token,
    } = useAuth();

    const [
        event,
        setEvent,
    ] = useState(null);

    const [
        isLoading,
        setIsLoading,
    ] = useState(true);

    const [
        error,
        setError,
    ] = useState("");

    const loadEvent =
        useCallback(
            async () => {
                const response =
                    await getOrganizerEvents(
                        token
                    );

                const foundEvent =
                    (
                        response.events ||
                        []
                    ).find(
                        (item) =>
                            item.id ===
                            eventId
                    );

                if (!foundEvent) {
                    throw new Error(
                        "Evento não encontrado."
                    );
                }

                setEvent(
                    foundEvent
                );
            },
            [
                eventId,
                token,
            ]
        );

    useEffect(() => {
        let active =
            true;

        async function load() {
            try {
                await loadEvent();
            } catch (error) {
                if (active) {
                    setError(
                        error.message ||
                        "Não foi possível carregar as métricas."
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
        loadEvent,
    ]);

    const metrics =
        event?.metrics ||
        {
            soldTickets:
                0,

            revenueInCents:
                0,

            occupancyPercentage:
                0,

            remainingCapacity:
                event?.capacity ||
                0,

            byCategory:
                [],

            bySector:
                [],
        };

    const averageTicketInCents =
        metrics.soldTickets >
        0
            ? Math.round(
                  metrics.revenueInCents /
                      metrics.soldTickets
              )
            : 0;

    const maxCategoryQuantity =
        useMemo(
            () =>
                Math.max(
                    ...metrics
                        .byCategory
                        .map(
                            (
                                item
                            ) =>
                                item.quantity
                        ),
                    1
                ),
            [
                metrics.byCategory,
            ]
        );

    const maxSectorQuantity =
        useMemo(
            () =>
                Math.max(
                    ...metrics
                        .bySector
                        .map(
                            (
                                item
                            ) =>
                                item.quantity
                        ),
                    1
                ),
            [
                metrics.bySector,
            ]
        );

    if (isLoading) {
        return (
            <main className="account-page metrics-page">
                <section className="metrics-state">
                    Carregando métricas...
                </section>
            </main>
        );
    }

    if (
        error ||
        !event
    ) {
        return (
            <main className="account-page metrics-page">
                <section className="metrics-state metrics-state-error">
                    <h1>
                        Não foi possível abrir o painel
                    </h1>

                    <p>
                        {error}
                    </p>

                    <Link
                        to="/organizador"
                        className="metrics-back-button"
                    >
                        Voltar ao painel
                    </Link>
                </section>
            </main>
        );
    }

    const soldPercentage =
        getPercentage(
            metrics.soldTickets,
            event.capacity
        );

    const eventHasEnded =
        new Date(
            event.dateTime
        ) <
        new Date();

    return (
        <main className="account-page metrics-page">
            <header className="metrics-header">
                <div>
                    <Link
                        to="/organizador"
                        className="metrics-back-link"
                    >
                        ← Voltar ao painel
                    </Link>

                    <p className="account-eyebrow">
                        Métricas do evento
                    </p>

                    <h1>
                        {event.title}
                    </h1>

                    <p className="metrics-event-info">
                        {formatDate(
                            event.dateTime
                        )}
                        {" • "}
                        {event.venueName}
                        {" • "}
                        {event.city}
                        {" - "}
                        {event.state}
                    </p>

                    <p className="metrics-event-info">
                        {eventHasEnded
                            ? "Evento realizado"
                            : "Evento futuro"}
                    </p>
                </div>

                <Link
                    to={`/eventos/${event.id}`}
                    className="metrics-public-button"
                >
                    Ver evento publicado
                </Link>
            </header>

            <section className="metrics-kpi-grid">
                <article className="metrics-kpi-card">
                    <span>
                        Receita
                    </span>

                    <strong>
                        {formatCurrency(
                            metrics.revenueInCents
                        )}
                    </strong>

                    <small>
                        valor bruto dos Tickets
                    </small>
                </article>

                <article className="metrics-kpi-card">
                    <span>
                        Ingressos vendidos
                    </span>

                    <strong>
                        {
                            metrics.soldTickets
                        }
                    </strong>

                    <small>
                        de {event.capacity}
                    </small>
                </article>

                <article className="metrics-kpi-card">
                    <span>
                        Ticket médio
                    </span>

                    <strong>
                        {formatCurrency(
                            averageTicketInCents
                        )}
                    </strong>

                    <small>
                        média por ingresso vendido
                    </small>
                </article>

                <article className="metrics-kpi-card">
                    <span>
                        Ocupação
                    </span>

                    <strong>
                        {
                            metrics.occupancyPercentage
                        }
                        %
                    </strong>

                    <small>
                        capacidade utilizada
                    </small>
                </article>

                <article className="metrics-kpi-card">
                    <span>
                        Lugares disponíveis
                    </span>

                    <strong>
                        {
                            metrics.remainingCapacity
                        }
                    </strong>

                    <small>
                        capacidade restante
                    </small>
                </article>
            </section>

            <section className="metrics-dashboard-grid">
                <article className="metrics-panel metrics-occupancy-panel">
                    <div className="metrics-panel-heading">
                        <div>
                            <span>
                                Ocupação geral
                            </span>

                            <h2>
                                Vendidos x capacidade
                            </h2>
                        </div>

                        <strong>
                            {
                                soldPercentage
                            }
                            %
                        </strong>
                    </div>

                    <div className="metrics-big-progress">
                        <div
                            className="metrics-big-progress-fill"
                            style={{
                                width:
                                    `${soldPercentage}%`,
                            }}
                        />
                    </div>

                    <div className="metrics-progress-labels">
                        <span>
                            {
                                metrics.soldTickets
                            }
                            {" "}
                            vendidos
                        </span>

                        <span>
                            {
                                metrics.remainingCapacity
                            }
                            {" "}
                            disponíveis
                        </span>

                        <span>
                            {
                                event.capacity
                            }
                            {" "}
                            total
                        </span>
                    </div>
                </article>

                <article className="metrics-panel">
                    <div className="metrics-panel-heading">
                        <div>
                            <span>
                                Distribuição
                            </span>

                            <h2>
                                Vendas por categoria
                            </h2>
                        </div>
                    </div>

                    {metrics
                        .byCategory
                        .length ===
                    0 ? (
                        <div className="metrics-empty-chart">
                            Nenhuma venda registrada.
                        </div>
                    ) : (
                        <div className="metrics-bar-chart">
                            {metrics
                                .byCategory
                                .map(
                                    (
                                        item
                                    ) => {
                                        const barPercentage =
                                            (
                                                item.quantity /
                                                maxCategoryQuantity
                                            ) *
                                            100;

                                        const salesPercentage =
                                            getPercentage(
                                                item.quantity,
                                                metrics.soldTickets
                                            );

                                        return (
                                            <div
                                                className="metrics-bar-row"
                                                key={
                                                    item.name
                                                }
                                            >
                                                <div className="metrics-bar-label">
                                                    <div>
                                                        <span>
                                                            {
                                                                item.name
                                                            }
                                                        </span>

                                                        <small>
                                                            {
                                                                item.quantity
                                                            }
                                                            {" "}
                                                            {item.quantity ===
                                                            1
                                                                ? "ingresso"
                                                                : "ingressos"}
                                                            {" • "}
                                                            {
                                                                salesPercentage
                                                            }
                                                            %
                                                        </small>
                                                    </div>

                                                    <div className="metrics-bar-value">
                                                        <strong>
                                                            {formatCurrency(
                                                                item.revenueInCents
                                                            )}
                                                        </strong>

                                                        <small>
                                                            receita
                                                        </small>
                                                    </div>
                                                </div>

                                                <div className="metrics-bar-track">
                                                    <div
                                                        className="metrics-bar-fill"
                                                        style={{
                                                            width:
                                                                `${barPercentage}%`,
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        );
                                    }
                                )}
                        </div>
                    )}
                </article>

                <article className="metrics-panel">
                    <div className="metrics-panel-heading">
                        <div>
                            <span>
                                Distribuição
                            </span>

                            <h2>
                                Vendas por setor
                            </h2>
                        </div>
                    </div>

                    {metrics
                        .bySector
                        .length ===
                    0 ? (
                        <div className="metrics-empty-chart">
                            Nenhuma venda registrada.
                        </div>
                    ) : (
                        <div className="metrics-bar-chart">
                            {metrics
                                .bySector
                                .map(
                                    (
                                        item
                                    ) => {
                                        const barPercentage =
                                            (
                                                item.quantity /
                                                maxSectorQuantity
                                            ) *
                                            100;

                                        const salesPercentage =
                                            getPercentage(
                                                item.quantity,
                                                metrics.soldTickets
                                            );

                                        return (
                                            <div
                                                className="metrics-bar-row"
                                                key={
                                                    item.name
                                                }
                                            >
                                                <div className="metrics-bar-label">
                                                    <div>
                                                        <span>
                                                            {
                                                                item.name
                                                            }
                                                        </span>

                                                        <small>
                                                            {
                                                                item.quantity
                                                            }
                                                            {" "}
                                                            {item.quantity ===
                                                            1
                                                                ? "ingresso"
                                                                : "ingressos"}
                                                            {" • "}
                                                            {
                                                                salesPercentage
                                                            }
                                                            %
                                                        </small>
                                                    </div>

                                                    <div className="metrics-bar-value">
                                                        <strong>
                                                            {formatCurrency(
                                                                item.revenueInCents
                                                            )}
                                                        </strong>

                                                        <small>
                                                            receita
                                                        </small>
                                                    </div>
                                                </div>

                                                <div className="metrics-bar-track">
                                                    <div
                                                        className="metrics-bar-fill"
                                                        style={{
                                                            width:
                                                                `${barPercentage}%`,
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        );
                                    }
                                )}
                        </div>
                    )}
                </article>

                <article className="metrics-panel metrics-summary-panel">
                    <div className="metrics-panel-heading">
                        <div>
                            <span>
                                Resumo comercial
                            </span>

                            <h2>
                                Visão do evento
                            </h2>
                        </div>
                    </div>

                    <div className="metrics-summary-list">
                        <div>
                            <span>
                                Situação
                            </span>

                            <strong>
                                {eventHasEnded
                                    ? "Realizado"
                                    : "A realizar"}
                            </strong>
                        </div>

                        <div>
                            <span>
                                Capacidade total
                            </span>

                            <strong>
                                {
                                    event.capacity
                                }
                            </strong>
                        </div>

                        <div>
                            <span>
                                Ingressos vendidos
                            </span>

                            <strong>
                                {
                                    metrics.soldTickets
                                }
                            </strong>
                        </div>

                        <div>
                            <span>
                                Disponibilidade
                            </span>

                            <strong>
                                {
                                    metrics.remainingCapacity
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
                                Ticket médio
                            </span>

                            <strong>
                                {formatCurrency(
                                    averageTicketInCents
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
                </article>
            </section>
        </main>
    );
}