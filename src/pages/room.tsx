import { TextChat } from "@/components/textual-room/text-chat";
import { useMatrixClient } from "@/hooks/use-matrix-client";
import { Route } from "@/routes/_mainLayout/space/$spaceId/room/$roomId";
import { useQuery } from "@tanstack/react-query";
import { useState, type FC } from "react";
import { PresenceSidenav } from "@/components/presence-sidenav";
import { useCallContext } from "@/contexts/call-context/call-context";
import { Room as CallRoom } from "@/components/room";
import { RoomType } from "matrix-js-sdk";
import { useEffect } from "react";

export const Room: FC = () => {
    const call = useCallContext();

    const { spaceId, roomId } = Route.useParams();

    const { client, ready } = useMatrixClient();

    const [showChat, setShowChat] = useState<boolean>();

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

    const isCallRoom = roomQuery.data?.getType?.() === RoomType.ElementVideo;

    useEffect(() => {
        if (!isCallRoom) {
            setShowChat(true);
        } else {
            setShowChat(false);
        }
    }, [roomId]);

    if (!spaceQuery.isSuccess || !roomQuery.isSuccess) {
        return null;
    }

    return (
        <div className="flex h-full w-full">
            <div className="flex h-full w-full flex-col min-h-0">
                <div className="flex items-center justify-between border-b p-3">
                    <h2 className="font-semibold"># {roomQuery.data?.name}</h2>

                    {isCallRoom && (
                        <div className="flex items-center gap-2">
                            {call.state === "active" && call.room.roomId === roomQuery.data?.roomId ? (
                                <>
                                    <button 
                                        className="px-3 py-1 rounded border border-red-500 text-red-600 hover:bg-red-500/10 transition"
                                        onClick={() => {
                                            void call.leave();
                                            setShowChat(true);
                                        }}
                                    >
                                        Leave call
                                    </button>

                                    <button
                                        className="px-3 py-1 rounded bg-gray-200 dark:bg-gray-700"
                                        onClick={() => setShowChat(!showChat)}
                                    >
                                        {showChat ? "Hide chat" : "Show chat"}
                                    </button>
                                </>
                            ) : (
                                <button 
                                    className="px-3 py-1 rounded border border-green-500 text-green-600 hover:bg-green-500/10 transition"
                                    onClick={() => {
                                        if (call.state === "idle") {
                                            void call.join(roomId);
                                            setShowChat(false);
                                        }
                                    }}
                                >
                                    Join call
                                </button>
                            )}

                            
                        </div>
                    )}
                </div>

                {call.state === "active" && call.room.roomId === roomQuery.data?.roomId && (
                    <CallRoom liveKitRoom={call.liveKitRoom} />
                )}

                {showChat && (
                    <TextChat roomId={roomId} />
                )}
            </div>
            <PresenceSidenav />
        </div>
    );
};
