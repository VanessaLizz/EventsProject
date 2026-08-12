const API_URL = import.meta.env.VITE_API_URL;

if (!API_URL) {
    throw new Error(
        "VITE_API_URL não está configurada."
    );
}

export async function apiRequest(
    path,
    options = {}
) {
    const {
        method = "GET",
        body,
        token,
        headers = {},
    } = options;

    const response = await fetch(
        `${API_URL}${path}`,
        {
            method,

            headers: {
                "Content-Type":
                    "application/json",

                ...(token
                    ? {
                        Authorization:
                            `Bearer ${token}`,
                    }
                    : {}),

                ...headers,
            },

            ...(body !== undefined
                ? {
                    body:
                        typeof body ===
                            "string"
                            ? body
                            : JSON.stringify(
                                body
                            ),
                }
                : {}),
        }
    );

    let data = null;

    const contentType =
        response.headers.get(
            "content-type"
        );

    if (
        contentType?.includes(
            "application/json"
        )
    ) {
        data = await response.json();
    }

    if (!response.ok) {
        const error = new Error(
            data?.message ||
            "Erro ao comunicar com o servidor."
        );

        error.status =
            response.status;

        error.data = data;

        throw error;
    }

    return data;
}