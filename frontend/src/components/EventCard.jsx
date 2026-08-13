import {
    Link,
} from "react-router";

function formatEventDate(dateTime) {
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

export default function EventCard({
    event,
}) {
    const categoryName =
        event.categoryTemplate
            ?.name ||
        "EVENTO";

    return (
        <article className="event-card">
            <div className="event-card-image">
                {event.imageUrl ? (
                    <img
                        src={event.imageUrl}
                        alt={`Imagem do evento ${event.title}`}
                    />
                ) : (
                    <div
                        className="event-card-placeholder"
                        aria-hidden="true"
                    >
                        <span className="event-card-placeholder-brand">
                            Boraí
                        </span>
                    </div>
                )}
            </div>

            <div className="event-card-content">
                <p className="event-card-category">
                    {categoryName}
                </p>

                <h2>
                    {event.title}
                </h2>

                <p className="event-card-date">
                    {formatEventDate(
                        event.dateTime
                    )}
                </p>

                <p className="event-card-location">
                    {event.venueName &&
                        `${event.venueName} — `}

                    {event.city}

                    {event.state &&
                        `/${event.state}`}
                </p>

                <Link
                    to={`/eventos/${event.id}`}
                >
                    Ver evento
                </Link>
            </div>
        </article>
    );
}