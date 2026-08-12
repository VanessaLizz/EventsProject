import {
    Link,
    Outlet,
    useNavigate,
} from "react-router";

import {
    useAuth,
} from "../contexts/AuthContext.jsx";

const ROLE_LINKS = {
    CLIENT: {
        path: "/cliente",
        label: "Minha área",
    },

    ORGANIZER: {
        path: "/organizador",
        label: "Painel do Organizador",
    },

    CHECKIN: {
        path: "/portaria",
        label: "Portaria",
    },
};

export default function PublicLayout() {
    const navigate =
        useNavigate();

    const {
        user,
        isAuthenticated,
        logout,
    } = useAuth();

    const roleLink =
        user
            ? ROLE_LINKS[user.role]
            : null;

    function handleLogout() {
        logout();
        navigate("/");
    }

    return (
        <>
            <header>
                <nav>
                    <Link to="/">
                        Boraí
                    </Link>

                    <Link to="/eventos">
                        Eventos
                    </Link>

                    {isAuthenticated ? (
                        <>
                            {roleLink && (
                                <Link
                                    to={
                                        roleLink.path
                                    }
                                >
                                    {
                                        roleLink.label
                                    }
                                </Link>
                            )}

                            <span>
                                Olá, {user.name}
                            </span>

                            <button
                                type="button"
                                onClick={
                                    handleLogout
                                }
                            >
                                Sair
                            </button>
                        </>
                    ) : (
                        <Link to="/login">
                            Entrar
                        </Link>
                    )}
                </nav>
            </header>

            <Outlet />
        </>
    );
}