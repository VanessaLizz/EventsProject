import {
    Link,
} from "react-router";

import {
    useAuth,
} from "../contexts/authContext.js";

import AccountLogout from "../components/AccountLogout.jsx";

export default function ClientPage() {
    const { user } =
        useAuth();

    return (
        <main className="account-page">
            <header className="account-heading">
                <p className="account-eyebrow">
                    Minha conta
                </p>

                <h1>
                    Área do Cliente
                </h1>

                <p>
                    Olá, {user.name}.
                    Aqui você poderá acompanhar
                    seus ingressos e informações
                    da sua conta.
                </p>

                <AccountLogout />
            </header>

            <section className="account-grid">
                <article className="account-card">
                    <span className="account-card-number">
                        01
                    </span>

                    <h2>
                        Meus ingressos
                    </h2>

                    <p>
                        Seus ingressos adquiridos
                        ficarão disponíveis aqui.
                    </p>

                    <span className="account-coming-soon">
                        Em breve
                    </span>
                </article>

                <article className="account-card">
                    <span className="account-card-number">
                        02
                    </span>

                    <h2>
                        Encontrar eventos
                    </h2>

                    <p>
                        Explore os eventos
                        disponíveis no Boraí.
                    </p>

                    <Link to="/eventos">
                        Ver eventos
                    </Link>
                </article>
            </section>
        </main>
    );
}