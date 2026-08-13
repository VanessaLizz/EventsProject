import {
    Link,
} from "react-router";

export default function NotFoundPage() {
    return (
        <main className="not-found-page">
            <p className="not-found-code">
                404
            </p>

            <h1>
                Página não encontrada
            </h1>

            <p className="not-found-description">
                O endereço acessado não existe
                ou não está mais disponível.
            </p>

            <div className="not-found-actions">
                <Link
                    to="/"
                    className="not-found-primary"
                >
                    Voltar para o início
                </Link>

                <Link
                    to="/eventos"
                    className="not-found-secondary"
                >
                    Explorar eventos
                </Link>
            </div>
        </main>
    );
}