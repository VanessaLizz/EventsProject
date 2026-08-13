import {
    Link,
    NavLink,
    Outlet,
    useNavigate,
} from "react-router";

import {
    useAuth,
} from "../contexts/authContext.js";

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
            <header className="site-header">
                <nav className="site-nav">
                    <Link
                        to="/"
                        className="site-logo"
                    >
                        Boraí
                    </Link>

                    <div className="site-nav-main">
                        <NavLink
                            to="/eventos"
                            className={({
                                isActive,
                            }) =>
                                isActive
                                    ? "nav-link active"
                                    : "nav-link"
                            }
                        >
                            Eventos
                        </NavLink>
                    </div>

                    <div className="site-nav-account">
                        {isAuthenticated ? (
                            <>
                                {roleLink && (
                                    <NavLink
                                        to={
                                            roleLink.path
                                        }
                                        className={({
                                            isActive,
                                        }) =>
                                            isActive
                                                ? "nav-link active"
                                                : "nav-link"
                                        }
                                    >
                                        {
                                            roleLink.label
                                        }
                                    </NavLink>
                                )}

                                <span className="nav-user">
                                    Olá, {user.name}
                                </span>

                                <button
                                    type="button"
                                    className="nav-logout"
                                    onClick={
                                        handleLogout
                                    }
                                >
                                    Sair
                                </button>
                            </>
                        ) : (
                            <NavLink
                                to="/login"
                                className="nav-login"
                            >
                                Entrar
                            </NavLink>
                        )}
                    </div>
                </nav>
            </header>

            <Outlet />
        </>
    );
}