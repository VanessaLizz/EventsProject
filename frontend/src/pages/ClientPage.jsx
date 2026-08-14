import {
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
    getMyTickets,
    getTicketQr,
} from "../services/ticketService.js";

import "./ClientTickets.css";

function formatEventDate(
    dateTime
) {
    return new Date(
        dateTime
    ).toLocaleString(
        "pt-BR",
        {
            dateStyle: "medium",
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
            return "Válido";

        case "USED":
            return "Utilizado";

        case "CANCELLED":
            return "Cancelado";

        default:
            return status;
    }
}

export default function ClientPage() {
    const {
        user,
        token,
    } = useAuth();

    const [
        tickets,
        setTickets,
    ] = useState([]);

    const [
        isLoading,
        setIsLoading,
    ] = useState(true);

    const [
        error,
        setError,
    ] = useState("");

    const [
        selectedTicket,
        setSelectedTicket,
    ] = useState(null);

    const [
        isLoadingQr,
        setIsLoadingQr,
    ] = useState(false);

    const [
        qrError,
        setQrError,
    ] = useState("");

    const [
        copiedTicketId,
        setCopiedTicketId,
    ] = useState(null);

    useEffect(() => {
        async function loadTickets() {
            try {
                const response =
                    await getMyTickets(
                        token
                    );

                setTickets(
                    response.tickets ||
                    []
                );
            } catch (error) {
                setError(
                    error.message ||
                    "Não foi possível carregar seus ingressos."
                );
            } finally {
                setIsLoading(
                    false
                );
            }
        }

        if (token) {
            loadTickets();
        }
    }, [token]);

    async function handleOpenTicket(
        ticketId
    ) {
        setQrError("");
        setIsLoadingQr(
            true
        );

        try {
            const response =
                await getTicketQr(
                    ticketId,
                    token
                );

            setSelectedTicket(
                response.ticket
            );
        } catch (error) {
            setQrError(
                error.message ||
                "Não foi possível carregar o ingresso."
            );
        } finally {
            setIsLoadingQr(
                false
            );
        }
    }

    function handleCloseTicket() {
        setSelectedTicket(
            null
        );

        setQrError("");
    }

    async function handleShare(
        ticket
    ) {
        const shareUrl =
            `${window.location.origin}/ingresso/${ticket.sharedToken}`;

        try {
            await navigator.clipboard.writeText(
                shareUrl
            );

            setCopiedTicketId(
                ticket.id
            );

            window.setTimeout(
                () => {
                    setCopiedTicketId(
                        null
                    );
                },
                2000
            );
        } catch {
            window.open(
                shareUrl,
                "_blank",
                "noopener,noreferrer"
            );
        }
    }

    return (
        <main className="account-page client-page">
            <header className="account-heading">
                <p className="account-eyebrow">
                    Minha conta
                </p>

                <h1>
                    Área do Cliente
                </h1>

                <p>
                    Olá, {user.name}.
                    Aqui você pode acompanhar
                    seus ingressos e acessar
                    seus QR Codes.
                </p>

                <AccountLogout />
            </header>

            <section className="client-ticket-section">
                <div className="client-ticket-section-heading">
                    <div>
                        <p>
                            Meus ingressos
                        </p>

                        <h2>
                            Ingressos adquiridos
                        </h2>
                    </div>

                    {!isLoading && (
                        <span>
                            {tickets.length}
                            {" "}
                            ingresso(s)
                        </span>
                    )}
                </div>

                {error && (
                    <div
                        className="client-ticket-error"
                        role="alert"
                    >
                        {error}
                    </div>
                )}

                {qrError && (
                    <div
                        className="client-ticket-error"
                        role="alert"
                    >
                        {qrError}
                    </div>
                )}

                {isLoading ? (
                    <div className="client-ticket-empty">
                        <p>
                            Carregando ingressos...
                        </p>
                    </div>
                ) : tickets.length === 0 ? (
                    <div className="client-ticket-empty">
                        <h3>
                            Você ainda não possui ingressos
                        </h3>

                        <p>
                            Quando concluir uma compra,
                            seus ingressos aparecerão aqui.
                        </p>

                        <Link
                            to="/eventos"
                            className="client-ticket-primary-link"
                        >
                            Encontrar eventos
                        </Link>
                    </div>
                ) : (
                    <div className="client-ticket-grid">
                        {tickets.map(
                            (ticket) => (
                                <article
                                    key={
                                        ticket.id
                                    }
                                    className="client-ticket-card"
                                >
                                    <div className="client-ticket-image">
                                        {ticket.event.imageUrl ? (
                                            <img
                                                src={
                                                    ticket.event.imageUrl
                                                }
                                                alt={`Imagem do evento ${ticket.event.title}`}
                                            />
                                        ) : (
                                            <div className="client-ticket-image-placeholder">
                                                Boraí
                                            </div>
                                        )}

                                        <span
                                            className={`client-ticket-status client-ticket-status-${ticket.status.toLowerCase()}`}
                                        >
                                            {getStatusLabel(
                                                ticket.status
                                            )}
                                        </span>
                                    </div>

                                    <div className="client-ticket-content">
                                        {ticket.event.category && (
                                            <p className="client-ticket-category">
                                                {
                                                    ticket.event.category
                                                }
                                            </p>
                                        )}

                                        <h3>
                                            {
                                                ticket.event.title
                                            }
                                        </h3>

                                        <p className="client-ticket-date">
                                            {formatEventDate(
                                                ticket.event.dateTime
                                            )}
                                        </p>

                                        <div className="client-ticket-location">
                                            <strong>
                                                {
                                                    ticket.event.venueName
                                                }
                                            </strong>

                                            <span>
                                                {
                                                    ticket.event.city
                                                }

                                                {ticket.event.state &&
                                                    `/${ticket.event.state}`}
                                            </span>
                                        </div>

                                        <dl className="client-ticket-details">
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

                                        <div className="client-ticket-actions">
                                            <button
                                                type="button"
                                                className="client-ticket-primary-button"
                                                disabled={
                                                    isLoadingQr ||
                                                    ticket.status ===
                                                        "CANCELLED"
                                                }
                                                onClick={() =>
                                                    handleOpenTicket(
                                                        ticket.id
                                                    )
                                                }
                                            >
                                                {isLoadingQr
                                                    ? "Carregando..."
                                                    : "Ver ingresso / QR Code"}
                                            </button>

                                            <button
                                                type="button"
                                                className="client-ticket-secondary-button"
                                                onClick={() =>
                                                    handleShare(
                                                        ticket
                                                    )
                                                }
                                            >
                                                {copiedTicketId ===
                                                ticket.id
                                                    ? "Link copiado"
                                                    : "Compartilhar"}
                                            </button>
                                        </div>
                                    </div>
                                </article>
                            )
                        )}
                    </div>
                )}

                <div className="client-find-events">
                    <div>
                        <h2>
                            Encontrar eventos
                        </h2>

                        <p>
                            Explore outros eventos disponíveis
                            no Boraí.
                        </p>
                    </div>

                    <Link
                        to="/eventos"
                        className="client-ticket-primary-link"
                    >
                        Ver eventos
                    </Link>
                </div>
            </section>

            {selectedTicket && (
                <div
                    className="client-ticket-modal-backdrop"
                    onClick={
                        handleCloseTicket
                    }
                >
                    <article
                        className="client-ticket-modal"
                        onClick={(
                            event
                        ) =>
                            event.stopPropagation()
                        }
                    >
                        <button
                            type="button"
                            className="client-ticket-modal-close"
                            onClick={
                                handleCloseTicket
                            }
                            aria-label="Fechar ingresso"
                        >
                            ×
                        </button>

                        <div className="client-ticket-modal-heading">
                            <p>
                                Seu ingresso
                            </p>

                            <h2>
                                {
                                    selectedTicket.event.title
                                }
                            </h2>

                            <span
                                className={`client-ticket-status client-ticket-status-${selectedTicket.status.toLowerCase()}`}
                            >
                                {getStatusLabel(
                                    selectedTicket.status
                                )}
                            </span>
                        </div>

                        <div className="client-ticket-modal-info">
                            <div>
                                <span>
                                    Data
                                </span>

                                <strong>
                                    {formatEventDate(
                                        selectedTicket.event.dateTime
                                    )}
                                </strong>
                            </div>

                            <div>
                                <span>
                                    Local
                                </span>

                                <strong>
                                    {
                                        selectedTicket.event.venueName
                                    }
                                </strong>
                            </div>

                            <div>
                                <span>
                                    Setor
                                </span>

                                <strong>
                                    {
                                        selectedTicket.sector
                                    }
                                </strong>
                            </div>

                            <div>
                                <span>
                                    Modalidade
                                </span>

                                <strong>
                                    {
                                        selectedTicket.modality
                                    }
                                </strong>
                            </div>

                            <div>
                                <span>
                                    Categoria
                                </span>

                                <strong>
                                    {
                                        selectedTicket.priceCategory
                                    }
                                </strong>
                            </div>

                            {selectedTicket.seat && (
                                <div>
                                    <span>
                                        Assento
                                    </span>

                                    <strong>
                                        {
                                            selectedTicket.seat.label
                                        }
                                    </strong>
                                </div>
                            )}
                        </div>

                        <div className="client-ticket-qr">
                            <img
                                src={
                                    selectedTicket.qrCode
                                }
                                alt="QR Code do ingresso"
                            />

                            <p>
                                Apresente este QR Code
                                na entrada do evento.
                            </p>
                        </div>

                        <div className="client-ticket-modal-code">
                            <span>
                                Ingresso
                            </span>

                            <code>
                                {
                                    selectedTicket.id
                                }
                            </code>
                        </div>
                    </article>
                </div>
            )}
        </main>
    );
}