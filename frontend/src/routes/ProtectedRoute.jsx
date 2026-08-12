import {
    Navigate,
    Outlet,
} from "react-router";

import {
    useAuth,
} from "../contexts/AuthContext.jsx";

export default function ProtectedRoute({
    allowedRoles,
}) {
    const {
        user,
        isAuthenticated,
    } = useAuth();

    if (!isAuthenticated) {
        return (
            <Navigate
                to="/login"
                replace
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