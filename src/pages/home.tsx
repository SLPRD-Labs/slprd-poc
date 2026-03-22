import {  useState } from "react";
import type {FC} from "react";
import { useUserDirectory } from "@/hooks/use-user-directory";
import { usePresence } from "@/hooks/use-presence";
import { UserDirectoryItem } from "@/components/common/home/user-directory-item";
import { useMatrixClient } from "@/hooks/use-matrix-client";

export const Home: FC = () => {
    const { client } = useMatrixClient();
    const [query, setQuery] = useState("");

    const { users, loading } = useUserDirectory(query);
    const presenceMap = usePresence(client);

    const onlineUsers = users.filter(user => {
        const userPresence = presenceMap[user.user_id];
        return userPresence.status === "online";
    });

    return (
        <div className="flex flex-col gap-4 p-4">
            <input
                type="text"
                value={query}
                onChange={e => {
                    setQuery(e.target.value);
                }}
                placeholder="Rechercher parmi les connectés..."
                className="w-full rounded-md border p-2"
            />

            {loading && <p className="text-xs text-gray-400 italic">Mise à jour...</p>}

            <div className="flex flex-col gap-4">
                {onlineUsers.length > 0 ? (
                    <div className="flex flex-col divide-y overflow-hidden rounded-md border bg-white shadow-sm">
                        {onlineUsers.map(user => (
                            <UserDirectoryItem
                                key={user.user_id}
                                user={user}
                                presence={presenceMap[user.user_id]}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="py-8 text-center">
                        <p className="text-sm font-medium text-gray-500">
                            Aucun utilisateur connecté trouvé.
                        </p>
                        <p className="text-muted-foreground mt-1 text-[10px] italic">
                            (Seuls les utilisateurs avec qui vous partagez un salon sont visibles)
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};
