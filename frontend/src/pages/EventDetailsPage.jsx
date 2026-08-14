import {
    useEffect,
    useMemo,
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
    getEventById,
} from "../services/eventService.js";

import {
    completeCheckout,
    startCheckout,
} from "../services/checkoutService.js";

import "./EventDetailsCheckout.css";

const MAX_TICKETS = 10;
const SERVICE_FEE_RATE = 0.12;

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

function getCurrentBatch(
    modality
) {
    return (
        modality.batches?.[0] ||
        null
    );
}

export default function EventDetailsPage() {
    const {
        eventId,
    } = useParams();

    const navigate =
        useNavigate();

    const {
        user,
        token,
        isAuthenticated,
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

    const [
        selectionError,
        setSelectionError,
    ] = useState("");

    const [
        quantitySelections,
        setQuantitySelections,
    ] = useState({});

    /*
        Estrutura:

        {
            modalityId: {
                seatId: {
                    label: "A1",
                    priceId: "..."
                }
            }
        }
    */
    const [
        seatSelections,
        setSeatSelections,
    ] = useState({});

    const [
        checkout,
        setCheckout,
    ] = useState(null);

    const [
        checkoutResult,
        setCheckoutResult,
    ] = useState(null);

    const [
        checkoutMessage,
        setCheckoutMessage,
    ] = useState("");

    const [
        isStartingCheckout,
        setIsStartingCheckout,
    ] = useState(false);

    const [
        isCompletingCheckout,
        setIsCompletingCheckout,
    ] = useState(false);

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

    const priceMap =
        useMemo(
            () => {
                const map =
                    new Map();

                if (!event) {
                    return map;
                }

                for (
                    const sector
                    of event.sectors || []
                ) {
                    for (
                        const modality
                        of sector.modalities || []
                    ) {
                        const batch =
                            getCurrentBatch(
                                modality
                            );

                        if (!batch) {
                            continue;
                        }

                        for (
                            const price
                            of batch.prices || []
                        ) {
                            map.set(
                                price.id,
                                price
                            );
                        }
                    }
                }

                return map;
            },
            [event]
        );

    const quantityTicketCount =
        useMemo(
            () =>
                Object.values(
                    quantitySelections
                ).reduce(
                    (
                        total,
                        quantity
                    ) =>
                        total +
                        quantity,
                    0
                ),
            [
                quantitySelections,
            ]
        );

    const seatTicketCount =
        useMemo(
            () =>
                Object.values(
                    seatSelections
                ).reduce(
                    (
                        total,
                        seats
                    ) =>
                        total +
                        Object.keys(
                            seats
                        ).length,
                    0
                ),
            [
                seatSelections,
            ]
        );

    const totalTickets =
        quantityTicketCount +
        seatTicketCount;

    const subtotalInCents =
        useMemo(
            () => {
                let subtotal = 0;

                for (
                    const [
                        priceId,
                        quantity,
                    ]
                    of Object.entries(
                        quantitySelections
                    )
                ) {
                    const price =
                        priceMap.get(
                            priceId
                        );

                    if (!price) {
                        continue;
                    }

                    subtotal +=
                        price.priceInCents *
                        quantity;
                }

                for (
                    const modalitySeats
                    of Object.values(
                        seatSelections
                    )
                ) {
                    for (
                        const seat
                        of Object.values(
                            modalitySeats
                        )
                    ) {
                        if (
                            !seat.priceId
                        ) {
                            continue;
                        }

                        const price =
                            priceMap.get(
                                seat.priceId
                            );

                        if (!price) {
                            continue;
                        }

                        subtotal +=
                            price.priceInCents;
                    }
                }

                return subtotal;
            },
            [
                priceMap,
                quantitySelections,
                seatSelections,
            ]
        );

    const serviceFeeInCents =
        Math.round(
            subtotalInCents *
            SERVICE_FEE_RATE
        );

    const totalInCents =
        subtotalInCents +
        serviceFeeInCents;

    function getSelectedQuantityForBatch(
        batch
    ) {
        if (!batch) {
            return 0;
        }

        return (
            batch.prices || []
        ).reduce(
            (
                total,
                price
            ) =>
                total +
                (
                    quantitySelections[
                        price.id
                    ] || 0
                ),
            0
        );
    }

    function handleQuantityChange(
        modality,
        price,
        delta
    ) {
        setSelectionError("");

        if (checkout) {
            return;
        }

        const batch =
            getCurrentBatch(
                modality
            );

        if (!batch) {
            return;
        }

        const current =
            quantitySelections[
                price.id
            ] || 0;

        if (
            delta > 0 &&
            totalTickets >=
                MAX_TICKETS
        ) {
            setSelectionError(
                "É permitido selecionar no máximo 10 ingressos por compra."
            );

            return;
        }

        const selectedInBatch =
            getSelectedQuantityForBatch(
                batch
            );

        if (
            delta > 0 &&
            selectedInBatch >=
                batch.remainingQuantity
        ) {
            setSelectionError(
                "Você atingiu a quantidade disponível para esta modalidade."
            );

            return;
        }

        const next =
            Math.max(
                0,
                current + delta
            );

        setQuantitySelections(
            (currentSelections) => {
                const nextSelections = {
                    ...currentSelections,
                };

                if (
                    next === 0
                ) {
                    delete nextSelections[
                        price.id
                    ];

                    return nextSelections;
                }

                nextSelections[
                    price.id
                ] = next;

                return nextSelections;
            }
        );
    }

    function handleSeatClick(
        modality,
        seat
    ) {
        if (checkout) {
            return;
        }

        setSelectionError("");

        const currentSeats =
            seatSelections[
                modality.id
            ] || {};

        const alreadySelected =
            Boolean(
                currentSeats[
                    seat.id
                ]
            );

        if (alreadySelected) {
            setSeatSelections(
                (current) => {
                    const modalitySeats = {
                        ...(
                            current[
                                modality.id
                            ] || {}
                        ),
                    };

                    delete modalitySeats[
                        seat.id
                    ];

                    const next = {
                        ...current,
                    };

                    if (
                        Object.keys(
                            modalitySeats
                        ).length ===
                        0
                    ) {
                        delete next[
                            modality.id
                        ];
                    } else {
                        next[
                            modality.id
                        ] =
                            modalitySeats;
                    }

                    return next;
                }
            );

            return;
        }

        if (
            totalTickets >=
            MAX_TICKETS
        ) {
            setSelectionError(
                "É permitido selecionar no máximo 10 ingressos por compra."
            );

            return;
        }

        const batch =
            getCurrentBatch(
                modality
            );

        const selectedSeats =
            Object.keys(
                currentSeats
            ).length;

        if (
            batch &&
            selectedSeats >=
                batch.remainingQuantity
        ) {
            setSelectionError(
                "Não há mais ingressos disponíveis nesta modalidade."
            );

            return;
        }

        setSeatSelections(
            (current) => ({
                ...current,

                [modality.id]: {
                    ...(
                        current[
                            modality.id
                        ] || {}
                    ),

                    [seat.id]: {
                        label:
                            seat.label,

                        priceId:
                            "",
                    },
                },
            })
        );
    }

    function handleSeatPriceChange(
        modalityId,
        seatId,
        priceId
    ) {
        if (checkout) {
            return;
        }

        setSelectionError("");

        setSeatSelections(
            (current) => ({
                ...current,

                [modalityId]: {
                    ...(
                        current[
                            modalityId
                        ] || {}
                    ),

                    [seatId]: {
                        ...(
                            current[
                                modalityId
                            ]?.[
                                seatId
                            ] || {}
                        ),

                        priceId,
                    },
                },
            })
        );
    }

    function hasSeatWithoutCategory() {
        for (
            const modalitySeats
            of Object.values(
                seatSelections
            )
        ) {
            for (
                const seat
                of Object.values(
                    modalitySeats
                )
            ) {
                if (
                    !seat.priceId
                ) {
                    return true;
                }
            }
        }

        return false;
    }

    function buildCheckoutItems() {
        const items = [];

        for (
            const [
                priceId,
                quantity,
            ]
            of Object.entries(
                quantitySelections
            )
        ) {
            if (
                quantity <= 0
            ) {
                continue;
            }

            items.push({
                ticketBatchPriceId:
                    priceId,

                quantity,
            });
        }

        const seatsByPrice =
            new Map();

        for (
            const modalitySeats
            of Object.values(
                seatSelections
            )
        ) {
            for (
                const [
                    seatId,
                    seat
                ]
                of Object.entries(
                    modalitySeats
                )
            ) {
                if (
                    !seat.priceId
                ) {
                    continue;
                }

                if (
                    !seatsByPrice.has(
                        seat.priceId
                    )
                ) {
                    seatsByPrice.set(
                        seat.priceId,
                        []
                    );
                }

                seatsByPrice
                    .get(
                        seat.priceId
                    )
                    .push(
                        seatId
                    );
            }
        }

        for (
            const [
                priceId,
                seatIds,
            ]
            of seatsByPrice.entries()
        ) {
            items.push({
                ticketBatchPriceId:
                    priceId,

                seatIds,
            });
        }

        return items;
    }

    async function handleStartCheckout() {
        setSelectionError("");
        setCheckoutMessage("");

        if (
            totalTickets === 0
        ) {
            setSelectionError(
                "Selecione pelo menos um ingresso para continuar."
            );

            return;
        }

        if (
            hasSeatWithoutCategory()
        ) {
            setSelectionError(
                "Escolha o tipo de ingresso de cada assento selecionado."
            );

            return;
        }

        if (
            !isAuthenticated
        ) {
            navigate(
                "/login",
                {
                    state: {
                        from:
                            `/eventos/${eventId}`,
                    },
                }
            );

            return;
        }

        if (
            user?.role !==
            "CLIENT"
        ) {
            setSelectionError(
                "Para comprar ingressos, entre com uma conta de Cliente."
            );

            return;
        }

        setIsStartingCheckout(
            true
        );

        try {
            const response =
                await startCheckout(
                    buildCheckoutItems(),
                    token
                );

            setCheckout(
                response.checkout
            );

            setCheckoutMessage(
                response.checkout
                    .expiresAt
                    ? "Assentos reservados por 10 minutos. Conclua o pagamento dentro desse prazo."
                    : "Checkout iniciado. Revise os valores e simule o pagamento."
            );
        } catch (error) {
            setSelectionError(
                error.message ||
                "Não foi possível iniciar o checkout."
            );
        } finally {
            setIsStartingCheckout(
                false
            );
        }
    }

    async function refreshEvent() {
        const response =
            await getEventById(
                eventId
            );

        setEvent(
            response.event
        );
    }

    async function handlePayment(
        paymentStatus
    ) {
        if (!checkout) {
            return;
        }

        setSelectionError("");
        setCheckoutMessage("");

        setIsCompletingCheckout(
            true
        );

        try {
            const response =
                await completeCheckout(
                    checkout.id,
                    paymentStatus,
                    token
                );

            setCheckoutResult(
                response.order
            );

            setCheckout(
                null
            );

            setQuantitySelections(
                {}
            );

            setSeatSelections(
                {}
            );

            setCheckoutMessage(
                response.message ||
                "Compra concluída com sucesso."
            );

            await refreshEvent();
        } catch (error) {
            if (
                paymentStatus ===
                "REFUSED"
            ) {
                setCheckout(
                    null
                );

                setCheckoutMessage(
                    error.message ||
                    "Pagamento recusado. Nenhuma compra foi realizada."
                );

                await refreshEvent();

                return;
            }

            setSelectionError(
                error.message ||
                "Não foi possível concluir o checkout."
            );
        } finally {
            setIsCompletingCheckout(
                false
            );
        }
    }

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

    if (
        error ||
        !event
    ) {
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
        event.sectors.length >
            0;

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
                            Escolha seus ingressos
                        </h2>
                    </div>

                    <div className="checkout-ticket-counter">
                        <strong>
                            {totalTickets}
                        </strong>

                        <span>
                            / {MAX_TICKETS}
                        </span>

                        <small>
                            ingressos
                        </small>
                    </div>
                </div>

                {selectionError && (
                    <div
                        className="checkout-selection-error"
                        role="alert"
                    >
                        {selectionError}
                    </div>
                )}

                {checkoutMessage && (
                    <div className="checkout-selection-message">
                        {checkoutMessage}
                    </div>
                )}

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
                    <div className="checkout-layout">
                        <div className="ticket-sector-list">
                            {event.sectors.map(
                                (
                                    sector
                                ) => {
                                    const modalities =
                                        sector.modalities ||
                                        [];

                                    return (
                                        <section
                                            key={
                                                sector.id
                                            }
                                            className="ticket-sector checkout-sector"
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
                                                    Nenhuma modalidade disponível neste setor.
                                                </p>
                                            ) : (
                                                <div className="ticket-modality-list">
                                                    {modalities.map(
                                                        (
                                                            modality
                                                        ) => {
                                                            const batch =
                                                                getCurrentBatch(
                                                                    modality
                                                                );

                                                            const prices =
                                                                batch?.prices ||
                                                                [];

                                                            const seats =
                                                                modality.seats ||
                                                                [];

                                                            const selectedSeats =
                                                                seatSelections[
                                                                    modality.id
                                                                ] ||
                                                                {};

                                                            return (
                                                                <article
                                                                    key={
                                                                        modality.id
                                                                    }
                                                                    className="ticket-modality checkout-modality"
                                                                >
                                                                    <div className="checkout-modality-heading">
                                                                        <div>
                                                                            <h4>
                                                                                {
                                                                                    modality
                                                                                        .modalityTemplate
                                                                                        ?.name
                                                                                }
                                                                            </h4>

                                                                            <span>
                                                                                {modality.occupancyMode ===
                                                                                "SEAT"
                                                                                    ? "Assento marcado"
                                                                                    : "Entrada por quantidade"}
                                                                            </span>
                                                                        </div>

                                                                        {batch && (
                                                                            <small>
                                                                                {
                                                                                    batch.remainingQuantity
                                                                                }{" "}
                                                                                disponível(is)
                                                                            </small>
                                                                        )}
                                                                    </div>

                                                                    {!batch ||
                                                                    prices.length ===
                                                                        0 ? (
                                                                        <p className="ticket-unavailable">
                                                                            Ingressos esgotados ou indisponíveis.
                                                                        </p>
                                                                    ) : modality.occupancyMode ===
                                                                      "QUANTITY" ? (
                                                                        <div className="checkout-price-list">
                                                                            {prices.map(
                                                                                (
                                                                                    price
                                                                                ) => {
                                                                                    const quantity =
                                                                                        quantitySelections[
                                                                                            price.id
                                                                                        ] ||
                                                                                        0;

                                                                                    return (
                                                                                        <div
                                                                                            key={
                                                                                                price.id
                                                                                            }
                                                                                            className="checkout-price-row"
                                                                                        >
                                                                                            <div className="checkout-price-info">
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
                                                                                            </div>

                                                                                            <div className="checkout-quantity-control">
                                                                                                <button
                                                                                                    type="button"
                                                                                                    onClick={() =>
                                                                                                        handleQuantityChange(
                                                                                                            modality,
                                                                                                            price,
                                                                                                            -1
                                                                                                        )
                                                                                                    }
                                                                                                    disabled={
                                                                                                        quantity ===
                                                                                                            0 ||
                                                                                                        Boolean(
                                                                                                            checkout
                                                                                                        )
                                                                                                    }
                                                                                                >
                                                                                                    −
                                                                                                </button>

                                                                                                <strong>
                                                                                                    {
                                                                                                        quantity
                                                                                                    }
                                                                                                </strong>

                                                                                                <button
                                                                                                    type="button"
                                                                                                    onClick={() =>
                                                                                                        handleQuantityChange(
                                                                                                            modality,
                                                                                                            price,
                                                                                                            1
                                                                                                        )
                                                                                                    }
                                                                                                    disabled={
                                                                                                        Boolean(
                                                                                                            checkout
                                                                                                        ) ||
                                                                                                        totalTickets >=
                                                                                                            MAX_TICKETS
                                                                                                    }
                                                                                                >
                                                                                                    +
                                                                                                </button>
                                                                                            </div>
                                                                                        </div>
                                                                                    );
                                                                                }
                                                                            )}
                                                                        </div>
                                                                    ) : (
                                                                        <div className="checkout-seat-section">
                                                                            <div className="checkout-seat-picker">
                                                                                <div className="checkout-seat-picker-heading">
                                                                                    <div>
                                                                                        <p>
                                                                                            1. Escolha os assentos
                                                                                        </p>

                                                                                        <small>
                                                                                            Clique novamente para remover.
                                                                                        </small>
                                                                                    </div>

                                                                                    <span>
                                                                                        {
                                                                                            Object.keys(
                                                                                                selectedSeats
                                                                                            ).length
                                                                                        }{" "}
                                                                                        selecionado(s)
                                                                                    </span>
                                                                                </div>

                                                                                {seats.length ===
                                                                                0 ? (
                                                                                    <p className="ticket-unavailable">
                                                                                        Nenhum assento disponível.
                                                                                    </p>
                                                                                ) : (
                                                                                    <>
                                                                                        <div className="checkout-screen">
                                                                                            PALCO / TELA
                                                                                        </div>

                                                                                        <div className="checkout-seat-grid">
                                                                                            {seats.map(
                                                                                                (
                                                                                                    seat
                                                                                                ) => {
                                                                                                    const selected =
                                                                                                        Boolean(
                                                                                                            selectedSeats[
                                                                                                                seat.id
                                                                                                            ]
                                                                                                        );

                                                                                                    return (
                                                                                                        <button
                                                                                                            type="button"
                                                                                                            key={
                                                                                                                seat.id
                                                                                                            }
                                                                                                            className={
                                                                                                                selected
                                                                                                                    ? "checkout-seat selected"
                                                                                                                    : "checkout-seat"
                                                                                                            }
                                                                                                            onClick={() =>
                                                                                                                handleSeatClick(
                                                                                                                    modality,
                                                                                                                    seat
                                                                                                                )
                                                                                                            }
                                                                                                            disabled={
                                                                                                                Boolean(
                                                                                                                    checkout
                                                                                                                )
                                                                                                            }
                                                                                                        >
                                                                                                            {
                                                                                                                seat.label
                                                                                                            }
                                                                                                        </button>
                                                                                                    );
                                                                                                }
                                                                                            )}
                                                                                        </div>
                                                                                    </>
                                                                                )}
                                                                            </div>

                                                                            {Object.keys(
                                                                                selectedSeats
                                                                            ).length >
                                                                                0 && (
                                                                                <div className="checkout-seat-assignments">
                                                                                    <div className="checkout-seat-assignments-heading">
                                                                                        <p>
                                                                                            2. Escolha o tipo de cada ingresso
                                                                                        </p>

                                                                                        <span>
                                                                                            Inteira, Meia, Meia Social etc.
                                                                                        </span>
                                                                                    </div>

                                                                                    <div className="checkout-seat-assignment-list">
                                                                                        {Object.entries(
                                                                                            selectedSeats
                                                                                        ).map(
                                                                                            ([
                                                                                                seatId,
                                                                                                seatSelection,
                                                                                            ]) => (
                                                                                                <div
                                                                                                    key={
                                                                                                        seatId
                                                                                                    }
                                                                                                    className="checkout-seat-assignment"
                                                                                                >
                                                                                                    <div className="checkout-seat-assignment-seat">
                                                                                                        <span>
                                                                                                            Assento
                                                                                                        </span>

                                                                                                        <strong>
                                                                                                            {
                                                                                                                seatSelection.label
                                                                                                            }
                                                                                                        </strong>
                                                                                                    </div>

                                                                                                    <label>
                                                                                                        Tipo de ingresso

                                                                                                        <select
                                                                                                            value={
                                                                                                                seatSelection.priceId
                                                                                                            }
                                                                                                            onChange={(
                                                                                                                event
                                                                                                            ) =>
                                                                                                                handleSeatPriceChange(
                                                                                                                    modality.id,
                                                                                                                    seatId,
                                                                                                                    event
                                                                                                                        .target
                                                                                                                        .value
                                                                                                                )
                                                                                                            }
                                                                                                            disabled={
                                                                                                                Boolean(
                                                                                                                    checkout
                                                                                                                )
                                                                                                            }
                                                                                                        >
                                                                                                            <option value="">
                                                                                                                Selecione
                                                                                                            </option>

                                                                                                            {prices.map(
                                                                                                                (
                                                                                                                    price
                                                                                                                ) => (
                                                                                                                    <option
                                                                                                                        key={
                                                                                                                            price.id
                                                                                                                        }
                                                                                                                        value={
                                                                                                                            price.id
                                                                                                                        }
                                                                                                                    >
                                                                                                                        {
                                                                                                                            price
                                                                                                                                .eventTicketCategory
                                                                                                                                ?.priceCategoryTemplate
                                                                                                                                ?.name
                                                                                                                        }{" "}
                                                                                                                        —{" "}
                                                                                                                        {formatCurrency(
                                                                                                                            price.priceInCents
                                                                                                                        )}
                                                                                                                    </option>
                                                                                                                )
                                                                                                            )}
                                                                                                        </select>
                                                                                                    </label>

                                                                                                    <div className="checkout-seat-assignment-price">
                                                                                                        <span>
                                                                                                            Valor
                                                                                                        </span>

                                                                                                        <strong>
                                                                                                            {seatSelection.priceId
                                                                                                                ? formatCurrency(
                                                                                                                      priceMap.get(
                                                                                                                          seatSelection.priceId
                                                                                                                      )
                                                                                                                          ?.priceInCents ||
                                                                                                                          0
                                                                                                                  )
                                                                                                                : "—"}
                                                                                                        </strong>
                                                                                                    </div>
                                                                                                </div>
                                                                                            )
                                                                                        )}
                                                                                    </div>
                                                                                </div>
                                                                            )}
                                                                        </div>
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

                        <aside className="checkout-summary">
                            <div className="checkout-summary-heading">
                                <p>
                                    Resumo da compra
                                </p>

                                <h3>
                                    {totalTickets} ingresso(s)
                                </h3>
                            </div>

                            <div className="checkout-summary-values">
                                <div>
                                    <span>
                                        Subtotal
                                    </span>

                                    <strong>
                                        {formatCurrency(
                                            subtotalInCents
                                        )}
                                    </strong>
                                </div>

                                <div>
                                    <span>
                                        Taxa de serviço

                                        <small>
                                            12%
                                        </small>
                                    </span>

                                    <strong>
                                        {formatCurrency(
                                            serviceFeeInCents
                                        )}
                                    </strong>
                                </div>

                                <div className="checkout-summary-total">
                                    <span>
                                        Total
                                    </span>

                                    <strong>
                                        {formatCurrency(
                                            totalInCents
                                        )}
                                    </strong>
                                </div>
                            </div>

                            {!checkout &&
                                !checkoutResult && (
                                <button
                                    type="button"
                                    className="checkout-continue-button"
                                    disabled={
                                        totalTickets ===
                                            0 ||
                                        isStartingCheckout
                                    }
                                    onClick={
                                        handleStartCheckout
                                    }
                                >
                                    {isStartingCheckout
                                        ? "Iniciando checkout..."
                                        : isAuthenticated
                                        ? "Continuar para checkout"
                                        : "Entrar para continuar"}
                                </button>
                            )}

                            {checkout && (
                                <div className="checkout-payment">
                                    <div className="checkout-payment-status">
                                        <strong>
                                            Checkout iniciado
                                        </strong>

                                        {checkout.expiresAt && (
                                            <span>
                                                Reserva temporária de assentos ativa.
                                            </span>
                                        )}
                                    </div>

                                    <p>
                                        Pagamento simulado
                                    </p>

                                    <button
                                        type="button"
                                        className="checkout-payment-approved"
                                        disabled={
                                            isCompletingCheckout
                                        }
                                        onClick={() =>
                                            handlePayment(
                                                "APPROVED"
                                            )
                                        }
                                    >
                                        {isCompletingCheckout
                                            ? "Processando..."
                                            : "Aprovar pagamento"}
                                    </button>

                                    <button
                                        type="button"
                                        className="checkout-payment-refused"
                                        disabled={
                                            isCompletingCheckout
                                        }
                                        onClick={() =>
                                            handlePayment(
                                                "REFUSED"
                                            )
                                        }
                                    >
                                        Simular recusa
                                    </button>
                                </div>
                            )}

                            {checkoutResult && (
                                <div className="checkout-success">
                                    <strong>
                                        Compra concluída
                                    </strong>

                                    <p>
                                        Pedido criado com sucesso.
                                    </p>

                                    <dl>
                                        <div>
                                            <dt>
                                                Pedido
                                            </dt>

                                            <dd>
                                                {
                                                    checkoutResult.id
                                                }
                                            </dd>
                                        </div>

                                        <div>
                                            <dt>
                                                Ingressos
                                            </dt>

                                            <dd>
                                                {
                                                    checkoutResult.ticketCount
                                                }
                                            </dd>
                                        </div>

                                        <div>
                                            <dt>
                                                Total
                                            </dt>

                                            <dd>
                                                {formatCurrency(
                                                    checkoutResult.totalInCents
                                                )}
                                            </dd>
                                        </div>
                                    </dl>

                                    <Link
                                        to="/cliente"
                                        className="checkout-client-link"
                                    >
                                        Ir para minha área
                                    </Link>
                                </div>
                            )}

                            <p className="checkout-summary-note">
                                Limite de até 10 ingressos por compra.
                            </p>
                        </aside>
                    </div>
                )}
            </section>
        </main>
    );
}