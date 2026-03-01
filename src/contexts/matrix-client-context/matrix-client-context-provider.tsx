import type { MatrixSession } from "@/contexts/auth-context/auth-context";
import { MatrixClientContext } from "@/contexts/matrix-client-context/matrix-client-context";
import type { MatrixClient } from "matrix-js-sdk";
import { ClientEvent, createClient, SyncState } from "matrix-js-sdk";
import type { FC, PropsWithChildren } from "react";
import { useEffect, useMemo, useState } from "react";

interface Props extends PropsWithChildren {
    session: MatrixSession;
}

export const MatrixClientContextProvider: FC<Props> = props => {
    const client = useMemo<MatrixClient>(
        () =>
            createClient({
                baseUrl: props.session.baseUrl,
                accessToken: props.session.accessToken,
                deviceId: props.session.deviceId,
                userId: props.session.userId,
                refreshToken: props.session.refreshToken,
                useLivekitForGroupCalls: true
            }),
        [props.session]
    );

    const [ready, setReady] = useState(false);

    useEffect(() => {
        const listener = (state: SyncState) => {
            if (state === SyncState.Prepared) {
                setReady(true);
            }
        };

        client.once(ClientEvent.Sync, listener);

        void (async () => {
            console.log("Starting Matrix client...");
            await client.startClient({
                clientWellKnownPollPeriod: 60 * 10
            });

            const clientWellKnown = await client.waitForClientWellKnown();

            /* eslint-disable */
            const rtcFoci = clientWellKnown?.["org.matrix.msc4143.rtc_foci"];
            if (rtcFoci && Array.isArray(rtcFoci)) {
                client.setLivekitServiceURL(
                    rtcFoci.find(t => t.type === "livekit" && "livekit_service_url" in t)
                        ?.livekit_service_url
                );
            }
            /* eslint-enable */
        })();

        return () => {
            client.removeListener(ClientEvent.Sync, listener);
        };
    }, [client]);

    return <MatrixClientContext value={{ client, ready }}>{props.children}</MatrixClientContext>;
};
