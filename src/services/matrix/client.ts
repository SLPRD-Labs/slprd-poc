import type { MatrixClient } from "matrix-js-sdk";

class ClientService {
    public async start(client: MatrixClient): Promise<void> {
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
    }
}

export const clientService = new ClientService();
