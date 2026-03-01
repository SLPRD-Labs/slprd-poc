import type { LoginOpts } from "@/contexts/auth-context/auth-context-provider";
import { createContext, use } from "react";

export interface MatrixSession {
    baseUrl: string;
    userId: string;
    deviceId: string;
    accessToken: string;
    refreshToken: string | undefined;
}

export interface IAuthContext {
    session: MatrixSession | null;
    login: (opts: LoginOpts) => Promise<void>;
    logout: () => void;
}

export const AuthContext = createContext<IAuthContext | null>(null);

export const useAuthContext = (): IAuthContext => {
    const authContext = use(AuthContext);
    if (authContext === null) {
        throw new Error("useAuthContext called without AuthContextProvider");
    }
    return authContext;
};
