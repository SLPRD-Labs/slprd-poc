import { useMatrixClient } from "@/hooks/use-matrix-client";
import type { ClientEventHandlerMap, EmittedEvents, Listener } from "matrix-js-sdk";
import { useEffect } from "react";

export const useMatrixEvent = <E extends EmittedEvents>(
    event: E,
    listener: Listener<EmittedEvents, ClientEventHandlerMap, E>
): void => {
    const { client } = useMatrixClient();

    useEffect(() => {
        client.on(event, listener);

        return () => {
            client.off(event, listener);
        };
    }, [client, event, listener]);
};
