import {
    useEffect,
    useState,
} from "react";

import {
    Link,
    useParams,
} from "react-router";

import {
    getSharedTicket,
} from "../services/ticketService.js";

import "./SharedTicketPage.css";

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

function getStatusLabel(
    status
) {
    switch (status) {
        case "VALID":
            return "Ingresso válido";

        case "USED":
            return "Ingresso utilizado";

        case "CANCELLED":
            return "Ingresso cancelado";

        default:
            return status;
    }
}

export default function SharedTicketPage() {
    const {
        sharedToken,
    } = useParams();

    const [
        ticket,
        setTicket,
    ] = useState(null);

    const [
        isLoading,
        setIsLoading,
    ] = useState(true);

    const [
        error,
        setError,
    ] = useState("");

    useEffect(() => {
        async function loadTicket() {
            try {
                const response =
                    await getSharedTicket(
                        sharedToken
                    );

                setTicket(
                    response.ticket
                );
            } catch (error) {
                setError(
                    error.message ||
                    "Não foi possível carregar este ingresso."
                );
            } finally {
                setIsLoading(
                    false
                );
            }
        }

        loadTicket();
    }, [sharedToken]);

    if (isLoading) {
        return (
            <main className="shared-ticket-page">
                <div className="shared-ticket-message">
                    Carregando ingresso...
                </div>
            </main>
        );
    }

    if (
        error ||
        !ticket
    ) {
        return (
            <main className="shared-ticket-page">
                <div className="shared-ticket-message shared-ticket-error">
                    <h1>
                        Ingresso indisponível
                    </h1>

                    <p>
                        {error ||
                            "Este ingresso não foi encontrado."}
                    </p>

                    <Link to="/eventos">
                        Ver eventos
                    </Link>
                </div>
            </main>
        );
    }

    return (
        <main className="shared-ticket-page">
            <Link
                to="/eventos"
                className="shared-ticket-back"
            >
                ← Voltar para eventos
            </Link>

            <article className="shared-ticket-card">
                <div className="shared-ticket-image">
                    {ticket.event.imageUrl ? (
                        <img
                            src={
                                ticket.event.imageUrl
                            }
                            alt={`Imagem do evento ${ticket.event.title}`}
                        />
                    ) : (
                        <div className="shared-ticket-placeholder">
                            Boraí
                        </div>
                    )}
                </div>

                <div className="shared-ticket-content">
                    <div className="shared-ticket-heading">
                        <div>
                            <p>
                                Ingresso compartilhado
                            </p>

                            <h1>
                                {
                                    ticket.event.title
                                }
                            </h1>
                        </div>

                        <span
                            className={`shared-ticket-status shared-ticket-status-${ticket.status.toLowerCase()}`}
                        >
                            {getStatusLabel(
                                ticket.status
                            )}
                        </span>
                    </div>

                    {ticket.event.category && (
                        <p className="shared-ticket-category">
                            {
                                ticket.event.category
                            }
                        </p>
                    )}

                    <p className="shared-ticket-date">
                        {formatEventDate(
                            ticket.event.dateTime
                        )}
                    </p>

                    <div className="shared-ticket-location">
                        <strong>
                            {
                                ticket.event.venueName
                            }
                        </strong>

                        <span>
                            {ticket.event.address &&
                                `${ticket.event.address} — `}

                            {
                                ticket.event.city
                            }

                            {ticket.event.state &&
                                `/${ticket.event.state}`}
                        </span>
                    </div>

                    <dl className="shared-ticket-details">
                        <div>
                            <dt>
                                Setor
                            </dt>

                            <dd>
                                {
                                    ticket.sector
                                }
                            </dd>
                        </div>

                        <div>
                            <dt>
                                Modalidade
                            </dt>

                            <dd>
                                {
                                    ticket.modality
                                }
                            </dd>
                        </div>

                        <div>
                            <dt>
                                Categoria
                            </dt>

                            <dd>
                                {
                                    ticket.priceCategory
                                }
                            </dd>
                        </div>

                        {ticket.seat && (
                            <div>
                                <dt>
                                    Assento
                                </dt>

                                <dd>
                                    {
                                        ticket.seat.label
                                    }
                                </dd>
                            </div>
                        )}

                        <div>
                            <dt>
                                Valor
                            </dt>

                            <dd>
                                {formatCurrency(
                                    ticket.unitPriceInCents
                                )}
                            </dd>
                        </div>
                    </dl>

                    <div className="shared-ticket-security">
                        <strong>
                            Visualização pública
                        </strong>

                        <p>
                            Este link permite apenas
                            visualizar as informações
                            do ingresso. O QR Code de
                            entrada permanece disponível
                            somente para o proprietário
                            autenticado.
                        </p>
                    </div>
                </div>
            </article>
        </main>
    );
}