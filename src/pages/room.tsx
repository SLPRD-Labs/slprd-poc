import { TextChat } from "@/components/textual-room/text-chat";
import { useMatrixClient } from "@/hooks/use-matrix-client";
import { useQuery } from "@tanstack/react-query";
import type { FC } from "react";
import { PresenceSidenav } from "@/components/presence-sidenav";

interface RoomProps {
    roomId: string;
}

export const Room: FC<RoomProps> = ({ roomId }) => {
    const { client, ready } = useMatrixClient();

    const roomQuery = useQuery({
        queryKey: ["rooms", roomId],
        queryFn: () => client.getRoom(roomId),
        staleTime: Infinity,
        enabled: ready
    });

    if (!roomQuery.isSuccess) {
        return null;
    }

    return (
         <div className="flex h-full w-full overflow-hidden">
        <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
            <div className="flex shrink-0 border-b p-3">
                <h2 className="font-semibold"># {roomQuery.data?.name}</h2>
            </div>
            <TextChat roomId={roomId} />
        </div>

        <div className="h-full w-80 shrink-0 border-l">
            <PresenceSidenav />
        </div>
    </div>
    );
};
