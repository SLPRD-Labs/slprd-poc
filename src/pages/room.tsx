import { TextChat } from "@/components/textual-room/text-chat";
import { useMatrixClient } from "@/hooks/use-matrix-client";
import { Route } from "@/routes/_mainLayout/space/$spaceId/room/$roomId";
import { useQuery } from "@tanstack/react-query";
import type { FC } from "react";
import { PresenceSidenav } from "@/components/presence-sidenav";
import { useCallContext } from "@/contexts/call-context/call-context";
import { Room as CallRoom } from "@/components/room";

export const Room: FC = () => {
    const call = useCallContext();

    const { spaceId, roomId } = Route.useParams();

    const { client, ready } = useMatrixClient();

    const spaceQuery = useQuery({
        queryKey: ["spaces", spaceId],
        queryFn: () => client.getRoom(spaceId),
        staleTime: Infinity,
        enabled: ready
    });

    const roomQuery = useQuery({
        queryKey: ["spaces", spaceId, "room", roomId],
        queryFn: () => client.getRoom(roomId),
        staleTime: Infinity,
        enabled: ready
    });

    if (!spaceQuery.isSuccess || !roomQuery.isSuccess) {
        return null;
    }

    return (
        <div className="flex h-full w-full">
            <div className="flex h-full w-full flex-col">
                <div className="flex border-b p-3">
                    <h2 className="font-semibold"># {roomQuery.data?.name}</h2>
                </div>
                {call.state === "active" && call.room.roomId === roomQuery.data?.roomId && (
                    <>
                    <CallRoom liveKitRoom={call.liveKitRoom} />
                    <button
                        onClick={() => {
                            void call.leave();
                        }}
                    >
                        Leave
                    </button>
                    </>
                )}
                <TextChat roomId={roomId} />
            </div>
            <PresenceSidenav />
        </div>
    );
};
