import type { MatrixSession } from "@/contexts/auth-context/auth-context";
import { MatrixClientContext } from "@/contexts/matrix-client-context/matrix-client-context";
import { clientService } from "@/services/matrix/client";
import { useQueryClient } from "@tanstack/react-query";
import type { ClientEventHandlerMap, MatrixClient } from "matrix-js-sdk";
import { ClientEvent, createClient, RoomEvent, RoomStateEvent, SyncState } from "matrix-js-sdk";
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
                userId: props.session.userId,
                deviceId: props.session.deviceId,
                accessToken: props.session.accessToken,
                refreshToken: props.session.refreshToken,
                useLivekitForGroupCalls: true
            }),
        [props.session]
    );

    const [ready, setReady] = useState(false);

    const queryClient = useQueryClient();

    useEffect(() => {
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
            if (room.isSpaceRoom()) {
                void queryClient.invalidateQueries({ queryKey: ["spaces"] });
            }
        };

        const onRoomMyMembership: ClientEventHandlerMap[RoomEvent.MyMembership] = room => {
            if (room.isSpaceRoom()) {
                void queryClient.invalidateQueries({ queryKey: ["spaces"] });
            }
        };

        /* eslint-disable */
        const onRoomAccountData: ClientEventHandlerMap[RoomEvent.AccountData] = (
            event,
            room,
            prevEvent
        ) => {};

        const onRoomStateEvents: ClientEventHandlerMap[RoomStateEvent.Events] = (
            event,
            state,
            prevEvent
        ) => {};

        const onRoomStateMembers: ClientEventHandlerMap[RoomStateEvent.Members] = (
            event,
            state,
            member
        ) => {};

        const onClientAccountData: ClientEventHandlerMap[ClientEvent.AccountData] = (
            event,
            lastEvent
        ) => {};
        /* eslint-enable */

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
        };
    }, [client, queryClient]);

    return <MatrixClientContext value={{ client, ready }}>{props.children}</MatrixClientContext>;
};
