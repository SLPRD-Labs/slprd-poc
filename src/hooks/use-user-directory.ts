import { useState, useEffect } from "react";
import { useMatrixClient } from "@/hooks/use-matrix-client";

export interface MatrixPublicUser {
    user_id: string;
    display_name?: string;
    avatar_url?: string;
}

export const useUserDirectory = (searchTerm: string) => {
    const { client } = useMatrixClient();
    const [users, setUsers] = useState<MatrixPublicUser[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchUsers = async () => {
            if (!searchTerm.trim()) {
                const knownUsers = new Map<string, MatrixPublicUser>();

                client.getRooms().forEach(room => {
                    room.getJoinedMembers().forEach(member => {
                        if (member.userId !== client.getUserId()) {
                            knownUsers.set(member.userId, {
                                user_id: member.userId,
                                display_name: member.name,
                                avatar_url:
                                    member.getAvatarUrl(
                                        client.getHomeserverUrl(),
                                        128,
                                        128,
                                        "scale",
                                        false,
                                        false
                                    ) ?? undefined
                            });
                        }
                    });
                });
                setUsers(Array.from(knownUsers.values()));
                return;
            }
            setLoading(true);

            try {
                const results = await client.searchUserDirectory({
                    term: searchTerm || " ",
                    limit: 30
                });
                setUsers(results.results as MatrixPublicUser[]);
            } catch (e) {
                console.error("Erreur recherche Matrix", e);
            } finally {
                setLoading(false);
            }
        };



        const timer = setTimeout(fetchUsers, 300);
        return () => {clearTimeout(timer)};
    }, [searchTerm, client]);

    return { users, loading };
};
