import { useCallback, useEffect, useState } from "react";
import {
    ClientEvent,
    EventType,
    KnownMembership,
    RoomEvent
} from "matrix-js-sdk";
import type {MatrixClient, Room} from "matrix-js-sdk";
import { getMyMembership } from "@/libs/utils/matrix/room";

type MDirectContent = Record<string, string[]>;

const toMDirectContent = (value: unknown): MDirectContent => {
    if (!value || typeof value !== "object") return {};
    return value as MDirectContent;
};

export const useDirectMessages = (client: MatrixClient) => {
    const [dmRooms, setDmRooms] = useState<Room[]>([]);

    const updateDMs = useCallback(() => {
        const accountData = client.getAccountData(EventType.Direct);
        const mDirect = toMDirectContent(accountData?.getContent());
        const allDmRoomIds = Object.values(mDirect).flat();

        const allRooms = client.getRooms();

        const filteredRooms = allRooms.filter(room => {
            const membership = getMyMembership(room);

            const isKnownDM =
                allDmRoomIds.includes(room.roomId) &&
                (membership === KnownMembership.Join || membership === KnownMembership.Invite);

            const isNewInvitation = membership === KnownMembership.Invite;

            return isKnownDM || isNewInvitation;
        });

        setDmRooms(filteredRooms);
    }, [client]);

    useEffect(() => {
        client.on(ClientEvent.AccountData, updateDMs);
        client.on(ClientEvent.Room, updateDMs);
        client.on(RoomEvent.MyMembership, updateDMs);

        // eslint-disable-next-line react-hooks/set-state-in-effect
        updateDMs();

        return () => {
            client.removeListener(ClientEvent.AccountData, updateDMs);
            client.removeListener(ClientEvent.Room, updateDMs);
            client.on(RoomEvent.MyMembership, updateDMs);
        };
    }, [client, updateDMs]);

    return dmRooms;
};
