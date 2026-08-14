import {
    useCallback,
    useEffect,
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
            dateStyle: "medium",
            timeStyle: "short",
        }
    ).format(
        new Date(dateTime)
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
            [token]
        );

    useEffect(() => {
        let active = true;

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
            active = false;
        };
    }, [loadEvents]);

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
                        continue configurando
                        os existentes.
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
                    <section className="organizer-events-grid">
                        {events.map(
                            (
                                event
                            ) => (
                                <article
                                    className="organizer-event-card"
                                    key={
                                        event.id
                                    }
                                >
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
                                        <Link
                                            to={`/eventos/${event.id}`}
                                            className="organizer-edit-button"
                                        >
                                            Ver evento publicado
                                        </Link>
                                    )}
                                </article>
                            )
                        )}
                    </section>
                )}
        </main>
    );
}