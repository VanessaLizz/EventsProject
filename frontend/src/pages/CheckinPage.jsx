import {
    useAuth,
} from "../contexts/authContext.js";

import AccountLogout from "../components/AccountLogout.jsx";

export default function CheckinPage() {
    const { user } =
        useAuth();

    return (
        <main className="account-page">
            <header className="account-heading">
                <p className="account-eyebrow">
                    Controle de acesso
                </p>

                <h1>
                    Área da Portaria
                </h1>

                <p>
                    Olá, {user.name}.
                    Este será o espaço utilizado
                    para validação dos ingressos
                    na entrada dos eventos.
                </p>

                <AccountLogout />
            </header>

            <section className="account-grid">
                <article className="account-card">
                    <span className="account-card-number">
                        01
                    </span>

                    <h2>
                        Check-in
                    </h2>

                    <p>
                        A validação dos ingressos
                        será realizada por esta
                        área.
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
                        Histórico
                    </h2>

                    <p>
                        Os ingressos validados
                        poderão ser acompanhados
                        aqui.
                    </p>

                    <span className="account-coming-soon">
                        Em breve
                    </span>
                </article>
            </section>
        </main>
    );
}