import type { MatrixSession } from "@/contexts/auth-context/auth-context";
import type { LoginOpts } from "@/contexts/auth-context/auth-context-provider";
import { MatrixClientContext } from "@/contexts/matrix-client-context/matrix-client-context";
import { getClient, startClient, stopClient } from "@/integrations/matrix/client";
import { clientService } from "@/services/matrix/client";
import { useQueryClient } from "@tanstack/react-query";
import type { FC, PropsWithChildren } from "react";
import { useEffect, useRef, useState } from "react";

export const MatrixClientContextProvider: FC<PropsWithChildren> = ({ children }) => {
    const queryClient = useQueryClient();

    const [ready, setReady] = useState(false);

    const start = async (opts: LoginOpts): Promise<MatrixSession> =>
        startClient(opts, queryClient, () => {
            setReady(true);
        });

    const stop = async (): Promise<void> => stopClient();

    const initialized = useRef(false);

    useEffect(() => {
        const client = getClient();
        if (client !== null && !initialized.current) {
            initialized.current = true;
            void clientService.start(client, queryClient, () => {
                setReady(true);
            });
        }
    }, [queryClient]);

    return <MatrixClientContext value={{ ready, start, stop }}>{children}</MatrixClientContext>;
};
