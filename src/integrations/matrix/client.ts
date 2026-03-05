import type { MatrixSession } from "@/contexts/auth-context/auth-context";
import type { LoginOpts } from "@/contexts/auth-context/auth-context-provider";
import { clientService } from "@/services/matrix/client";
import type { QueryClient } from "@tanstack/react-query";
import type { MatrixClient } from "matrix-js-sdk";
import { createClient } from "matrix-js-sdk";

let client: MatrixClient | null = null;

const storedSession = localStorage.getItem("session");
if (storedSession) {
    const session = JSON.parse(storedSession) as MatrixSession | null;
    if (session !== null) {
        client = createClient({
            baseUrl: session.baseUrl,
            userId: session.userId,
            deviceId: session.deviceId,
            accessToken: session.accessToken,
            refreshToken: session.refreshToken,
            useLivekitForGroupCalls: true
        });
    }
}

export const getClient = () => {
    return client;
};

export const startClient = async (
    opts: LoginOpts,
    queryClient: QueryClient,
    onReady: () => void
): Promise<MatrixSession> => {
    const authClient = createClient({ baseUrl: opts.baseUrl });

    const loginResponse = await authClient.loginRequest({
        type: "m.login.password",
        identifier: {
            type: "m.id.user",
            user: opts.username
        },
        password: opts.password
    });

    const session: MatrixSession = {
        baseUrl: opts.baseUrl,
        userId: loginResponse.user_id,
        deviceId: loginResponse.device_id,
        accessToken: loginResponse.access_token,
        refreshToken: loginResponse.refresh_token
    };

    client = createClient({
        baseUrl: session.baseUrl,
        userId: session.userId,
        deviceId: session.deviceId,
        accessToken: session.accessToken,
        refreshToken: session.refreshToken,
        useLivekitForGroupCalls: true
    });

    await clientService.start(client, queryClient, onReady);

    return session;
};

export const stopClient = async (): Promise<void> => {
    const matrixClient = client;
    client = null;
    if (matrixClient !== null) {
        await clientService.stop(matrixClient);
    }
};
