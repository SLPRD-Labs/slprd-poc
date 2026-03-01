import type { MatrixSession } from "@/contexts/auth-context/auth-context";
import { AuthContext } from "@/contexts/auth-context/auth-context";
import { createClient } from "matrix-js-sdk";
import type { FC, PropsWithChildren } from "react";
import { useState } from "react";

export interface LoginOpts {
    baseUrl: string;
    username: string;
    password: string;
}

const rawSession = localStorage.getItem("session");
let storedMatrixSession: MatrixSession | null = null;
if (rawSession !== null) {
    storedMatrixSession = JSON.parse(rawSession) as MatrixSession;
}

export const AuthContextProvider: FC<PropsWithChildren> = ({ children }) => {
    const [session, setSession] = useState<MatrixSession | null>(storedMatrixSession);

    const login = async (opts: LoginOpts): Promise<void> => {
        const authClient = createClient({ baseUrl: opts.baseUrl });

        const loginResponse = await authClient.loginRequest({
            type: "m.login.password",
            identifier: {
                type: "m.id.user",
                user: opts.username
            },
            password: opts.password
        });

        const matrixSession: MatrixSession = {
            baseUrl: opts.baseUrl,
            userId: loginResponse.user_id,
            deviceId: loginResponse.device_id,
            accessToken: loginResponse.access_token,
            refreshToken: loginResponse.refresh_token
        };

        localStorage.setItem("session", JSON.stringify(matrixSession));
        setSession(matrixSession);
    };

    const logout = (): void => {
        localStorage.removeItem("session");
        setSession(null);
    };

    return <AuthContext value={{ session, login, logout }}>{children}</AuthContext>;
};
