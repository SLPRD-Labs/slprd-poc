import { Preset } from "matrix-js-sdk";
import type { MatrixClient } from "matrix-js-sdk";

type MDirectContent = Partial<Record<string, string[]>>;
type AccountDataType = Parameters<MatrixClient["getAccountData"]>[0];

const M_DIRECT_EVENT = "m.direct" as AccountDataType;

const isStringArray = (value: unknown): value is string[] =>
    Array.isArray(value) && value.every(item => typeof item === "string");

const toMDirectContent = (value: unknown): MDirectContent => {
    if (!value || typeof value !== "object") {
        return {};
    }

    return Object.entries(value as Record<string, unknown>).reduce<MDirectContent>(
        (acc, [userId, roomIds]) => {
            if (isStringArray(roomIds)) {
                acc[userId] = roomIds;
            }
            return acc;
        },
        {}
    );
};

export const getOrCreateDM = async (
    client: MatrixClient,
    targetUserId: string
): Promise<string | undefined> => {
    try {
        // 1. Récupérer les données m.direct
        const accountData = client.getAccountData(M_DIRECT_EVENT);
        const mDirect = toMDirectContent(accountData?.getContent());

        const existingRooms = mDirect[targetUserId] ?? [];

        // 2. Chercher une room où on est encore présent
        const activeRoomId = existingRooms.find((id: string) => {
            const room = client.getRoom(id);
            return room?.getMyMembership() === "join";
        });

        if (activeRoomId) return activeRoomId;

        // 3. Créer la room si aucune n'est valide
        const response = await client.createRoom({
            invite: [targetUserId],
            is_direct: true,
            preset: Preset.PrivateChat
        });

        const newRoomId = response.room_id;

        // 4. Mettre à jour les Account Data
        mDirect[targetUserId] = [...(mDirect[targetUserId] ?? []), newRoomId];
        await client.setAccountData(M_DIRECT_EVENT, mDirect);

        return newRoomId;
    } catch (error) {
        console.error("Failed to get/create DM:", error);
        return undefined;
    }
};
