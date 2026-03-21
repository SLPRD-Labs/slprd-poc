import { useAuthContext } from "@/contexts/auth-context/auth-context";
import { MatrixClientContext } from "@/contexts/matrix-client-context/matrix-client-context";
import { clientService } from "@/services/matrix/client";
import { useQueryClient } from "@tanstack/react-query";
import type { ClientEventHandlerMap, MatrixClient } from "matrix-js-sdk";
import {
    ClientEvent,
    createClient,
    EventTimeline,
    EventType,
    RoomEvent,
    RoomStateEvent,
    SyncState
} from "matrix-js-sdk";
import type { FC, PropsWithChildren } from "react";
import { useEffect, useMemo, useState } from "react";

export const MatrixClientContextProvider: FC<PropsWithChildren> = ({ children }) => {
    const { session } = useAuthContext();

    const client = useMemo<MatrixClient>(() => {
        if (session == null) {
            return createClient({ baseUrl: import.meta.env.VITE_DEFAULT_HOMESERVER_BASE_URL });
        }

        return createClient({
            baseUrl: session.baseUrl,
            userId: session.userId,
            deviceId: session.deviceId,
            accessToken: session.accessToken,
            refreshToken: session.refreshToken,
            useLivekitForGroupCalls: true
        });
    }, [session]);

    const [ready, setReady] = useState(false);

    const queryClient = useQueryClient();

    useEffect(() => {
        if (session === null) {
            return;
        }

        const onClientSync: ClientEventHandlerMap[ClientEvent.Sync] = state => {
            if (state === SyncState.Prepared) {
                setReady(true);

                client.on(ClientEvent.Room, onClientRoom);
                client.on(RoomEvent.Name, onClientRoom);
                client.on(RoomEvent.MyMembership, onRoomMyMembership);
                client.on(RoomEvent.AccountData, onRoomAccountData);
                client.on(RoomStateEvent.Events, onRoomStateEvents);
                client.on(RoomStateEvent.Members, onRoomStateMembers);
                client.on(ClientEvent.AccountData, onClientAccountData);
            }
        };

        const onClientRoom: ClientEventHandlerMap[ClientEvent.Room] = room => {
            const nameEvents =
                room
                    .getLiveTimeline()
                    .getState(EventTimeline.BACKWARDS)
                    ?.getStateEvents(RoomEvent.Name) ?? [];

            if (room.isSpaceRoom() && nameEvents.length > 0) {
                void queryClient.invalidateQueries({ queryKey: ["spaces"] });
            }
        };

        const onRoomMyMembership: ClientEventHandlerMap[RoomEvent.MyMembership] = room => {
            if (room.isSpaceRoom()) {
                void queryClient.invalidateQueries({ queryKey: ["spaces"] });
            }
        };

        const onRoomAccountData: ClientEventHandlerMap[RoomEvent.AccountData] = (_, room) => {
            if (room.isSpaceRoom()) {
                void queryClient.invalidateQueries({ queryKey: ["spaces"] });
            }
        };

        const onRoomStateEvents: ClientEventHandlerMap[RoomStateEvent.Events] = (event, state) => {
            const room = client.getRoom(state.roomId);

            if (room?.isSpaceRoom()) {
                void queryClient.invalidateQueries({ queryKey: ["spaces"] });

                if (event.getType() === (EventType.SpaceChild as string)) {
                    void queryClient.invalidateQueries({
                        queryKey: ["space", state.roomId, "rooms"]
                    });
                }
            }
        };

        const onRoomStateMembers: ClientEventHandlerMap[RoomStateEvent.Members] = (_, state) => {
            const room = client.getRoom(state.roomId);

            if (room?.isSpaceRoom()) {
                void queryClient.invalidateQueries({ queryKey: ["spaces"] });
            }
        };

        const onClientAccountData: ClientEventHandlerMap[ClientEvent.AccountData] = event => {
            const room = client.getRoom(event.getRoomId());

            if (room?.isSpaceRoom()) {
                void queryClient.invalidateQueries({ queryKey: ["spaces"] });
            }
        };

        client.once(ClientEvent.Sync, onClientSync);

        void clientService.start(client);

        return () => {
            client.removeListener(ClientEvent.Sync, onClientSync);

            client.removeListener(ClientEvent.Room, onClientRoom);
            client.removeListener(RoomEvent.Name, onClientRoom);
            client.removeListener(RoomEvent.MyMembership, onRoomMyMembership);
            client.removeListener(RoomEvent.AccountData, onRoomAccountData);
            client.removeListener(RoomStateEvent.Events, onRoomStateEvents);
            client.removeListener(RoomStateEvent.Members, onRoomStateMembers);
            client.removeListener(ClientEvent.AccountData, onClientAccountData);

            setReady(false);
        };
    }, [session, client, queryClient]);

    return <MatrixClientContext value={{ client, ready }}>{children}</MatrixClientContext>;
};
