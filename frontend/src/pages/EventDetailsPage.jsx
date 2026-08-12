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
            <main>
                <p>
                    Carregando evento...
                </p>
            </main>
        );
    }

    if (error) {
        return (
            <main>
                <p role="alert">
                    {error}
                </p>

                <Link to="/eventos">
                    Voltar para eventos
                </Link>
            </main>
        );
    }

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
                        <span>
                            {
                                event
                                    .categoryTemplate
                                    ?.name
                            }
                        </span>
                    )}
                </div>

                <div className="event-details-info">
                    <p className="event-details-category">
                        {
                            event
                                .categoryTemplate
                                ?.name
                        }
                    </p>

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

                    {event.description && (
                        <p className="event-details-description">
                            {
                                event.description
                            }
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

                <div className="ticket-sector-list">
                    {event.sectors.map(
                        (sector) => (
                            <section
                                key={
                                    sector.id
                                }
                                className="ticket-sector"
                            >
                                <h3>
                                    {
                                        sector
                                            .sectorTemplate
                                            .name
                                    }
                                </h3>

                                <div className="ticket-modality-list">
                                    {sector.modalities.map(
                                        (
                                            modality
                                        ) => (
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
                                                            .name
                                                    }
                                                </h4>

                                                {modality.batches.map(
                                                    (
                                                        batch
                                                    ) => (
                                                        <div
                                                            key={
                                                                batch.id
                                                            }
                                                            className="ticket-batch"
                                                        >
                                                            <strong>
                                                                {
                                                                    batch.name
                                                                }
                                                            </strong>

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
                                                                                {formatCurrency(
                                                                                    price.priceInCents
                                                                                )}
                                                                            </strong>
                                                                        </li>
                                                                    )
                                                                )}
                                                            </ul>
                                                        </div>
                                                    )
                                                )}
                                            </article>
                                        )
                                    )}
                                </div>
                            </section>
                        )
                    )}
                </div>
            </section>
        </main>
    );
}