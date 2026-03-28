import { ProfileCard } from "@/components/profile-card";
import { useMatrixClient } from "@/hooks/use-matrix-client";
import { usePresence } from "@/hooks/use-presence";
import type { FC } from "react";
import { useMemo } from "react";

export const PresenceSidenav: FC = () => {
    const { client } = useMatrixClient();
    const presence = usePresence(client);

    const { online, offline } = useMemo(() => {
        return Object.entries(presence).reduce<{
            online: [string, (typeof presence)[string]][];
            offline: [string, (typeof presence)[string]][];
        }>(
            (acc, entry) => {
                const [, data] = entry;
                if (data.status === "offline") {
                    acc.offline.push(entry);
                } else {
                    acc.online.push(entry);
                }
                return acc;
            },
            { online: [], offline: [] }
        );
    }, [presence]);

    return (
        <div className="flex h-full w-80 flex-col gap-4 overflow-y-auto border-l p-3">
            <div className="flex flex-col gap-2">
                <h3 className="px-2 text-sm font-semibold">En ligne</h3>
                {online.map(([userId, data]) => (
                    <div key={userId}>
                        <ProfileCard
                            displayName={data.displayName}
                            avatarUrl={""}
                            presenceStatus={data.status}
                        />
                    </div>
                ))}
            </div>

            {offline.length > 0 && (
                <>
                    <hr className="border-gray-500" />
                    <div className="flex flex-col gap-2">
                        <h3 className="text-muted px-2 text-sm font-semibold">Hors ligne</h3>
                        {offline.map(([userId, data]) => (
                            <div key={userId} className="opacity-60">
                                <ProfileCard
                                    displayName={data.displayName}
                                    avatarUrl={""}
                                    presenceStatus={data.status}
                                />
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};
