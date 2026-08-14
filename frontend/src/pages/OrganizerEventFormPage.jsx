import {
    useEffect,
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
    createOrganizerEvent,
    getEventTemplates,
    getOrganizerEventById,
    updateOrganizerEvent,
} from "../services/eventService.js";

const INITIAL_FORM = {
    title: "",
    description: "",
    imageUrl: "",
    capacity: "",
    venueName: "",
    address: "",
    city: "",
    state: "",
    country: "BR",
    latitude: "",
    longitude: "",
    dateTime: "",
    categoryTemplateId: "",
};

function toDateTimeLocal(
    value
) {
    if (!value) {
        return "";
    }

    const date =
        new Date(value);

    const offset =
        date.getTimezoneOffset();

    const localDate =
        new Date(
            date.getTime() -
            offset * 60 * 1000
        );

    return localDate
        .toISOString()
        .slice(0, 16);
}

export default function OrganizerEventFormPage() {
    const {
        eventId,
    } = useParams();

    const navigate =
        useNavigate();

    const {
        token,
    } = useAuth();

    const isEditing =
        Boolean(eventId);

    const [
        form,
        setForm,
    ] = useState(
        INITIAL_FORM
    );

    const [
        categories,
        setCategories,
    ] = useState([]);

    const [
        isLoading,
        setIsLoading,
    ] = useState(true);

    const [
        isSaving,
        setIsSaving,
    ] = useState(false);

    const [
        error,
        setError,
    ] = useState("");

    useEffect(() => {
        let isMounted = true;

        async function loadPage() {
            try {
                const templates =
                    await getEventTemplates(
                        token
                    );

                if (!isMounted) {
                    return;
                }

                setCategories(
                    templates.categories ||
                    []
                );

                if (!isEditing) {
                    return;
                }

                const response =
                    await getOrganizerEventById(
                        eventId,
                        token
                    );

                if (!isMounted) {
                    return;
                }

                const event =
                    response.event;

                setForm({
                    title:
                        event.title || "",

                    description:
                        event.description || "",

                    imageUrl:
                        event.imageUrl || "",

                    capacity:
                        String(
                            event.capacity ||
                            ""
                        ),

                    venueName:
                        event.venueName || "",

                    address:
                        event.address || "",

                    city:
                        event.city || "",

                    state:
                        event.state || "",

                    country:
                        event.country ||
                        "BR",

                    latitude:
                        event.latitude ??
                        "",

                    longitude:
                        event.longitude ??
                        "",

                    dateTime:
                        toDateTimeLocal(
                            event.dateTime
                        ),

                    categoryTemplateId:
                        event
                            .categoryTemplate
                            ?.id || "",
                });
            } catch (error) {
                if (!isMounted) {
                    return;
                }

                setError(
                    error.message ||
                    "Não foi possível carregar o formulário."
                );
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        }

        loadPage();

        return () => {
            isMounted = false;
        };
    }, [
        eventId,
        isEditing,
        token,
    ]);

    function handleChange(
        event
    ) {
        const {
            name,
            value,
        } = event.target;

        setForm(
            (current) => ({
                ...current,
                [name]: value,
            })
        );
    }

    async function handleSubmit(
        event
    ) {
        event.preventDefault();

        setError("");
        setIsSaving(true);

        try {
            const payload = {
                ...form,

                capacity:
                    Number(
                        form.capacity
                    ),

                latitude:
                    form.latitude === ""
                        ? null
                        : Number(
                            form.latitude
                        ),

                longitude:
                    form.longitude === ""
                        ? null
                        : Number(
                            form.longitude
                        ),
            };

            if (isEditing) {
                await updateOrganizerEvent(
                    eventId,
                    payload,
                    token
                );
            } else {
                await createOrganizerEvent(
                    payload,
                    token
                );
            }

            navigate(
                "/organizador"
            );
        } catch (error) {
            setError(
                error.message ||
                "Não foi possível salvar o evento."
            );
        } finally {
            setIsSaving(false);
        }
    }

    if (isLoading) {
        return (
            <main className="organizer-form-page">
                <section className="organizer-status">
                    Carregando...
                </section>
            </main>
        );
    }

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
                    {isEditing
                        ? "Editar evento"
                        : "Criar evento"}
                </h1>

                <p>
                    Preencha as informações
                    principais do evento.
                    Setores, modalidades,
                    lotes e preços serão
                    configurados em seguida.
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

            <form
                className="organizer-event-form"
                onSubmit={
                    handleSubmit
                }
            >
                <section className="organizer-form-section">
                    <div className="organizer-form-section-heading">
                        <span>
                            01
                        </span>

                        <div>
                            <h2>
                                Informações
                            </h2>

                            <p>
                                Dados principais
                                do evento.
                            </p>
                        </div>
                    </div>

                    <div className="organizer-form-grid">
                        <label className="organizer-field organizer-field-full">
                            <span>
                                Nome do evento *
                            </span>

                            <input
                                name="title"
                                value={
                                    form.title
                                }
                                onChange={
                                    handleChange
                                }
                                required
                            />
                        </label>

                        <label className="organizer-field organizer-field-full">
                            <span>
                                Descrição
                            </span>

                            <textarea
                                name="description"
                                value={
                                    form.description
                                }
                                onChange={
                                    handleChange
                                }
                                rows="5"
                            />
                        </label>

                        <label className="organizer-field">
                            <span>
                                Categoria *
                            </span>

                            <select
                                name="categoryTemplateId"
                                value={
                                    form.categoryTemplateId
                                }
                                onChange={
                                    handleChange
                                }
                                required
                            >
                                <option value="">
                                    Selecione
                                </option>

                                {categories.map(
                                    (
                                        category
                                    ) => (
                                        <option
                                            key={
                                                category.id
                                            }
                                            value={
                                                category.id
                                            }
                                        >
                                            {
                                                category.name
                                            }
                                        </option>
                                    )
                                )}
                            </select>
                        </label>

                        <label className="organizer-field">
                            <span>
                                Capacidade total *
                            </span>

                            <input
                                name="capacity"
                                type="number"
                                min="1"
                                step="1"
                                value={
                                    form.capacity
                                }
                                onChange={
                                    handleChange
                                }
                                required
                            />
                        </label>

                        <label className="organizer-field">
                            <span>
                                Data e hora *
                            </span>

                            <input
                                name="dateTime"
                                type="datetime-local"
                                value={
                                    form.dateTime
                                }
                                onChange={
                                    handleChange
                                }
                                required
                            />
                        </label>

                        <label className="organizer-field">
                            <span>
                                URL da imagem
                            </span>

                            <input
                                name="imageUrl"
                                type="url"
                                value={
                                    form.imageUrl
                                }
                                onChange={
                                    handleChange
                                }
                                placeholder="https://..."
                            />
                        </label>
                    </div>
                </section>

                <section className="organizer-form-section">
                    <div className="organizer-form-section-heading">
                        <span>
                            02
                        </span>

                        <div>
                            <h2>
                                Local
                            </h2>

                            <p>
                                Onde o evento
                                acontecerá.
                            </p>
                        </div>
                    </div>

                    <div className="organizer-form-grid">
                        <label className="organizer-field organizer-field-full">
                            <span>
                                Nome do local *
                            </span>

                            <input
                                name="venueName"
                                value={
                                    form.venueName
                                }
                                onChange={
                                    handleChange
                                }
                                required
                            />
                        </label>

                        <label className="organizer-field organizer-field-full">
                            <span>
                                Endereço
                            </span>

                            <input
                                name="address"
                                value={
                                    form.address
                                }
                                onChange={
                                    handleChange
                                }
                            />
                        </label>

                        <label className="organizer-field">
                            <span>
                                Cidade *
                            </span>

                            <input
                                name="city"
                                value={
                                    form.city
                                }
                                onChange={
                                    handleChange
                                }
                                required
                            />
                        </label>

                        <label className="organizer-field">
                            <span>
                                Estado *
                            </span>

                            <input
                                name="state"
                                value={
                                    form.state
                                }
                                onChange={
                                    handleChange
                                }
                                required
                                maxLength="2"
                                placeholder="CE"
                            />
                        </label>

                        <label className="organizer-field">
                            <span>
                                País *
                            </span>

                            <input
                                name="country"
                                value={
                                    form.country
                                }
                                onChange={
                                    handleChange
                                }
                                required
                            />
                        </label>

                        <label className="organizer-field">
                            <span>
                                Latitude
                            </span>

                            <input
                                name="latitude"
                                type="number"
                                step="any"
                                value={
                                    form.latitude
                                }
                                onChange={
                                    handleChange
                                }
                            />
                        </label>

                        <label className="organizer-field">
                            <span>
                                Longitude
                            </span>

                            <input
                                name="longitude"
                                type="number"
                                step="any"
                                value={
                                    form.longitude
                                }
                                onChange={
                                    handleChange
                                }
                            />
                        </label>
                    </div>
                </section>

                <div className="organizer-form-actions">
                    <Link
                        to="/organizador"
                        className="organizer-form-cancel"
                    >
                        Cancelar
                    </Link>

                    <button
                        type="submit"
                        className="organizer-form-submit"
                        disabled={
                            isSaving
                        }
                    >
                        {isSaving
                            ? "Salvando..."
                            : isEditing
                                ? "Salvar alterações"
                                : "Criar evento"}
                    </button>
                </div>
            </form>
        </main>
    );
}