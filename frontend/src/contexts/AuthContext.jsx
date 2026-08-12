import {
    createContext,
    useContext,
    useMemo,
    useState,
} from "react";

import {
    login as loginRequest,
} from "../services/authService.js";

const AuthContext =
    createContext(null);

const STORAGE_KEY =
    "borai_auth";

function getStoredAuth() {
    try {
        const stored =
            localStorage.getItem(
                STORAGE_KEY
            );

        if (!stored) {
            return {
                token: null,
                user: null,
            };
        }

        const parsed =
            JSON.parse(stored);

        if (
            !parsed?.token ||
            !parsed?.user
        ) {
            return {
                token: null,
                user: null,
            };
        }

        return {
            token:
                parsed.token,
            user:
                parsed.user,
        };
    } catch {
        return {
            token: null,
            user: null,
        };
    }
}

export function AuthProvider({
    children,
}) {
    const storedAuth =
        getStoredAuth();

    const [token, setToken] =
        useState(
            storedAuth.token
        );

    const [user, setUser] =
        useState(
            storedAuth.user
        );

    const [isLoggingIn, setIsLoggingIn] =
        useState(false);

    async function login(
        email,
        password
    ) {
        setIsLoggingIn(true);

        try {
            const response =
                await loginRequest({
                    email,
                    password,
                });

            const authData = {
                token:
                    response.token,
                user:
                    response.user,
            };

            localStorage.setItem(
                STORAGE_KEY,
                JSON.stringify(
                    authData
                )
            );

            setToken(
                authData.token
            );

            setUser(
                authData.user
            );

            return authData;
        } finally {
            setIsLoggingIn(false);
        }
    }

    function logout() {
        localStorage.removeItem(
            STORAGE_KEY
        );

        setToken(null);
        setUser(null);
    }

    const value =
        useMemo(
            () => ({
                token,
                user,

                isAuthenticated:
                    Boolean(
                        token &&
                        user
                    ),

                isLoggingIn,

                login,
                logout,
            }),
            [
                token,
                user,
                isLoggingIn,
            ]
        );

    return (
        <AuthContext.Provider
            value={value}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context =
        useContext(
            AuthContext
        );

    if (!context) {
        throw new Error(
            "useAuth deve ser utilizado dentro de AuthProvider."
        );
    }

    return context;
}