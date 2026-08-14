const TICKETMASTER_BASE_URL =
    "https://app.ticketmaster.com/discovery/v2";

// ======================================================
// CREDENCIAL
// ======================================================

function getTicketmasterApiKey() {
    const apiKey =
        process.env
            .TICKETMASTER_API_KEY;

    if (!apiKey) {
        throw new Error(
            "TICKETMASTER_API_KEY não está configurada."
        );
    }

    return apiKey;
}

// ======================================================
// REQUISIÇÃO BASE
// ======================================================

async function ticketmasterRequest(
    path,
    searchParams = {}
) {
    const apiKey =
        getTicketmasterApiKey();

    const url =
        new URL(
            `${TICKETMASTER_BASE_URL}${path}`
        );

    url.searchParams.set(
        "apikey",
        apiKey
    );

    Object.entries(
        searchParams
    ).forEach(
        ([
            key,
            value,
        ]) => {
            if (
                value !== undefined &&
                value !== null &&
                value !== ""
            ) {
                url.searchParams.set(
                    key,
                    String(
                        value
                    )
                );
            }
        }
    );

    const response =
        await fetch(
            url
        );

    if (
        !response.ok
    ) {
        const errorBody =
            await response
                .text()
                .catch(
                    () => ""
                );

        console.error(
            "Erro retornado pela Ticketmaster:",
            response.status,
            errorBody
        );

        throw new Error(
            "Não foi possível consultar a Ticketmaster."
        );
    }

    return response.json();
}

// ======================================================
// IMAGEM
// ======================================================

function getBestImage(
    images = []
) {
    if (
        !images.length
    ) {
        return null;
    }

    const preferredImage =
        images.find(
            (image) =>
                image.ratio ===
                    "16_9" &&
                image.width >=
                    640
        );

    return (
        preferredImage?.url ||
        images[0]?.url ||
        null
    );
}

// ======================================================
// NORMALIZAÇÃO
// ======================================================

function normalizeTicketmasterEvent(
    event
) {
    const venue =
        event._embedded
            ?.venues?.[0];

    const classification =
        event.classifications?.[0];

    const address =
        venue?.address
            ?.line1 ||
        null;

    const latitude =
        venue?.location
            ?.latitude ??
        null;

    const longitude =
        venue?.location
            ?.longitude ??
        null;

    return {
        externalId:
            String(
                event.id
            ),

        source:
            "TICKETMASTER",

        title:
            event.name ||
            "",

        description:
            event.info ||
            event.pleaseNote ||
            "",

        imageUrl:
            getBestImage(
                event.images
            ),

        date:
            event.dates
                ?.start
                ?.localDate ||
            null,

        time:
            event.dates
                ?.start
                ?.localTime ||
            null,

        venueName:
            venue?.name ||
            null,

        address,

        city:
            venue?.city
                ?.name ||
            null,

        state:
            venue?.state
                ?.stateCode ||
            venue?.state
                ?.name ||
            null,

        country:
            venue?.country
                ?.countryCode ||
            venue?.country
                ?.name ||
            null,

        latitude,

        longitude,

        category:
            classification
                ?.segment
                ?.name ||
            null,

        genre:
            classification
                ?.genre
                ?.name ||
            null,

        subGenre:
            classification
                ?.subGenre
                ?.name ||
            null,

        externalUrl:
            event.url ||
            null,
    };
}

// ======================================================
// CATÁLOGO DA TICKETMASTER
// ======================================================
//
// Nenhuma palavra-chave é obrigatória.
//
// Exemplos:
//
// listTicketmasterEvents()
// → todos disponíveis no Brasil
//
// listTicketmasterEvents({
//     stateCode: "CE",
// })
//
// listTicketmasterEvents({
//     classificationName: "Music",
//     stateCode: "SP",
// })
//
// ======================================================

export async function listTicketmasterEvents({
    stateCode = null,
    classificationName = null,
    page = 0,
    size = 20,
    keyword = null,
} = {}) {
    const parsedPage =
        Number(
            page
        );

    const safePage =
        Number.isInteger(
            parsedPage
        ) &&
        parsedPage >= 0
            ? parsedPage
            : 0;

    const parsedSize =
        Number(
            size
        );

    const safeSize =
        Number.isInteger(
            parsedSize
        ) &&
        parsedSize > 0
            ? Math.min(
                  parsedSize,
                  50
              )
            : 20;

    const normalizedState =
        stateCode
            ? String(
                  stateCode
              )
                  .trim()
                  .toUpperCase()
            : null;

    const normalizedClassification =
        classificationName
            ? String(
                  classificationName
              ).trim()
            : null;

    const normalizedKeyword =
        keyword
            ? String(
                  keyword
              ).trim()
            : null;

    const response =
        await ticketmasterRequest(
            "/events.json",
            {
                countryCode:
                    "BR",

                stateCode:
                    normalizedState ||
                    undefined,

                classificationName:
                    normalizedClassification ||
                    undefined,

                keyword:
                    normalizedKeyword ||
                    undefined,

                locale:
                    "pt-br",

                page:
                    safePage,

                size:
                    safeSize,

                sort:
                    "date,asc",
            }
        );

    const events =
        response._embedded
            ?.events ||
        [];

    return {
        page:
            response.page
                ?.number ??
            safePage,

        size:
            response.page
                ?.size ??
            safeSize,

        totalPages:
            response.page
                ?.totalPages ??
            0,

        totalResults:
            response.page
                ?.totalElements ??
            0,

        results:
            events.map(
                normalizeTicketmasterEvent
            ),
    };
}

// ======================================================
// BUSCA TEXTUAL
// ======================================================
//
// Mantida para compatibilidade com o que já fizemos.
//
// ======================================================

export async function searchTicketmasterEvents(
    query,
    options = {}
) {
    const normalizedQuery =
        String(
            query ||
            ""
        ).trim();

    if (
        !normalizedQuery
    ) {
        throw new Error(
            "Informe um evento para buscar na Ticketmaster."
        );
    }

    return listTicketmasterEvents({
        ...options,

        keyword:
            normalizedQuery,
    });
}

// ======================================================
// CLASSIFICAÇÕES
// ======================================================
//
// Usaremos essa informação para montar os tipos
// disponíveis no Front-End.
//
// ======================================================

export async function listTicketmasterClassifications() {
    const response =
        await ticketmasterRequest(
            "/classifications.json",
            {
                locale:
                    "pt-br",

                size:
                    50,
            }
        );

    const classifications =
        response._embedded
            ?.classifications ||
        [];

    return classifications
        .map(
            (
                classification
            ) => {
                const segment =
                    classification.segment;

                if (
                    !segment
                ) {
                    return null;
                }

                return {
                    id:
                        segment.id ||
                        null,

                    name:
                        segment.name ||
                        "",

                    genres:
                        (
                            segment
                                ._embedded
                                ?.genres ||
                            []
                        ).map(
                            (
                                genre
                            ) => ({
                                id:
                                    genre.id,

                                name:
                                    genre.name,
                            })
                        ),
                };
            }
        )
        .filter(
            Boolean
        );
}

// ======================================================
// DETALHES DE UM EVENTO
// ======================================================

export async function getTicketmasterEventById(
    eventId
) {
    if (
        !eventId
    ) {
        throw new Error(
            "Informe o ID do evento."
        );
    }

    const event =
        await ticketmasterRequest(
            `/events/${eventId}.json`,
            {
                locale:
                    "pt-br",
            }
        );

    return normalizeTicketmasterEvent(
        event
    );
}