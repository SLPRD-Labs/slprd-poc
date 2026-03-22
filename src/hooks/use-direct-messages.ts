import { useState, useEffect, useCallback } from "react";
import type { MatrixClient, Room} from "matrix-js-sdk";
import { ClientEvent } from "matrix-js-sdk";

type MDirectContent = Record<string, string[]>;

const toMDirectContent = (value: unknown): MDirectContent => {
    if (!value || typeof value !== "object") return {};
    return value as MDirectContent;
};

export const useDirectMessages = (client: MatrixClient) => {
    const [dmRooms, setDmRooms] = useState<Room[]>([]);

    const updateDMs = useCallback(() => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        const accountData = client.getAccountData("m.direct");

        if (!accountData) {
            setDmRooms([]);
            return;
        }

        const rawContent = accountData.getContent();
        const mDirect = toMDirectContent(rawContent);

        const allDmRoomIds = Object.values(mDirect).flat();

        const rooms = allDmRoomIds
            .map(id => client.getRoom(id))
            .filter((room): room is Room => room !== null && room.getMyMembership() === "join");

        setDmRooms(rooms);
    }, [client]);

    useEffect(() => {
        client.on(ClientEvent.AccountData, updateDMs);
        client.on(ClientEvent.Room, updateDMs);

        // eslint-disable-next-line react-hooks/set-state-in-effect
        updateDMs();

        return () => {
            client.removeListener(ClientEvent.AccountData, updateDMs);
            client.removeListener(ClientEvent.Room, updateDMs);
        };
    }, [client, updateDMs]);

    return dmRooms;
};
