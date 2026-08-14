import {
    useEffect,
    useMemo,
    useState,
} from "react";

import {
    useSearchParams,
} from "react-router";

import EventCard from "../components/EventCard.jsx";

import {
    getEvents,
} from "../services/eventService.js";

function normalizeText(
    value = ""
) {
    return value
        .normalize("NFD")
        .replace(
            /[\u0300-\u036f]/g,
            ""
        )
        .toLocaleLowerCase(
            "pt-BR"
        )
        .trim();
}

const MONTHS = [
    "Janeiro",
    "Fevereiro",
    "Março",
    "Abril",
    "Maio",
    "Junho",
    "Julho",
    "Agosto",
    "Setembro",
    "Outubro",
    "Novembro",
    "Dezembro",
];

const EVENTS_PER_PAGE =
    6;

export default function EventsPage() {
    const [
        searchParams,
    ] =
        useSearchParams();

    const initialCategory =
        searchParams.get(
            "categoria"
        ) || "";

    const [
        events,
        setEvents,
    ] =
        useState([]);

    const [
        search,
        setSearch,
    ] =
        useState("");

    const [
        category,
        setCategory,
    ] =
        useState(
            initialCategory
        );

    const [
        city,
        setCity,
    ] =
        useState("");

    const [
        month,
        setMonth,
    ] =
        useState("");

    const [
        year,
        setYear,
    ] =
        useState("");

    const [
        sortOrder,
        setSortOrder,
    ] =
        useState(
            "date-asc"
        );

    const [
        currentPage,
        setCurrentPage,
    ] =
        useState(1);

    const [
        isLoading,
        setIsLoading,
    ] =
        useState(true);

    const [
        error,
        setError,
    ] =
        useState("");

    useEffect(() => {
        async function loadEvents() {
            try {
                const response =
                    await getEvents();

                setEvents(
                    response.events ||
                    []
                );
            } catch (error) {
                setError(
                    error.message ||
                    "Não foi possível carregar os eventos."
                );
            } finally {
                setIsLoading(
                    false
                );
            }
        }

        loadEvents();
    }, []);

    useEffect(() => {
        setCategory(
            searchParams.get(
                "categoria"
            ) || ""
        );
    }, [
        searchParams,
    ]);

    const categories =
        useMemo(() => {
            return [
                ...new Set(
                    events
                        .map(
                            (
                                event
                            ) =>
                                event
                                    .categoryTemplate
                                    ?.name
                        )
                        .filter(
                            Boolean
                        )
                ),
            ].sort(
                (
                    a,
                    b
                ) =>
                    a.localeCompare(
                        b,
                        "pt-BR"
                    )
            );
        }, [
            events,
        ]);

    const cities =
        useMemo(() => {
            return [
                ...new Set(
                    events
                        .map(
                            (
                                event
                            ) =>
                                event.city
                        )
                        .filter(
                            Boolean
                        )
                ),
            ].sort(
                (
                    a,
                    b
                ) =>
                    a.localeCompare(
                        b,
                        "pt-BR"
                    )
            );
        }, [
            events,
        ]);

    const years =
        useMemo(() => {
            return [
                ...new Set(
                    events.map(
                        (
                            event
                        ) =>
                            new Date(
                                event.dateTime
                            ).getFullYear()
                    )
                ),
            ].sort(
                (
                    a,
                    b
                ) =>
                    a - b
            );
        }, [
            events,
        ]);

    const filteredEvents =
        useMemo(() => {
            const normalizedSearch =
                normalizeText(
                    search
                );

            const filtered =
                events.filter(
                    (
                        event
                    ) => {
                        const searchableText =
                            normalizeText(
                                [
                                    event.title,
                                    event.city,
                                    event.state,
                                    event.venueName,
                                    event
                                        .categoryTemplate
                                        ?.name,
                                ]
                                    .filter(
                                        Boolean
                                    )
                                    .join(
                                        " "
                                    )
                            );

                        const matchesSearch =
                            !normalizedSearch ||
                            searchableText
                                .includes(
                                    normalizedSearch
                                );

                        const matchesCategory =
                            !category ||
                            event
                                .categoryTemplate
                                ?.name ===
                                category;

                        const matchesCity =
                            !city ||
                            normalizeText(
                                event.city
                            ) ===
                                normalizeText(
                                    city
                                );

                        const eventDate =
                            new Date(
                                event.dateTime
                            );

                        const matchesMonth =
                            !month ||
                            eventDate
                                .getMonth() ===
                                Number(
                                    month
                                );

                        const matchesYear =
                            !year ||
                            eventDate
                                .getFullYear() ===
                                Number(
                                    year
                                );

                        return (
                            matchesSearch &&
                            matchesCategory &&
                            matchesCity &&
                            matchesMonth &&
                            matchesYear
                        );
                    }
                );

            return [
                ...filtered,
            ].sort(
                (
                    a,
                    b
                ) => {
                    switch (
                        sortOrder
                    ) {
                        case "date-desc":
                            return (
                                new Date(
                                    b.dateTime
                                ) -
                                new Date(
                                    a.dateTime
                                )
                            );

                        case "title-asc":
                            return a.title
                                .localeCompare(
                                    b.title,
                                    "pt-BR"
                                );

                        case "title-desc":
                            return b.title
                                .localeCompare(
                                    a.title,
                                    "pt-BR"
                                );

                        case "date-asc":
                        default:
                            return (
                                new Date(
                                    a.dateTime
                                ) -
                                new Date(
                                    b.dateTime
                                )
                            );
                    }
                }
            );
        }, [
            events,
            search,
            category,
            city,
            month,
            year,
            sortOrder,
        ]);

    const totalPages =
        Math.max(
            Math.ceil(
                filteredEvents.length /
                    EVENTS_PER_PAGE
            ),
            1
        );

    const paginatedEvents =
        useMemo(() => {
            const start =
                (
                    currentPage -
                    1
                ) *
                EVENTS_PER_PAGE;

            const end =
                start +
                EVENTS_PER_PAGE;

            return filteredEvents.slice(
                start,
                end
            );
        }, [
            filteredEvents,
            currentPage,
        ]);

    useEffect(() => {
        setCurrentPage(
            1
        );
    }, [
        search,
        category,
        city,
        month,
        year,
        sortOrder,
    ]);

    useEffect(() => {
        if (
            currentPage >
            totalPages
        ) {
            setCurrentPage(
                totalPages
            );
        }
    }, [
        currentPage,
        totalPages,
    ]);

    function clearFilters() {
        setSearch(
            ""
        );

        setCategory(
            ""
        );

        setCity(
            ""
        );

        setMonth(
            ""
        );

        setYear(
            ""
        );

        setSortOrder(
            "date-asc"
        );

        setCurrentPage(
            1
        );
    }

    function goToPage(
        page
    ) {
        if (
            page < 1 ||
            page > totalPages
        ) {
            return;
        }

        setCurrentPage(
            page
        );

        window.scrollTo({
            top:
                0,

            behavior:
                "smooth",
        });
    }

    const hasFilters =
        Boolean(
            search ||
            category ||
            city ||
            month ||
            year
        );

    const firstVisibleEvent =
        filteredEvents.length ===
        0
            ? 0
            : (
                  currentPage -
                  1
              ) *
                  EVENTS_PER_PAGE +
              1;

    const lastVisibleEvent =
        Math.min(
            currentPage *
                EVENTS_PER_PAGE,
            filteredEvents.length
        );

    if (
        isLoading
    ) {
        return (
            <main className="events-page">
                <div className="catalog-status">
                    <p>
                        Carregando eventos...
                    </p>
                </div>
            </main>
        );
    }

    if (
        error
    ) {
        return (
            <main className="events-page">
                <div className="events-heading">
                    <p className="events-eyebrow">
                        Descubra
                    </p>

                    <h1>
                        Eventos
                    </h1>
                </div>

                <div
                    className="catalog-status catalog-error"
                    role="alert"
                >
                    <p>
                        {error}
                    </p>
                </div>
            </main>
        );
    }

    return (
        <main className="events-page">
            <div className="events-heading">
                <p className="events-eyebrow">
                    Encontre sua próxima experiência
                </p>

                <h1>
                    Eventos
                </h1>

                <p className="events-intro">
                    Explore os eventos disponíveis
                    e encontre o que combina com
                    você.
                </p>
            </div>

            <section
                className="event-filters"
                aria-label="Filtros de eventos"
            >
                <div className="event-filter-search">
                    <label htmlFor="event-search">
                        Buscar eventos
                    </label>

                    <input
                        id="event-search"
                        type="search"
                        placeholder="Evento, categoria, cidade ou local"
                        value={
                            search
                        }
                        onChange={(
                            event
                        ) =>
                            setSearch(
                                event
                                    .target
                                    .value
                            )
                        }
                    />
                </div>

                <div>
                    <label htmlFor="event-category">
                        Categoria
                    </label>

                    <select
                        id="event-category"
                        value={
                            category
                        }
                        onChange={(
                            event
                        ) =>
                            setCategory(
                                event
                                    .target
                                    .value
                            )
                        }
                    >
                        <option value="">
                            Todas
                        </option>

                        {categories.map(
                            (
                                categoryName
                            ) => (
                                <option
                                    key={
                                        categoryName
                                    }
                                    value={
                                        categoryName
                                    }
                                >
                                    {
                                        categoryName
                                    }
                                </option>
                            )
                        )}
                    </select>
                </div>

                <div>
                    <label htmlFor="event-city">
                        Cidade
                    </label>

                    <select
                        id="event-city"
                        value={
                            city
                        }
                        onChange={(
                            event
                        ) =>
                            setCity(
                                event
                                    .target
                                    .value
                            )
                        }
                    >
                        <option value="">
                            Todas
                        </option>

                        {cities.map(
                            (
                                cityName
                            ) => (
                                <option
                                    key={
                                        cityName
                                    }
                                    value={
                                        cityName
                                    }
                                >
                                    {
                                        cityName
                                    }
                                </option>
                            )
                        )}
                    </select>
                </div>

                <div>
                    <label htmlFor="event-month">
                        Mês
                    </label>

                    <select
                        id="event-month"
                        value={
                            month
                        }
                        onChange={(
                            event
                        ) =>
                            setMonth(
                                event
                                    .target
                                    .value
                            )
                        }
                    >
                        <option value="">
                            Todos
                        </option>

                        {MONTHS.map(
                            (
                                monthName,
                                index
                            ) => (
                                <option
                                    key={
                                        monthName
                                    }
                                    value={
                                        index
                                    }
                                >
                                    {
                                        monthName
                                    }
                                </option>
                            )
                        )}
                    </select>
                </div>

                <div>
                    <label htmlFor="event-year">
                        Ano
                    </label>

                    <select
                        id="event-year"
                        value={
                            year
                        }
                        onChange={(
                            event
                        ) =>
                            setYear(
                                event
                                    .target
                                    .value
                            )
                        }
                    >
                        <option value="">
                            Todos
                        </option>

                        {years.map(
                            (
                                yearValue
                            ) => (
                                <option
                                    key={
                                        yearValue
                                    }
                                    value={
                                        yearValue
                                    }
                                >
                                    {
                                        yearValue
                                    }
                                </option>
                            )
                        )}
                    </select>
                </div>

                <div>
                    <label htmlFor="event-sort">
                        Ordenar por
                    </label>

                    <select
                        id="event-sort"
                        value={
                            sortOrder
                        }
                        onChange={(
                            event
                        ) =>
                            setSortOrder(
                                event
                                    .target
                                    .value
                            )
                        }
                    >
                        <option value="date-asc">
                            Data mais próxima
                        </option>

                        <option value="date-desc">
                            Data mais distante
                        </option>

                        <option value="title-asc">
                            Nome A–Z
                        </option>

                        <option value="title-desc">
                            Nome Z–A
                        </option>
                    </select>
                </div>

                {hasFilters && (
                    <button
                        type="button"
                        className="clear-filters"
                        onClick={
                            clearFilters
                        }
                    >
                        Limpar filtros
                    </button>
                )}
            </section>

            <div className="catalog-summary">
                <div>
                    <p>
                        <strong>
                            {
                                filteredEvents
                                    .length
                            }
                        </strong>{" "}
                        {filteredEvents
                            .length ===
                        1
                            ? "evento encontrado"
                            : "eventos encontrados"}
                    </p>

                    {filteredEvents
                        .length >
                        0 && (
                        <small>
                            Exibindo{" "}
                            {
                                firstVisibleEvent
                            }
                            {" - "}
                            {
                                lastVisibleEvent
                            }
                            {" de "}
                            {
                                filteredEvents
                                    .length
                            }
                        </small>
                    )}
                </div>

                {hasFilters && (
                    <span>
                        Filtros ativos
                    </span>
                )}
            </div>

            {filteredEvents
                .length ===
            0 ? (
                <section className="catalog-empty">
                    <h2>
                        Nenhum evento encontrado
                    </h2>

                    <p>
                        Tente alterar ou remover
                        alguns dos filtros.
                    </p>

                    {hasFilters && (
                        <button
                            type="button"
                            onClick={
                                clearFilters
                            }
                        >
                            Limpar todos os filtros
                        </button>
                    )}
                </section>
            ) : (
                <>
                    <section className="event-grid">
                        {paginatedEvents.map(
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

                    {totalPages >
                        1 && (
                        <nav
                            className="catalog-pagination"
                            aria-label="Paginação dos eventos"
                        >
                            <button
                                type="button"
                                className="catalog-pagination-button"
                                onClick={() =>
                                    goToPage(
                                        currentPage -
                                            1
                                    )
                                }
                                disabled={
                                    currentPage ===
                                    1
                                }
                            >
                                ← Anterior
                            </button>

                            <div className="catalog-pagination-pages">
                                {Array
                                    .from(
                                        {
                                            length:
                                                totalPages,
                                        },
                                        (
                                            _,
                                            index
                                        ) =>
                                            index +
                                            1
                                    )
                                    .map(
                                        (
                                            page
                                        ) => (
                                            <button
                                                type="button"
                                                key={
                                                    page
                                                }
                                                className={
                                                    page ===
                                                    currentPage
                                                        ? "catalog-pagination-number catalog-pagination-number-active"
                                                        : "catalog-pagination-number"
                                                }
                                                onClick={() =>
                                                    goToPage(
                                                        page
                                                    )
                                                }
                                                aria-current={
                                                    page ===
                                                    currentPage
                                                        ? "page"
                                                        : undefined
                                                }
                                            >
                                                {
                                                    page
                                                }
                                            </button>
                                        )
                                    )}
                            </div>

                            <button
                                type="button"
                                className="catalog-pagination-button"
                                onClick={() =>
                                    goToPage(
                                        currentPage +
                                            1
                                    )
                                }
                                disabled={
                                    currentPage ===
                                    totalPages
                                }
                            >
                                Próxima →
                            </button>
                        </nav>
                    )}
                </>
            )}
        </main>
    );
}