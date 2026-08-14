import {
    searchTmdbMovies,
    getTmdbMovieById,
    listTmdbMovies,
    listTmdbMovieGenres,
} from "../services/tmdbService.js";

import {
    searchTicketmasterEvents,
    getTicketmasterEventById,
    listTicketmasterEvents,
    listTicketmasterClassifications,
} from "../services/ticketmasterService.js";

// ======================================================
// TIPOS SUPORTADOS PELO CATÁLOGO
// ======================================================

const CATALOG_TYPES = [
    {
        id: "ALL",
        name: "Todos",
        source: "TICKETMASTER",
        classificationName: null,
    },
    {
        id: "CINEMA",
        name: "Cinema",
        source: "TMDB",
        classificationName: null,
    },
    {
        id: "MUSIC",
        name: "Música",
        source: "TICKETMASTER",
        classificationName: "Music",
    },
    {
        id: "SPORTS",
        name: "Esportes",
        source: "TICKETMASTER",
        classificationName: "Sports",
    },
    {
        id: "ARTS_THEATRE",
        name: "Artes e Teatro",
        source: "TICKETMASTER",
        classificationName: "Arts & Theatre",
    },
    {
        id: "MISCELLANEOUS",
        name: "Outros",
        source: "TICKETMASTER",
        classificationName: "Miscellaneous",
    },
];

function getCatalogType(
    type
) {
    const normalizedType =
        String(
            type ||
            "ALL"
        )
            .trim()
            .toUpperCase();

    return (
        CATALOG_TYPES.find(
            (item) =>
                item.id ===
                normalizedType
        ) ||
        null
    );
}

function normalizePage(
    page
) {
    const parsedPage =
        Number(
            page
        );

    if (
        !Number.isInteger(
            parsedPage
        ) ||
        parsedPage < 1
    ) {
        return 1;
    }

    return parsedPage;
}

// ======================================================
// CATÁLOGO — TIPOS E FILTROS DISPONÍVEIS
// ======================================================

export async function getExternalCatalogTypes(
    req,
    res
) {
    try {
        const [
            tmdbGenres,
            ticketmasterClassifications,
        ] =
            await Promise.all([
                listTmdbMovieGenres(),
                listTicketmasterClassifications(),
            ]);

        return res
            .status(200)
            .json({
                types:
                    CATALOG_TYPES.map(
                        (type) => ({
                            id:
                                type.id,

                            name:
                                type.name,

                            source:
                                type.source,
                        })
                    ),

                tmdbGenres,

                ticketmasterClassifications,
            });
    } catch (error) {
        console.error(
            "Erro ao carregar tipos do catálogo externo:",
            error
        );

        return res
            .status(502)
            .json({
                message:
                    error.message ||
                    "Não foi possível carregar os filtros do catálogo externo.",
            });
    }
}

// ======================================================
// CATÁLOGO — LISTAGEM PRINCIPAL
// ======================================================
//
// Exemplos:
//
// /external/catalog
//
// /external/catalog?type=MUSIC
//
// /external/catalog?type=MUSIC&state=CE
//
// /external/catalog?type=SPORTS&state=SP&page=2
//
// /external/catalog?type=CINEMA
//
// /external/catalog?type=CINEMA&genreId=28
//
// /external/catalog?type=CINEMA&query=Interestelar
//
// ======================================================

export async function listExternalCatalog(
    req,
    res
) {
    try {
        const {
            type =
                "ALL",

            state =
                "",

            page =
                "1",

            query =
                "",

            genreId =
                "",
        } = req.query;

        const catalogType =
            getCatalogType(
                type
            );

        if (
            !catalogType
        ) {
            return res
                .status(400)
                .json({
                    message:
                        "Tipo de evento inválido.",
                });
        }

        const currentPage =
            normalizePage(
                page
            );

        const normalizedQuery =
            String(
                query ||
                ""
            ).trim();

        // ==================================================
        // CINEMA — TMDB
        // ==================================================

        if (
            catalogType.source ===
            "TMDB"
        ) {
            let result;

            if (
                normalizedQuery
            ) {
                result =
                    await searchTmdbMovies(
                        normalizedQuery,
                        currentPage
                    );
            } else {
                result =
                    await listTmdbMovies({
                        page:
                            currentPage,

                        genreId:
                            genreId ||
                            null,
                    });
            }

            return res
                .status(200)
                .json({
                    type:
                        catalogType.id,

                    typeName:
                        catalogType.name,

                    source:
                        "TMDB",

                    state:
                        null,

                    stateFilterAvailable:
                        false,

                    genreId:
                        genreId ||
                        null,

                    query:
                        normalizedQuery ||
                        null,

                    page:
                        result.page,

                    totalPages:
                        result.totalPages,

                    totalResults:
                        result.totalResults,

                    results:
                        result.results,
                });
        }

        // ==================================================
        // EVENTOS — TICKETMASTER
        // ==================================================

        const normalizedState =
            String(
                state ||
                ""
            )
                .trim()
                .toUpperCase();

        const ticketmasterPage =
            currentPage -
            1;

        let result;

        if (
            normalizedQuery
        ) {
            result =
                await searchTicketmasterEvents(
                    normalizedQuery,
                    {
                        stateCode:
                            normalizedState ||
                            null,

                        classificationName:
                            catalogType
                                .classificationName,

                        page:
                            ticketmasterPage,

                        size:
                            20,
                    }
                );
        } else {
            result =
                await listTicketmasterEvents({
                    stateCode:
                        normalizedState ||
                        null,

                    classificationName:
                        catalogType
                            .classificationName,

                    page:
                        ticketmasterPage,

                    size:
                        20,
                });
        }

        return res
            .status(200)
            .json({
                type:
                    catalogType.id,

                typeName:
                    catalogType.name,

                source:
                    "TICKETMASTER",

                state:
                    normalizedState ||
                    null,

                stateFilterAvailable:
                    true,

                query:
                    normalizedQuery ||
                    null,

                page:
                    result.page +
                    1,

                totalPages:
                    result.totalPages,

                totalResults:
                    result.totalResults,

                results:
                    result.results,
            });
    } catch (error) {
        console.error(
            "Erro ao carregar catálogo externo:",
            error
        );

        return res
            .status(502)
            .json({
                message:
                    error.message ||
                    "Não foi possível carregar o catálogo externo.",
            });
    }
}

// ======================================================
// TMDB — BUSCA DE FILMES
// ======================================================

export async function searchTmdbEvents(
    req,
    res
) {
    try {
        const query =
            String(
                req.query.query ||
                ""
            ).trim();

        const page =
            normalizePage(
                req.query.page
            );

        if (
            !query
        ) {
            return res
                .status(400)
                .json({
                    message:
                        "Informe um título para buscar no TMDb.",
                });
        }

        const result =
            await searchTmdbMovies(
                query,
                page
            );

        return res
            .status(200)
            .json(
                result
            );
    } catch (error) {
        console.error(
            "Erro ao buscar filmes no TMDb:",
            error
        );

        return res
            .status(502)
            .json({
                message:
                    error.message ||
                    "Não foi possível consultar o TMDb.",
            });
    }
}

// ======================================================
// TMDB — DETALHES DE UM FILME
// ======================================================

export async function getTmdbEventById(
    req,
    res
) {
    try {
        const {
            externalId,
        } =
            req.params;

        if (
            !externalId
        ) {
            return res
                .status(400)
                .json({
                    message:
                        "Informe o ID do filme.",
                });
        }

        const event =
            await getTmdbMovieById(
                externalId
            );

        return res
            .status(200)
            .json({
                event,
            });
    } catch (error) {
        console.error(
            "Erro ao buscar filme no TMDb:",
            error
        );

        return res
            .status(502)
            .json({
                message:
                    error.message ||
                    "Não foi possível consultar o TMDb.",
            });
    }
}

// ======================================================
// TICKETMASTER — BUSCA DE EVENTOS
// ======================================================

export async function searchTicketmasterExternalEvents(
    req,
    res
) {
    try {
        const query =
            String(
                req.query.query ||
                ""
            ).trim();

        if (
            !query
        ) {
            return res
                .status(400)
                .json({
                    message:
                        "Informe um termo para buscar na Ticketmaster.",
                });
        }

        const result =
            await searchTicketmasterEvents(
                query
            );

        return res
            .status(200)
            .json(
                result
            );
    } catch (error) {
        console.error(
            "Erro ao buscar eventos na Ticketmaster:",
            error
        );

        return res
            .status(502)
            .json({
                message:
                    error.message ||
                    "Não foi possível consultar a Ticketmaster.",
            });
    }
}

// ======================================================
// TICKETMASTER — DETALHES DE UM EVENTO
// ======================================================

export async function getTicketmasterExternalEventById(
    req,
    res
) {
    try {
        const {
            externalId,
        } =
            req.params;

        if (
            !externalId
        ) {
            return res
                .status(400)
                .json({
                    message:
                        "Informe o ID do evento.",
                });
        }

        const event =
            await getTicketmasterEventById(
                externalId
            );

        return res
            .status(200)
            .json({
                event,
            });
    } catch (error) {
        console.error(
            "Erro ao buscar evento na Ticketmaster:",
            error
        );

        return res
            .status(502)
            .json({
                message:
                    error.message ||
                    "Não foi possível consultar a Ticketmaster.",
            });
    }
}