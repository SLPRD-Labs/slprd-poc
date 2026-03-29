import { useState, useEffect } from "react";
import type { MatrixClient, User, MatrixEvent, RoomMember } from "matrix-js-sdk";
import { RoomMemberEvent, UserEvent, ClientEvent } from "matrix-js-sdk";

export type PresenceStatus = "online" | "offline" | "unavailable";

export interface UserPresenceData {
    displayName: string;
    status: PresenceStatus;
    lastActiveAgo?: number;
    statusMsg?: string;
    avatarUrl?: string;
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
            statusMsg: user.presenceStatusMsg ?? undefined,
            avatarUrl: user.avatarUrl ?? undefined
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
                    statusMsg: user.presenceStatusMsg ?? undefined,
                    avatarUrl: user.avatarUrl ?? undefined
                }
            }));
        };

        const handleNameChange = (_event: MatrixEvent, member: RoomMember, _oldName: string | null): void => {
            setPresenceMap(prev => {
                if (!prev[member.userId]) return prev;
                return {
                    ...prev,
                    [member.userId]: {
                        ...prev[member.userId],
                        displayName: member.name ?? member.userId,
                    }
                };
            });
        };

        const handleSync = () => {
            setPresenceMap(computePresenceMap(matrixClient));
        };    

        matrixClient.on(UserEvent.Presence, handlePresenceChange);
        matrixClient.on(RoomMemberEvent.Name, handleNameChange);
        matrixClient.on(ClientEvent.Sync, handleSync);

        return () => {
            matrixClient.removeListener(UserEvent.Presence, handlePresenceChange);
            matrixClient.removeListener(RoomMemberEvent.Name, handleNameChange);
            matrixClient.removeListener(ClientEvent.Sync, handleSync);
        };
    }, [matrixClient]);

    return presenceMap;
};
