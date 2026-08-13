import {
    useAuth,
} from "../contexts/AuthContext.jsx";

import AccountLogout from "../components/AccountLogout.jsx";

export default function OrganizerPage() {
    const { user } =
        useAuth();

    return (
        <main className="account-page">
            <header className="account-heading">
                <p className="account-eyebrow">
                    Organização
                </p>

                <h1>
                    Painel do Organizador
                </h1>

                <p>
                    Olá, {user.name}.
                    Este será o espaço para
                    gerenciamento dos seus
                    eventos.
                </p>

                <AccountLogout />
            </header>

            <section className="account-grid">
                <article className="account-card">
                    <span className="account-card-number">
                        01
                    </span>

                    <h2>
                        Eventos
                    </h2>

                    <p>
                        Criação e gerenciamento
                        dos eventos da sua
                        organização.
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
                        Vendas
                    </h2>

                    <p>
                        Acompanhamento de
                        ingressos e vendas dos
                        eventos.
                    </p>

                    <span className="account-coming-soon">
                        Em breve
                    </span>
                </article>
            </section>
        </main>
    );
}