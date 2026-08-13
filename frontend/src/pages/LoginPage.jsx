import {
    useState,
} from "react";

import {
    Navigate,
    useLocation,
    useNavigate,
} from "react-router";

import {
    useAuth,
} from "../contexts/AuthContext.jsx";

const ROLE_HOME = {
    CLIENT: "/cliente",
    ORGANIZER: "/organizador",
    CHECKIN: "/portaria",
};

export default function LoginPage() {
    const navigate =
        useNavigate();

    const location =
        useLocation();

    const {
        user,
        isAuthenticated,
        login,
        isLoggingIn,
    } = useAuth();

    const [email, setEmail] =
        useState("");

    const [password, setPassword] =
        useState("");

    const [error, setError] =
        useState("");

    if (isAuthenticated) {
        const destination =
            ROLE_HOME[user.role] ||
            "/";

        return (
            <Navigate
                to={destination}
                replace
            />
        );
    }

    async function handleSubmit(event) {
        event.preventDefault();

        setError("");

        try {
            const authData =
                await login(
                    email,
                    password
                );

            const requestedRoute =
                location.state?.from;

            const roleHome =
                ROLE_HOME[
                authData.user.role
                ] || "/";

            navigate(
                requestedRoute ||
                roleHome,
                {
                    replace: true,
                }
            );
        } catch (error) {
            setError(
                error.message ||
                "Não foi possível entrar."
            );
        }
    }

    return (
        <main className="login-page">
            <section className="login-container">
                <div className="login-intro">
                    <p className="login-eyebrow">
                        Sua conta Boraí
                    </p>

                    <h1>
                        Entrar
                    </h1>

                    <p>
                        Acesse sua conta para
                        gerenciar sua área no
                        Boraí.
                    </p>
                </div>

                <form
                    className="login-form"
                    onSubmit={
                        handleSubmit
                    }
                >
                    <div>
                        <label htmlFor="email">
                            E-mail
                        </label>

                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(
                                event
                            ) =>
                                setEmail(
                                    event
                                        .target
                                        .value
                                )
                            }
                            required
                            autoComplete="email"
                            placeholder="seu@email.com"
                        />
                    </div>

                    <div>
                        <label htmlFor="password">
                            Senha
                        </label>

                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(
                                event
                            ) =>
                                setPassword(
                                    event
                                        .target
                                        .value
                                )
                            }
                            required
                            autoComplete="current-password"
                            placeholder="Digite sua senha"
                        />
                    </div>

                    {error && (
                        <p
                            className="login-error"
                            role="alert"
                        >
                            {error}
                        </p>
                    )}

                    <button
                        type="submit"
                        disabled={
                            isLoggingIn
                        }
                    >
                        {isLoggingIn
                            ? "Entrando..."
                            : "Entrar"}
                    </button>
                </form>
            </section>
        </main>
    );
}