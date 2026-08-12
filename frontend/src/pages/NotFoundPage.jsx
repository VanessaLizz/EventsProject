import {
    Link,
} from "react-router";

export default function NotFoundPage() {
    return (
        <main>
            <h1>
                Página não encontrada
            </h1>

            <Link to="/">
                Voltar para o início
            </Link>
        </main>
    );
}