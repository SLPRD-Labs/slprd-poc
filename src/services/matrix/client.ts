import type { QueryClient } from "@tanstack/react-query";
import type { ClientEventHandlerMap, MatrixClient } from "matrix-js-sdk";
import { ClientEvent, EventTimeline, RoomEvent, RoomStateEvent, SyncState } from "matrix-js-sdk";

type EventHandler<E extends keyof ClientEventHandlerMap> = (
    client: MatrixClient,
    queryClient: QueryClient
) => ClientEventHandlerMap[E];

class ClientService {
    public async start(
        client: MatrixClient,
        queryClient: QueryClient,
        onReady: () => void
    ): Promise<void> {
        client.once(ClientEvent.Sync, state => {
            if (state === SyncState.Prepared) {
                onReady();
            }
        });

        await client.startClient({
            clientWellKnownPollPeriod: 60 * 10
        });

        client.on(ClientEvent.Room, this.onClientRoom(client, queryClient));
        client.on(ClientEvent.AccountData, this.onClientAccountData(client, queryClient));

        client.on(RoomEvent.Name, this.onClientRoom(client, queryClient));
        client.on(RoomEvent.MyMembership, this.onRoomMyMembership(client, queryClient));
        client.on(RoomEvent.AccountData, this.onRoomAccountData(client, queryClient));

        client.on(RoomStateEvent.Events, this.onRoomStateEvents(client, queryClient));
        client.on(RoomStateEvent.Members, this.onRoomStateMembers(client, queryClient));

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

    public async stop(client: MatrixClient): Promise<void> {
        client.removeAllListeners();
        await client.logout(true);
    }

    onClientRoom: EventHandler<ClientEvent.Room> = (_, queryClient) => room => {
        const nameEvents =
            room
                .getLiveTimeline()
                .getState(EventTimeline.BACKWARDS)
                ?.getStateEvents(RoomEvent.Name) ?? [];

        if (room.isSpaceRoom() && nameEvents.length > 0) {
            void queryClient.invalidateQueries({ queryKey: ["spaces"] });
        }
    };

    onRoomMyMembership: EventHandler<RoomEvent.MyMembership> = (_, queryClient) => room => {
        if (room.isSpaceRoom()) {
            void queryClient.invalidateQueries({ queryKey: ["spaces"] });
        }
    };

    onRoomAccountData: EventHandler<RoomEvent.AccountData> = (_, queryClient) => (_, room) => {
        if (room.isSpaceRoom()) {
            void queryClient.invalidateQueries({ queryKey: ["spaces"] });
        }
    };

    onRoomStateEvents: EventHandler<RoomStateEvent.Events> =
        (client, queryClient) => (_, state) => {
            const room = client.getRoom(state.roomId);

            if (room?.isSpaceRoom()) {
                void queryClient.invalidateQueries({ queryKey: ["spaces"] });
            }
        };

    onRoomStateMembers: EventHandler<RoomStateEvent.Members> =
        (client, queryClient) => (_, state) => {
            const room = client.getRoom(state.roomId);

            if (room?.isSpaceRoom()) {
                void queryClient.invalidateQueries({ queryKey: ["spaces"] });
            }
        };

    onClientAccountData: EventHandler<ClientEvent.AccountData> = (client, queryClient) => event => {
        const room = client.getRoom(event.getRoomId());

        if (room?.isSpaceRoom()) {
            void queryClient.invalidateQueries({ queryKey: ["spaces"] });
        }
    };
}

export const clientService = new ClientService();
