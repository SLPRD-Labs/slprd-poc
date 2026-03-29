import { TextChat } from "@/components/textual-room/text-chat";
import { useMatrixClient } from "@/hooks/use-matrix-client";
import { useQuery } from "@tanstack/react-query";
import { RoomEvent } from "matrix-js-sdk";
import { useSyncExternalStore } from "react";
import type { FC } from "react";

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

    const roomName = useSyncExternalStore(
        callback => {
            client.on(RoomEvent.Name, callback);
            return () => void client.off(RoomEvent.Name, callback);
        },
        () => client.getRoom(roomId)?.name.trim() ?? roomId
    );

    if (!roomQuery.isSuccess) {
        return null;
    }

    return (
        <div className="flex h-full w-full overflow-hidden">
            <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
                <div className="shrink-0 border-b p-3">
                    <h2 className="font-semibold"># {roomName}</h2>
                </div>

                <div className="min-h-0 flex-1 overflow-hidden">
                    <TextChat roomId={roomId} />
                </div>
            </div>
        </div>
    );
};
