import {
    useNavigate,
} from "react-router";

import {
    useAuth,
} from "../contexts/AuthContext.jsx";

export default function AccountLogout() {
    const navigate =
        useNavigate();

    const {
        logout,
    } = useAuth();

    function handleLogout() {
        logout();
        navigate("/");
    }

    return (
        <button
            type="button"
            className="account-logout"
            onClick={handleLogout}
        >
            Sair da conta
        </button>
    );
}