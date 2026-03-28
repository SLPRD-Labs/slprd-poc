import { useState, useEffect } from "react";
import type { MatrixClient, User, MatrixEvent } from "matrix-js-sdk";
import { UserEvent } from "matrix-js-sdk";

export type PresenceStatus = "online" | "offline" | "unavailable";

export interface UserPresenceData {
    displayName: string;
    status: PresenceStatus;
    lastActiveAgo?: number;
    statusMsg?: string;
}

export type PresenceMap = Record<string, UserPresenceData>;

const parsePresence = (presence: string | null | undefined): PresenceStatus => {
    return presence === "online" || presence === "unavailable" ? presence : "offline";
};

const computePresenceMap = (client: MatrixClient | null): PresenceMap => {
    if (!client) return {};
    const map: PresenceMap = {};
    client.getUsers().forEach(user => {
        map[user.userId] = {
            displayName: user.displayName ?? user.userId,
            status: parsePresence(user.presence),
            lastActiveAgo: user.lastActiveAgo,
            statusMsg: user.presenceStatusMsg ?? undefined
        };
    });
    return map;
};

export const usePresence = (matrixClient: MatrixClient): PresenceMap => {
    const [presenceMap, setPresenceMap] = useState<PresenceMap>(() =>
        computePresenceMap(matrixClient)
    );

    const [prevClient, setPrevClient] = useState<MatrixClient>(matrixClient);

    if (matrixClient !== prevClient) {
        setPrevClient(matrixClient);
        setPresenceMap(computePresenceMap(matrixClient));
    }

    useEffect(() => {
        const handlePresenceChange = (_event: MatrixEvent | undefined, user: User): void => {
            setPresenceMap(prev => ({
                ...prev,
                [user.userId]: {
                    displayName: user.displayName ?? user.userId,
                    status: parsePresence(user.presence),
                    lastActiveAgo: user.lastActiveAgo,
                    statusMsg: user.presenceStatusMsg ?? undefined
                }
            }));
        };

        matrixClient.on(UserEvent.Presence, handlePresenceChange);

        return () => {
            matrixClient.removeListener(UserEvent.Presence, handlePresenceChange);
        };
    }, [matrixClient]);

    return presenceMap;
};
