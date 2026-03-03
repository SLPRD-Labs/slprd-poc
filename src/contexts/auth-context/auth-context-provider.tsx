import type { MatrixSession } from "@/contexts/auth-context/auth-context";
import { AuthContext } from "@/contexts/auth-context/auth-context";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { createClient } from "matrix-js-sdk";
import type { FC, PropsWithChildren } from "react";

export interface LoginOpts {
    baseUrl: string;
    username: string;
    password: string;
}

export const AuthContextProvider: FC<PropsWithChildren> = ({ children }) => {
    const [session, setSession] = useLocalStorage<MatrixSession | null>("session", null);

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

        setSession(matrixSession);
    };

    const logout = (): void => {
        setSession(null);
    };

    return <AuthContext value={{ session, login, logout }}>{children}</AuthContext>;
};
