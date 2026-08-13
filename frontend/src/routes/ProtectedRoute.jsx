import {
    Navigate,
    Outlet,
    useLocation,
} from "react-router";

import {
    useAuth,
} from "../contexts/authContext.js";

export default function ProtectedRoute({
    allowedRoles,
}) {
    const location =
        useLocation();

    const {
        user,
        isAuthenticated,
    } = useAuth();

    if (!isAuthenticated) {
        return (
            <Navigate
                to="/login"
                replace
                state={{
                    from:
                        location.pathname,
                }}
            />
        );
    }

    if (
        allowedRoles &&
        !allowedRoles.includes(
            user.role
        )
    ) {
        return (
            <Navigate
                to="/"
                replace
            />
        );
    }

    return <Outlet />;
}