import { useCallback, useEffect, useState } from "react";
import type { MatrixClient, Room } from "matrix-js-sdk";
import { ClientEvent, EventType, KnownMembership, RoomEvent, RoomStateEvent } from "matrix-js-sdk";
import { getMyMembership } from "@/libs/utils/matrix/room";
import { toMDirectContent } from "@/libs/utils/matrix/accountData";

export const useDirectMessages = (client: MatrixClient) => {
    const [dmRooms, setDmRooms] = useState<Room[]>([]);

    const updateDMs = useCallback(() => {
        const accountData = client.getAccountData(EventType.Direct);
        const mDirect = toMDirectContent(accountData);
        const allDmRoomIds = Object.values(mDirect).flat();

        const allRooms = client.getRooms();

        const filteredRooms = allRooms.filter(room => {
            const membership = getMyMembership(room);
            const isJoinedOrInvited =
                membership === KnownMembership.Join || membership === KnownMembership.Invite;
            if (!isJoinedOrInvited) {
                return false;
            }

            const isKnownDM = allDmRoomIds.includes(room.roomId);
            const memberCount = room.getJoinedMemberCount() + room.getInvitedMemberCount();

            if (membership === KnownMembership.Join && !isKnownDM && memberCount !== 2) {
                return false;
            }

            const isInvitation = membership === KnownMembership.Invite;

            if (room.isSpaceRoom()) {
                return false;
            }

            return isKnownDM || (isInvitation && memberCount <= 2);
        });

        setDmRooms(filteredRooms);
    }, [client]);

    useEffect(() => {
        client.on(RoomEvent.MyMembership, updateDMs);
        client.on(ClientEvent.AccountData, updateDMs);
        client.on(ClientEvent.Room, updateDMs);
        client.on(RoomStateEvent.Events, updateDMs);

        // eslint-disable-next-line react-hooks/set-state-in-effect
        updateDMs();

        return () => {
            client.removeListener(ClientEvent.AccountData, updateDMs);
            client.removeListener(ClientEvent.Room, updateDMs);
            client.removeListener(RoomEvent.MyMembership, updateDMs);
            client.removeListener(RoomStateEvent.Events, updateDMs);
        };
    }, [client, updateDMs]);

    return dmRooms;
};
