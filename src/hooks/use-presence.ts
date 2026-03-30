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

        const handleNameChange = (_event: MatrixEvent, member: RoomMember): void => {
            setPresenceMap(prev => {
                const currentUserPresence = prev[member.userId];
                return {
                    ...prev,
                    [member.userId]: {
                        ...currentUserPresence,
                        displayName: member.name
                    }
                };
            });
        };

        const handleAvatarChange = (_event: MatrixEvent | undefined, user: User): void => {
            setPresenceMap(prev => ({
                ...prev,
                [user.userId]: {
                    ...(prev[user.userId] ?? {}),
                    avatarUrl: user.avatarUrl ?? undefined
                }
            }));
        };

        const syncProfiles = async (): Promise<void> => {
            const users = matrixClient.getUsers();
            await Promise.all(
                users.map(async user => {
                    if (!user.avatarUrl) {
                        const profile = await matrixClient.getProfileInfo(user.userId);
                        user.avatarUrl = profile.avatar_url ?? undefined;
                    }
                })
            );
            setPresenceMap(computePresenceMap(matrixClient));
        };

        const handleSync = (): void => {
            void syncProfiles();
        };

        matrixClient.on(UserEvent.Presence, handlePresenceChange);
        matrixClient.on(RoomMemberEvent.Name, handleNameChange);
        matrixClient.on(UserEvent.AvatarUrl, handleAvatarChange);
        matrixClient.on(ClientEvent.Sync, handleSync);

        return () => {
            matrixClient.removeListener(UserEvent.Presence, handlePresenceChange);
            matrixClient.removeListener(RoomMemberEvent.Name, handleNameChange);
            matrixClient.removeListener(UserEvent.AvatarUrl, handleAvatarChange);
            matrixClient.removeListener(ClientEvent.Sync, handleSync);
        };
    }, [matrixClient]);

    return presenceMap;
};
