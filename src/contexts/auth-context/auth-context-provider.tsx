import type { MatrixSession } from "@/contexts/auth-context/auth-context";
import { AuthContext } from "@/contexts/auth-context/auth-context";
import { useMatrixClientContext } from "@/contexts/matrix-client-context/matrix-client-context";
import { useLocalStorage } from "@/hooks/use-local-storage";
import type { FC, PropsWithChildren } from "react";

export interface LoginOpts {
    baseUrl: string;
    username: string;
    password: string;
}

export const AuthContextProvider: FC<PropsWithChildren> = ({ children }) => {
    const { start, stop } = useMatrixClientContext();

    const [session, setSession] = useLocalStorage<MatrixSession | null>("session", null);

    const login = async (opts: LoginOpts): Promise<void> => {
        const matrixSession = await start(opts);

        setSession(matrixSession);
    };

    const logout = async (): Promise<void> => {
        await stop();

        setSession(null);
    };

    return <AuthContext value={{ session, login, logout }}>{children}</AuthContext>;
};
