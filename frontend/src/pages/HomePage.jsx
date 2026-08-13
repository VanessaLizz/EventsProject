import {
    useEffect,
    useMemo,
    useState,
} from "react";

import {
    Link,
} from "react-router";

import EventCard from "../components/EventCard.jsx";

import {
    getEvents,
} from "../services/eventService.js";

export default function HomePage() {
    const [events, setEvents] =
        useState([]);

    const [isLoading, setIsLoading] =
        useState(true);

    const [error, setError] =
        useState("");

    useEffect(() => {
        async function loadEvents() {
            try {
                const response =
                    await getEvents();

                setEvents(
                    response.events
                );
            } catch (error) {
                setError(
                    error.message ||
                    "Não foi possível carregar os eventos."
                );
            } finally {
                setIsLoading(false);
            }
        }

        loadEvents();
    }, []);

    const categories =
        useMemo(() => {
            return [
                ...new Set(
                    events
                        .map(
                            (event) =>
                                event
                                    .categoryTemplate
                                    ?.name
                        )
                        .filter(Boolean)
                ),
            ];
        }, [events]);

    const featuredEvent =
        events[0];

    const upcomingEvents =
        events.slice(0, 4);

    return (
        <>
            <section className="home-hero">
                <div className="home-hero-content">
                    <p className="home-hero-eyebrow">
                        Boraí viver experiências
                    </p>

                    <h1>
                        Seu próximo evento
                        começa aqui.
                    </h1>

                    <p className="home-hero-description">
                        Descubra shows,
                        teatro, cinema,
                        literatura e experiências
                        para todos os momentos.
                    </p>

                    <div className="home-hero-actions">
                        <Link
                            to="/eventos"
                            className="home-hero-button"
                        >
                            Explorar eventos
                        </Link>

                        <a
                            href="#categorias"
                            className="home-hero-secondary"
                        >
                            Ver categorias
                        </a>
                    </div>
                </div>

                <div
                    className="home-hero-decoration"
                    aria-hidden="true"
                >
                    <span>
                        boraí?
                    </span>
                </div>
            </section>

            <main className="home-main">
                {isLoading && (
                    <p className="home-status">
                        Carregando eventos...
                    </p>
                )}

                {error && (
                    <p
                        className="home-status"
                        role="alert"
                    >
                        {error}
                    </p>
                )}

                {!isLoading &&
                    !error &&
                    categories.length > 0 && (
                        <section
                            id="categorias"
                            className="home-categories"
                        >
                            <div className="section-heading">
                                <div>
                                    <p>
                                        Descubra
                                    </p>

                                    <h2>
                                        Explore por categoria
                                    </h2>
                                </div>

                                <Link to="/eventos">
                                    Todos os eventos
                                </Link>
                            </div>

                            <div className="category-grid">
                                {categories.map(
                                    (
                                        categoryName
                                    ) => (
                                        <Link
                                            key={
                                                categoryName
                                            }
                                            to={`/eventos?categoria=${encodeURIComponent(
                                                categoryName
                                            )}`}
                                            className="category-card"
                                        >
                                            <span>
                                                {
                                                    categoryName
                                                }
                                            </span>
                                        </Link>
                                    )
                                )}
                            </div>
                        </section>
                    )}

                {!isLoading &&
                    !error &&
                    featuredEvent && (
                        <section className="home-featured">
                            <div className="section-heading">
                                <div>
                                    <p>
                                        Em destaque
                                    </p>

                                    <h2>
                                        Não perca
                                    </h2>
                                </div>
                            </div>

                            <Link
                                to={`/eventos/${featuredEvent.id}`}
                                className="featured-event"
                            >
                                <div className="featured-event-visual">
                                    {featuredEvent.imageUrl ? (
                                        <img
                                            src={
                                                featuredEvent.imageUrl
                                            }
                                            alt={`Imagem do evento ${featuredEvent.title}`}
                                        />
                                    ) : (
                                        <span className="featured-event-brand">
                                            Boraí
                                        </span>
                                    )}
                                </div>

                                <div className="featured-event-content">
                                    <p>
                                        {
                                            featuredEvent
                                                .categoryTemplate
                                                ?.name
                                        }
                                    </p>

                                    <h3>
                                        {
                                            featuredEvent.title
                                        }
                                    </h3>

                                    <span>
                                        {new Date(
                                            featuredEvent.dateTime
                                        ).toLocaleString(
                                            "pt-BR",
                                            {
                                                dateStyle:
                                                    "long",
                                                timeStyle:
                                                    "short",
                                            }
                                        )}
                                    </span>

                                    <span>
                                        {
                                            featuredEvent.venueName
                                        }

                                        {featuredEvent.venueName &&
                                            " — "}

                                        {
                                            featuredEvent.city
                                        }

                                        {featuredEvent.state &&
                                            `/${featuredEvent.state}`}
                                    </span>

                                    <strong>
                                        Ver evento
                                    </strong>
                                </div>
                            </Link>
                        </section>
                    )}

                {!isLoading &&
                    !error &&
                    upcomingEvents.length >
                    0 && (
                        <section className="home-events">
                            <div className="section-heading">
                                <div>
                                    <p>
                                        Próximos eventos
                                    </p>

                                    <h2>
                                        O que vem por aí
                                    </h2>
                                </div>

                                <Link to="/eventos">
                                    Ver todos
                                </Link>
                            </div>

                            <div className="event-grid">
                                {upcomingEvents.map(
                                    (event) => (
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
                            </div>
                        </section>
                    )}

                {!isLoading &&
                    !error &&
                    events.length === 0 && (
                        <section className="home-empty">
                            <h2>
                                Novos eventos em breve
                            </h2>

                            <p>
                                Ainda não há eventos
                                publicados.
                            </p>
                        </section>
                    )}
            </main>
        </>
    );
}