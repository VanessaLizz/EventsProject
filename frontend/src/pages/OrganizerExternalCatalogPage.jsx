import {
    useEffect,
    useMemo,
    useState,
} from "react";

import {
    Link,
    useNavigate,
} from "react-router";

import {
    useAuth,
} from "../contexts/authContext.js";

import {
    getExternalCatalog,
    getExternalCatalogTypes,
} from "../services/eventService.js";

const IMPORT_QUEUE_KEY =
    "borai_external_event_import_queue";

const BRAZIL_STATES = [
    { value: "", label: "Todos os estados" },
    { value: "AC", label: "Acre" },
    { value: "AL", label: "Alagoas" },
    { value: "AP", label: "Amapá" },
    { value: "AM", label: "Amazonas" },
    { value: "BA", label: "Bahia" },
    { value: "CE", label: "Ceará" },
    { value: "DF", label: "Distrito Federal" },
    { value: "ES", label: "Espírito Santo" },
    { value: "GO", label: "Goiás" },
    { value: "MA", label: "Maranhão" },
    { value: "MT", label: "Mato Grosso" },
    { value: "MS", label: "Mato Grosso do Sul" },
    { value: "MG", label: "Minas Gerais" },
    { value: "PA", label: "Pará" },
    { value: "PB", label: "Paraíba" },
    { value: "PR", label: "Paraná" },
    { value: "PE", label: "Pernambuco" },
    { value: "PI", label: "Piauí" },
    { value: "RJ", label: "Rio de Janeiro" },
    { value: "RN", label: "Rio Grande do Norte" },
    { value: "RS", label: "Rio Grande do Sul" },
    { value: "RO", label: "Rondônia" },
    { value: "RR", label: "Roraima" },
    { value: "SC", label: "Santa Catarina" },
    { value: "SP", label: "São Paulo" },
    { value: "SE", label: "Sergipe" },
    { value: "TO", label: "Tocantins" },
];

function buildSelectionKey(item) {
    return `${item.source}:${item.externalId}`;
}

function normalizeSelectedItem(item) {
    return {
        source:
            item.source ||
            null,

        externalId:
            item.externalId
                ? String(item.externalId)
                : null,

        title:
            item.title ||
            "",

        description:
            item.description ||
            "",

        imageUrl:
            item.imageUrl ||
            null,

        backdropUrl:
            item.backdropUrl ||
            null,

        date:
            item.date ||
            null,

        time:
            item.time ||
            null,

        releaseDate:
            item.releaseDate ||
            null,

        venueName:
            item.venueName ||
            "",

        city:
            item.city ||
            "",

        state:
            item.state ||
            "",

        country:
            item.country ||
            "",

        category:
            item.category ||
            "",

        genre:
            item.genre ||
            "",

        subGenre:
            item.subGenre ||
            "",

        originalTitle:
            item.originalTitle ||
            "",

        originalLanguage:
            item.originalLanguage ||
            "",

        externalUrl:
            item.externalUrl ||
            null,
    };
}

export default function OrganizerExternalCatalogPage() {
    const {
        token,
    } = useAuth();

    const navigate =
        useNavigate();

    const [
        types,
        setTypes,
    ] = useState([]);

    const [
        tmdbGenres,
        setTmdbGenres,
    ] = useState([]);

    const [
        selectedType,
        setSelectedType,
    ] = useState(
        "ALL"
    );

    const [
        selectedState,
        setSelectedState,
    ] = useState("");

    const [
        selectedGenre,
        setSelectedGenre,
    ] = useState("");

    const [
        searchText,
        setSearchText,
    ] = useState("");

    const [
        appliedSearch,
        setAppliedSearch,
    ] = useState("");

    const [
        catalog,
        setCatalog,
    ] = useState([]);

    const [
        page,
        setPage,
    ] = useState(1);

    const [
        totalPages,
        setTotalPages,
    ] = useState(1);

    const [
        totalResults,
        setTotalResults,
    ] = useState(0);

    const [
        isLoadingFilters,
        setIsLoadingFilters,
    ] = useState(true);

    const [
        isLoadingCatalog,
        setIsLoadingCatalog,
    ] = useState(true);

    const [
        selectedItems,
        setSelectedItems,
    ] = useState({});

    const [
        error,
        setError,
    ] = useState("");

    const isCinema =
        selectedType ===
        "CINEMA";

    const selectedCount =
        useMemo(
            () =>
                Object.keys(
                    selectedItems
                ).length,
            [
                selectedItems,
            ]
        );

    // ==================================================
    // CARREGA TIPOS E GÊNEROS
    // ==================================================

    useEffect(() => {
        let mounted =
            true;

        async function loadTypes() {
            try {
                const response =
                    await getExternalCatalogTypes(
                        token
                    );

                if (!mounted) {
                    return;
                }

                setTypes(
                    response.types ||
                    []
                );

                setTmdbGenres(
                    response.tmdbGenres ||
                    []
                );
            } catch (error) {
                if (!mounted) {
                    return;
                }

                setError(
                    error.message ||
                    "Não foi possível carregar os filtros."
                );
            } finally {
                if (mounted) {
                    setIsLoadingFilters(
                        false
                    );
                }
            }
        }

        loadTypes();

        return () => {
            mounted =
                false;
        };
    }, [
        token,
    ]);

    // ==================================================
    // CARREGA CATÁLOGO
    // ==================================================

    useEffect(() => {
        let mounted =
            true;

        async function loadCatalog() {
            setIsLoadingCatalog(
                true
            );

            setError(
                ""
            );

            try {
                const response =
                    await getExternalCatalog(
                        {
                            type:
                                selectedType,

                            state:
                                isCinema
                                    ? ""
                                    : selectedState,

                            page,

                            query:
                                appliedSearch,

                            genreId:
                                isCinema
                                    ? selectedGenre
                                    : "",
                        },
                        token
                    );

                if (!mounted) {
                    return;
                }

                setCatalog(
                    response.results ||
                    []
                );

                setTotalPages(
                    Math.max(
                        Number(
                            response.totalPages ||
                            1
                        ),
                        1
                    )
                );

                setTotalResults(
                    Number(
                        response.totalResults ||
                        0
                    )
                );
            } catch (error) {
                if (!mounted) {
                    return;
                }

                setCatalog(
                    []
                );

                setTotalPages(
                    1
                );

                setTotalResults(
                    0
                );

                setError(
                    error.message ||
                    "Não foi possível carregar os eventos."
                );
            } finally {
                if (mounted) {
                    setIsLoadingCatalog(
                        false
                    );
                }
            }
        }

        if (!isLoadingFilters) {
            loadCatalog();
        }

        return () => {
            mounted =
                false;
        };
    }, [
        selectedType,
        selectedState,
        selectedGenre,
        appliedSearch,
        page,
        token,
        isCinema,
        isLoadingFilters,
    ]);

    // ==================================================
    // ALTERAR TIPO
    // ==================================================

    function handleTypeChange(
        type
    ) {
        setSelectedType(
            type
        );

        setSelectedState(
            ""
        );

        setSelectedGenre(
            ""
        );

        setSearchText(
            ""
        );

        setAppliedSearch(
            ""
        );

        setPage(
            1
        );

        setSelectedItems(
            {}
        );
    }

    // ==================================================
    // ALTERAR ESTADO
    // ==================================================

    function handleStateChange(
        event
    ) {
        setSelectedState(
            event.target.value
        );

        setPage(
            1
        );

        setSelectedItems(
            {}
        );
    }

    // ==================================================
    // ALTERAR GÊNERO
    // ==================================================

    function handleGenreChange(
        event
    ) {
        setSelectedGenre(
            event.target.value
        );

        setPage(
            1
        );

        setSelectedItems(
            {}
        );
    }

    // ==================================================
    // BUSCA
    // ==================================================

    function handleSearch(
        event
    ) {
        event.preventDefault();

        setAppliedSearch(
            searchText.trim()
        );

        setPage(
            1
        );

        setSelectedItems(
            {}
        );
    }

    // ==================================================
    // SELEÇÃO
    // ==================================================

    function toggleItem(
        item
    ) {
        const key =
            buildSelectionKey(
                item
            );

        setSelectedItems(
            (current) => {
                const next = {
                    ...current,
                };

                if (next[key]) {
                    delete next[key];
                } else {
                    next[key] =
                        normalizeSelectedItem(
                            item
                        );
                }

                return next;
            }
        );
    }

    // ==================================================
    // SELECIONAR TODOS DA PÁGINA
    // ==================================================

    function selectAllCurrentPage() {
        setSelectedItems(
            (current) => {
                const next = {
                    ...current,
                };

                catalog.forEach(
                    (item) => {
                        const key =
                            buildSelectionKey(
                                item
                            );

                        next[key] =
                            normalizeSelectedItem(
                                item
                            );
                    }
                );

                return next;
            }
        );
    }

    function clearSelection() {
        setSelectedItems(
            {}
        );
    }

    // ==================================================
    // ENVIAR SELECIONADOS PARA O FORMULÁRIO
    // ==================================================

    function handleContinueToCreation() {
        if (
            selectedCount ===
            0
        ) {
            return;
        }

        try {
            const queue =
                Object.values(
                    selectedItems
                );

            sessionStorage.setItem(
                IMPORT_QUEUE_KEY,
                JSON.stringify(
                    queue
                )
            );

            navigate(
                "/organizador/eventos/novo?import=1"
            );
        } catch (error) {
            console.error(
                "Erro ao preparar eventos para edição:",
                error
            );

            setError(
                "Não foi possível preparar os eventos selecionados para edição."
            );
        }
    }

    // ==================================================
    // RENDER
    // ==================================================

    return (
        <main className="organizer-form-page">
            <Link
                to="/organizador"
                className="organizer-form-back"
            >
                ← Voltar para o painel
            </Link>

            <header className="organizer-form-heading">
                <p className="account-eyebrow">
                    Organização
                </p>

                <h1>
                    Adicionar eventos externos
                </h1>

                <p>
                    Escolha os eventos que deseja
                    usar como base. Você poderá
                    revisar e editar cada evento
                    antes de criá-lo.
                </p>
            </header>

            {error && (
                <div
                    className="organizer-form-error"
                    role="alert"
                >
                    {error}
                </div>
            )}

            <section className="organizer-form-section">
                <div className="organizer-form-section-heading">
                    <span>
                        01
                    </span>

                    <div>
                        <h2>
                            Tipo de evento
                        </h2>

                        <p>
                            Selecione o catálogo
                            que deseja visualizar.
                        </p>
                    </div>
                </div>

                <div
                    style={{
                        display:
                            "flex",

                        flexWrap:
                            "wrap",

                        gap:
                            "10px",
                    }}
                >
                    {types.map(
                        (type) => (
                            <button
                                key={
                                    type.id
                                }
                                type="button"
                                className={
                                    selectedType ===
                                    type.id
                                        ? "organizer-form-submit"
                                        : "organizer-form-cancel"
                                }
                                onClick={() =>
                                    handleTypeChange(
                                        type.id
                                    )
                                }
                            >
                                {
                                    type.name
                                }
                            </button>
                        )
                    )}
                </div>
            </section>

            <section className="organizer-form-section">
                <div className="organizer-form-section-heading">
                    <span>
                        02
                    </span>

                    <div>
                        <h2>
                            Filtros
                        </h2>

                        <p>
                            Refine as opções
                            disponíveis.
                        </p>
                    </div>
                </div>

                <div className="organizer-form-grid">
                    {!isCinema && (
                        <label className="organizer-field">
                            <span>
                                Estado
                            </span>

                            <select
                                value={
                                    selectedState
                                }
                                onChange={
                                    handleStateChange
                                }
                            >
                                {BRAZIL_STATES.map(
                                    (
                                        state
                                    ) => (
                                        <option
                                            key={
                                                state.value ||
                                                "ALL"
                                            }
                                            value={
                                                state.value
                                            }
                                        >
                                            {
                                                state.label
                                            }
                                        </option>
                                    )
                                )}
                            </select>
                        </label>
                    )}

                    {isCinema && (
                        <label className="organizer-field">
                            <span>
                                Gênero
                            </span>

                            <select
                                value={
                                    selectedGenre
                                }
                                onChange={
                                    handleGenreChange
                                }
                            >
                                <option value="">
                                    Todos os gêneros
                                </option>

                                {tmdbGenres.map(
                                    (
                                        genre
                                    ) => (
                                        <option
                                            key={
                                                genre.id
                                            }
                                            value={
                                                genre.id
                                            }
                                        >
                                            {
                                                genre.name
                                            }
                                        </option>
                                    )
                                )}
                            </select>
                        </label>
                    )}

                    <form
                        onSubmit={
                            handleSearch
                        }
                        className="organizer-field organizer-field-full"
                    >
                        <span>
                            Buscar
                        </span>

                        <div
                            style={{
                                display:
                                    "flex",

                                gap:
                                    "10px",
                            }}
                        >
                            <input
                                value={
                                    searchText
                                }
                                onChange={(
                                    event
                                ) =>
                                    setSearchText(
                                        event
                                            .target
                                            .value
                                    )
                                }
                                placeholder={
                                    isCinema
                                        ? "Buscar filme..."
                                        : "Buscar evento, artista..."
                                }
                            />

                            <button
                                type="submit"
                                className="organizer-form-submit"
                            >
                                Buscar
                            </button>
                        </div>
                    </form>
                </div>
            </section>

            <section className="organizer-form-section">
                <div className="organizer-form-section-heading">
                    <span>
                        03
                    </span>

                    <div>
                        <h2>
                            Opções disponíveis
                        </h2>

                        <p>
                            {totalResults} resultado(s)
                            encontrado(s).
                        </p>
                    </div>
                </div>

                <div
                    style={{
                        display:
                            "flex",

                        justifyContent:
                            "space-between",

                        alignItems:
                            "center",

                        gap:
                            "12px",

                        flexWrap:
                            "wrap",

                        marginBottom:
                            "20px",
                    }}
                >
                    <div>
                        <strong>
                            {selectedCount} selecionado(s)
                        </strong>
                    </div>

                    <div
                        style={{
                            display:
                                "flex",

                            gap:
                                "10px",

                            flexWrap:
                                "wrap",
                        }}
                    >
                        <button
                            type="button"
                            className="organizer-form-cancel"
                            onClick={
                                selectAllCurrentPage
                            }
                            disabled={
                                catalog.length ===
                                0
                            }
                        >
                            Selecionar página
                        </button>

                        <button
                            type="button"
                            className="organizer-form-cancel"
                            onClick={
                                clearSelection
                            }
                            disabled={
                                selectedCount ===
                                0
                            }
                        >
                            Limpar seleção
                        </button>

                        <button
                            type="button"
                            className="organizer-form-submit"
                            onClick={
                                handleContinueToCreation
                            }
                            disabled={
                                selectedCount ===
                                0
                            }
                        >
                            {selectedCount === 1
                                ? "Editar evento selecionado"
                                : `Editar ${selectedCount} eventos selecionados`}
                        </button>
                    </div>
                </div>

                {isLoadingCatalog ? (
                    <div className="organizer-status">
                        Carregando opções...
                    </div>
                ) : catalog.length ===
                  0 ? (
                    <div className="organizer-status">
                        Nenhuma opção encontrada
                        com os filtros atuais.
                    </div>
                ) : (
                    <div
                        style={{
                            display:
                                "grid",

                            gridTemplateColumns:
                                "repeat(auto-fit, minmax(240px, 1fr))",

                            gap:
                                "18px",
                        }}
                    >
                        {catalog.map(
                            (item) => {
                                const key =
                                    buildSelectionKey(
                                        item
                                    );

                                const selected =
                                    Boolean(
                                        selectedItems[
                                            key
                                        ]
                                    );

                                return (
                                    <article
                                        key={
                                            key
                                        }
                                        className="organizer-event-card"
                                        style={{
                                            position:
                                                "relative",

                                            outline:
                                                selected
                                                    ? "2px solid currentColor"
                                                    : "none",
                                        }}
                                    >
                                        <label
                                            style={{
                                                display:
                                                    "block",

                                                cursor:
                                                    "pointer",
                                            }}
                                        >
                                            <input
                                                type="checkbox"
                                                checked={
                                                    selected
                                                }
                                                onChange={() =>
                                                    toggleItem(
                                                        item
                                                    )
                                                }
                                                style={{
                                                    position:
                                                        "absolute",

                                                    top:
                                                        "12px",

                                                    right:
                                                        "12px",

                                                    width:
                                                        "20px",

                                                    height:
                                                        "20px",

                                                    zIndex:
                                                        2,
                                                }}
                                            />

                                            {item.imageUrl && (
                                                <img
                                                    src={
                                                        item.imageUrl
                                                    }
                                                    alt={
                                                        item.title
                                                    }
                                                    style={{
                                                        width:
                                                            "100%",

                                                        height:
                                                            "240px",

                                                        objectFit:
                                                            "cover",

                                                        borderRadius:
                                                            "10px",

                                                        marginBottom:
                                                            "14px",
                                                    }}
                                                />
                                            )}

                                            <h3>
                                                {
                                                    item.title
                                                }
                                            </h3>

                                            {item.source ===
                                                "TMDB" && (
                                                <>
                                                    {item.releaseDate && (
                                                        <p>
                                                            Lançamento:{" "}
                                                            {
                                                                item.releaseDate
                                                            }
                                                        </p>
                                                    )}

                                                    {item.voteAverage !==
                                                        null &&
                                                        item.voteAverage !==
                                                            undefined && (
                                                            <p>
                                                                Nota:{" "}
                                                                {
                                                                    item.voteAverage
                                                                }
                                                            </p>
                                                        )}
                                                </>
                                            )}

                                            {item.source ===
                                                "TICKETMASTER" && (
                                                <>
                                                    {item.date && (
                                                        <p>
                                                            {
                                                                item.date
                                                            }

                                                            {item.time
                                                                ? ` • ${item.time.slice(
                                                                      0,
                                                                      5
                                                                  )}`
                                                                : ""}
                                                        </p>
                                                    )}

                                                    {item.venueName && (
                                                        <p>
                                                            {
                                                                item.venueName
                                                            }
                                                        </p>
                                                    )}

                                                    {item.city && (
                                                        <p>
                                                            {
                                                                item.city
                                                            }

                                                            {item.state
                                                                ? ` - ${item.state}`
                                                                : ""}
                                                        </p>
                                                    )}

                                                    {item.category && (
                                                        <p>
                                                            {
                                                                item.category
                                                            }
                                                        </p>
                                                    )}
                                                </>
                                            )}
                                        </label>
                                    </article>
                                );
                            }
                        )}
                    </div>
                )}

                <div
                    style={{
                        display:
                            "flex",

                        justifyContent:
                            "center",

                        alignItems:
                            "center",

                        gap:
                            "16px",

                        marginTop:
                            "24px",
                    }}
                >
                    <button
                        type="button"
                        className="organizer-form-cancel"
                        disabled={
                            page <=
                            1
                        }
                        onClick={() =>
                            setPage(
                                (
                                    current
                                ) =>
                                    Math.max(
                                        current -
                                            1,
                                        1
                                    )
                            )
                        }
                    >
                        ← Anterior
                    </button>

                    <strong>
                        Página {page} de{" "}
                        {totalPages}
                    </strong>

                    <button
                        type="button"
                        className="organizer-form-cancel"
                        disabled={
                            page >=
                            totalPages
                        }
                        onClick={() =>
                            setPage(
                                (
                                    current
                                ) =>
                                    Math.min(
                                        current +
                                            1,
                                        totalPages
                                    )
                            )
                        }
                    >
                        Próxima →
                    </button>
                </div>
            </section>
        </main>
    );
}