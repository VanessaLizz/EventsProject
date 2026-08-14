const TMDB_BASE_URL =
    "https://api.themoviedb.org/3";

// ======================================================
// CREDENCIAL
// ======================================================

function getTmdbAccessToken() {
    const token =
        process.env
            .TMDB_ACCESS_TOKEN;

    if (!token) {
        throw new Error(
            "TMDB_ACCESS_TOKEN não está configurado."
        );
    }

    return token;
}

// ======================================================
// REQUISIÇÃO BASE
// ======================================================

async function tmdbRequest(
    path,
    searchParams = {}
) {
    const token =
        getTmdbAccessToken();

    const url =
        new URL(
            `${TMDB_BASE_URL}${path}`
        );

    Object.entries(
        searchParams
    ).forEach(
        ([key, value]) => {
            if (
                value !== undefined &&
                value !== null &&
                value !== ""
            ) {
                url.searchParams.set(
                    key,
                    String(value)
                );
            }
        }
    );

    const response =
        await fetch(
            url,
            {
                headers: {
                    Authorization:
                        `Bearer ${token}`,

                    Accept:
                        "application/json",
                },
            }
        );

    if (!response.ok) {
        const errorBody =
            await response
                .text()
                .catch(
                    () => ""
                );

        console.error(
            "Erro retornado pelo TMDb:",
            response.status,
            errorBody
        );

        throw new Error(
            "Não foi possível consultar o TMDb."
        );
    }

    return response.json();
}

// ======================================================
// IMAGENS
// ======================================================

function buildTmdbImageUrl(
    path
) {
    if (!path) {
        return null;
    }

    return (
        "https://image.tmdb.org/t/p/w500" +
        path
    );
}

// ======================================================
// NORMALIZAÇÃO
// ======================================================

function normalizeMovie(
    movie
) {
    return {
        externalId:
            String(
                movie.id
            ),

        source:
            "TMDB",

        title:
            movie.title ||
            movie.original_title ||
            "",

        originalTitle:
            movie.original_title ||
            null,

        description:
            movie.overview ||
            "",

        releaseDate:
            movie.release_date ||
            null,

        imageUrl:
            buildTmdbImageUrl(
                movie.poster_path
            ),

        backdropUrl:
            buildTmdbImageUrl(
                movie.backdrop_path
            ),

        genreIds:
            movie.genre_ids ||
            [],

        originalLanguage:
            movie.original_language ||
            null,

        popularity:
            movie.popularity ??
            null,

        voteAverage:
            movie.vote_average ??
            null,
    };
}

// ======================================================
// CATÁLOGO DE FILMES
// ======================================================

export async function listTmdbMovies({
    page = 1,
    genreId = null,
} = {}) {
    const parsedPage =
        Number(page);

    const safePage =
        Number.isInteger(
            parsedPage
        ) &&
        parsedPage > 0
            ? parsedPage
            : 1;

    const response =
        await tmdbRequest(
            "/discover/movie",
            {
                language:
                    "pt-BR",

                include_adult:
                    false,

                include_video:
                    false,

                sort_by:
                    "popularity.desc",

                page:
                    safePage,

                with_genres:
                    genreId ||
                    undefined,
            }
        );

    return {
        page:
            response.page,

        totalPages:
            response.total_pages,

        totalResults:
            response.total_results,

        results:
            (
                response.results ||
                []
            ).map(
                normalizeMovie
            ),
    };
}

// ======================================================
// GÊNEROS DE FILMES
// ======================================================

export async function listTmdbMovieGenres() {
    const response =
        await tmdbRequest(
            "/genre/movie/list",
            {
                language:
                    "pt-BR",
            }
        );

    return (
        response.genres ||
        []
    ).map(
        (genre) => ({
            id:
                genre.id,

            name:
                genre.name,
        })
    );
}

// ======================================================
// BUSCA TEXTUAL
// ======================================================

export async function searchTmdbMovies(
    query,
    page = 1
) {
    const normalizedQuery =
        String(
            query ||
            ""
        ).trim();

    if (!normalizedQuery) {
        throw new Error(
            "Informe um título para buscar no TMDb."
        );
    }

    const parsedPage =
        Number(page);

    const safePage =
        Number.isInteger(
            parsedPage
        ) &&
        parsedPage > 0
            ? parsedPage
            : 1;

    const response =
        await tmdbRequest(
            "/search/movie",
            {
                query:
                    normalizedQuery,

                language:
                    "pt-BR",

                include_adult:
                    false,

                page:
                    safePage,
            }
        );

    return {
        page:
            response.page,

        totalPages:
            response.total_pages,

        totalResults:
            response.total_results,

        results:
            (
                response.results ||
                []
            ).map(
                normalizeMovie
            ),
    };
}

// ======================================================
// DETALHES DE UM FILME
// ======================================================

export async function getTmdbMovieById(
    movieId
) {
    if (!movieId) {
        throw new Error(
            "Informe o ID do filme."
        );
    }

    const movie =
        await tmdbRequest(
            `/movie/${movieId}`,
            {
                language:
                    "pt-BR",
            }
        );

    return normalizeMovie(
        movie
    );
}