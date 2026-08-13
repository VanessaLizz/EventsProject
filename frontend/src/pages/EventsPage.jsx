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

function normalizeText(value = "") {
    return value
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLocaleLowerCase("pt-BR")
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

export default function EventsPage() {
    const [searchParams] =
        useSearchParams();

    const [events, setEvents] =
        useState([]);

    const [search, setSearch] =
        useState("");

    const [category, setCategory] =
        useState(
            searchParams.get(
                "categoria"
            ) || ""
        );

    const [city, setCity] =
        useState("");

    const [month, setMonth] =
        useState("");

    const [year, setYear] =
        useState("");

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
            ].sort();
        }, [events]);

    const cities =
        useMemo(() => {
            return [
                ...new Set(
                    events
                        .map(
                            (event) =>
                                event.city
                        )
                        .filter(Boolean)
                ),
            ].sort((a, b) =>
                a.localeCompare(
                    b,
                    "pt-BR"
                )
            );
        }, [events]);

    const years =
        useMemo(() => {
            return [
                ...new Set(
                    events.map(
                        (event) =>
                            new Date(
                                event.dateTime
                            ).getFullYear()
                    )
                ),
            ].sort(
                (a, b) => a - b
            );
        }, [events]);

    const filteredEvents =
        useMemo(() => {
            const normalizedSearch =
                normalizeText(search);

            return events.filter(
                (event) => {
                    const searchableText =
                        normalizeText(
                            [
                                event.title,
                                event.city,
                                event.state,
                                event.venueName,
                            ]
                                .filter(Boolean)
                                .join(" ")
                        );

                    const matchesSearch =
                        !normalizedSearch ||
                        searchableText.includes(
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
                        eventDate.getMonth() ===
                        Number(month);

                    const matchesYear =
                        !year ||
                        eventDate.getFullYear() ===
                        Number(year);

                    return (
                        matchesSearch &&
                        matchesCategory &&
                        matchesCity &&
                        matchesMonth &&
                        matchesYear
                    );
                }
            );
        }, [
            events,
            search,
            category,
            city,
            month,
            year,
        ]);

    function clearFilters() {
        setSearch("");
        setCategory("");
        setCity("");
        setMonth("");
        setYear("");
    }

    const hasFilters =
        Boolean(
            search ||
            category ||
            city ||
            month ||
            year
        );

    if (isLoading) {
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

    if (error) {
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
                        placeholder="Evento, cidade ou local"
                        value={search}
                        onChange={(event) =>
                            setSearch(
                                event.target.value
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
                        value={category}
                        onChange={(event) =>
                            setCategory(
                                event.target.value
                            )
                        }
                    >
                        <option value="">
                            Todas
                        </option>

                        {categories.map(
                            (categoryName) => (
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
                        value={city}
                        onChange={(event) =>
                            setCity(
                                event.target.value
                            )
                        }
                    >
                        <option value="">
                            Todas
                        </option>

                        {cities.map(
                            (cityName) => (
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
                        value={month}
                        onChange={(event) =>
                            setMonth(
                                event.target.value
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
                        value={year}
                        onChange={(event) =>
                            setYear(
                                event.target.value
                            )
                        }
                    >
                        <option value="">
                            Todos
                        </option>

                        {years.map(
                            (yearValue) => (
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
                <p>
                    <strong>
                        {
                            filteredEvents.length
                        }
                    </strong>{" "}
                    {filteredEvents.length === 1
                        ? "evento encontrado"
                        : "eventos encontrados"}
                </p>

                {hasFilters && (
                    <span>
                        Filtros ativos
                    </span>
                )}
            </div>

            {filteredEvents.length === 0 ? (
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
                <section className="event-grid">
                    {filteredEvents.map(
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
                </section>
            )}
        </main>
    );
}