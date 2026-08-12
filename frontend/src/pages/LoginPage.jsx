import {
    useState,
} from "react";

import {
    useNavigate,
} from "react-router";

import {
    useAuth,
} from "../contexts/AuthContext.jsx";

export default function LoginPage() {
    const navigate =
        useNavigate();

    const {
        login,
        isLoggingIn,
    } = useAuth();

    const [email, setEmail] =
        useState("");

    const [password, setPassword] =
        useState("");

    const [error, setError] =
        useState("");

    async function handleSubmit(event) {
        event.preventDefault();

        setError("");

        try {
            await login(
                email,
                password
            );

            navigate("/");
        } catch (error) {
            setError(
                error.message ||
                "Não foi possível entrar."
            );
        }
    }

    return (
        <main>
            <h1>Entrar</h1>

            <form
                onSubmit={handleSubmit}
            >
                <div>
                    <label htmlFor="email">
                        E-mail
                    </label>

                    <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(event) =>
                            setEmail(
                                event.target.value
                            )
                        }
                        required
                        autoComplete="email"
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
                        onChange={(event) =>
                            setPassword(
                                event.target.value
                            )
                        }
                        required
                        autoComplete="current-password"
                    />
                </div>

                {error && (
                    <p role="alert">
                        {error}
                    </p>
                )}

                <button
                    type="submit"
                    disabled={isLoggingIn}
                >
                    {isLoggingIn
                        ? "Entrando..."
                        : "Entrar"}
                </button>
            </form>
        </main>
    );
}