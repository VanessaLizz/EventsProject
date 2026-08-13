import {
    useEffect,
    useState,
} from "react";

import {
    Link,
    useParams,
} from "react-router";

import {
    getEventById,
} from "../services/eventService.js";

function formatCurrency(
    valueInCents
) {
    return (
        valueInCents / 100
    ).toLocaleString(
        "pt-BR",
        {
            style: "currency",
            currency: "BRL",
        }
    );
}

function formatEventDate(
    dateTime
) {
    return new Date(
        dateTime
    ).toLocaleString(
        "pt-BR",
        {
            dateStyle: "full",
            timeStyle: "short",
        }
    );
}

export default function EventDetailsPage() {
    const { eventId } =
        useParams();

    const [event, setEvent] =
        useState(null);

    const [isLoading, setIsLoading] =
        useState(true);

    const [error, setError] =
        useState("");

    useEffect(() => {
        async function loadEvent() {
            try {
                const response =
                    await getEventById(
                        eventId
                    );

                setEvent(
                    response.event
                );
            } catch (error) {
                setError(
                    error.message ||
                    "Não foi possível carregar o evento."
                );
            } finally {
                setIsLoading(false);
            }
        }

        loadEvent();
    }, [eventId]);

    if (isLoading) {
        return (
            <main className="event-details-page">
                <div className="event-details-status">
                    <p>
                        Carregando evento...
                    </p>
                </div>
            </main>
        );
    }

    if (error || !event) {
        return (
            <main className="event-details-page">
                <div
                    className="event-details-status event-details-error"
                    role="alert"
                >
                    <h1>
                        Evento indisponível
                    </h1>

                    <p>
                        {error ||
                            "Não foi possível encontrar este evento."}
                    </p>

                    <Link to="/eventos">
                        Voltar para eventos
                    </Link>
                </div>
            </main>
        );
    }

    const hasSectors =
        Array.isArray(
            event.sectors
        ) &&
        event.sectors.length > 0;

    return (
        <main className="event-details-page">
            <Link
                to="/eventos"
                className="event-details-back"
            >
                ← Voltar para eventos
            </Link>

            <section className="event-details-hero">
                <div className="event-details-visual">
                    {event.imageUrl ? (
                        <img
                            src={
                                event.imageUrl
                            }
                            alt={`Imagem do evento ${event.title}`}
                        />
                    ) : (
                        <div
                            className="event-details-placeholder"
                            aria-hidden="true"
                        >
                            <span>
                                Boraí
                            </span>
                        </div>
                    )}
                </div>

                <div className="event-details-info">
                    {event
                        .categoryTemplate
                        ?.name && (
                            <p className="event-details-category">
                                {
                                    event
                                        .categoryTemplate
                                        .name
                                }
                            </p>
                        )}

                    <h1>
                        {event.title}
                    </h1>

                    <p className="event-details-date">
                        {formatEventDate(
                            event.dateTime
                        )}
                    </p>

                    <div className="event-details-location">
                        {event.venueName && (
                            <strong>
                                {
                                    event.venueName
                                }
                            </strong>
                        )}

                        <span>
                            {event.address &&
                                `${event.address} — `}

                            {event.city}

                            {event.state &&
                                `/${event.state}`}
                        </span>
                    </div>

                    {event.description ? (
                        <p className="event-details-description">
                            {
                                event.description
                            }
                        </p>
                    ) : (
                        <p className="event-details-description event-details-no-description">
                            Mais informações sobre
                            este evento estarão
                            disponíveis em breve.
                        </p>
                    )}
                </div>
            </section>

            <section className="event-ticket-section">
                <div className="section-heading">
                    <div>
                        <p>
                            Ingressos
                        </p>

                        <h2>
                            Opções disponíveis
                        </h2>
                    </div>
                </div>

                {!hasSectors ? (
                    <div className="tickets-empty">
                        <h3>
                            Ingressos ainda não disponíveis
                        </h3>

                        <p>
                            As opções de ingresso
                            para este evento serão
                            divulgadas em breve.
                        </p>
                    </div>
                ) : (
                    <div className="ticket-sector-list">
                        {event.sectors.map(
                            (sector) => {
                                const modalities =
                                    sector.modalities ||
                                    [];

                                return (
                                    <section
                                        key={
                                            sector.id
                                        }
                                        className="ticket-sector"
                                    >
                                        <div className="ticket-sector-heading">
                                            <p>
                                                Setor
                                            </p>

                                            <h3>
                                                {
                                                    sector
                                                        .sectorTemplate
                                                        ?.name
                                                }
                                            </h3>
                                        </div>

                                        {modalities.length ===
                                            0 ? (
                                            <p className="ticket-unavailable">
                                                Nenhuma
                                                modalidade
                                                disponível
                                                neste setor.
                                            </p>
                                        ) : (
                                            <div className="ticket-modality-list">
                                                {modalities.map(
                                                    (
                                                        modality
                                                    ) => {
                                                        const batches =
                                                            modality.batches ||
                                                            [];

                                                        return (
                                                            <article
                                                                key={
                                                                    modality.id
                                                                }
                                                                className="ticket-modality"
                                                            >
                                                                <h4>
                                                                    {
                                                                        modality
                                                                            .modalityTemplate
                                                                            ?.name
                                                                    }
                                                                </h4>

                                                                {batches.length ===
                                                                    0 ? (
                                                                    <p className="ticket-unavailable">
                                                                        Lotes
                                                                        ainda
                                                                        não
                                                                        disponíveis.
                                                                    </p>
                                                                ) : (
                                                                    batches.map(
                                                                        (
                                                                            batch
                                                                        ) => {
                                                                            const prices =
                                                                                batch.prices ||
                                                                                [];

                                                                            return (
                                                                                <div
                                                                                    key={
                                                                                        batch.id
                                                                                    }
                                                                                    className="ticket-batch"
                                                                                >
                                                                                    <div className="ticket-batch-heading">
                                                                                        <strong>
                                                                                            {
                                                                                                batch.name
                                                                                            }
                                                                                        </strong>
                                                                                    </div>

                                                                                    {prices.length ===
                                                                                        0 ? (
                                                                                        <p className="ticket-unavailable">
                                                                                            Preços
                                                                                            ainda
                                                                                            não
                                                                                            disponíveis.
                                                                                        </p>
                                                                                    ) : (
                                                                                        <ul>
                                                                                            {prices.map(
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
                                                                                                                    ?.priceCategoryTemplate
                                                                                                                    ?.name
                                                                                                            }
                                                                                                        </span>

                                                                                                        <strong>
                                                                                                            {formatCurrency(
                                                                                                                price.priceInCents
                                                                                                            )}
                                                                                                        </strong>
                                                                                                    </li>
                                                                                                )
                                                                                            )}
                                                                                        </ul>
                                                                                    )}
                                                                                </div>
                                                                            );
                                                                        }
                                                                    )
                                                                )}
                                                            </article>
                                                        );
                                                    }
                                                )}
                                            </div>
                                        )}
                                    </section>
                                );
                            }
                        )}
                    </div>
                )}
            </section>
        </main>
    );
}