import type { FC } from "react";
import { usePresence } from "@/hooks/use-presence";
import { useMatrixClientContext } from "@/contexts/matrix-client-context/matrix-client-context";
import { ProfileCard } from "@/components/profile-card";

export const PresenceSidenav: FC = () => {
    const { client } = useMatrixClientContext();
    const presence = usePresence(client);

    return (
        <div className="flex h-full w-80 flex-col gap-2 overflow-y-auto border-l p-3">
            {Object.entries(presence).map(([userId, data]) => (
                <div key={userId}>
                    <ProfileCard displayName={data.displayName} avatarUrl={""} presenceStatus={data.status} />
                </div>
            ))}
        </div>
    );
};
