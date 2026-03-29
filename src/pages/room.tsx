import { TextChat } from "@/components/textual-room/text-chat";
import { Button } from "@/components/ui/button";
import { useCallContext } from "@/contexts/call-context/call-context";
import { useMatrixClient } from "@/hooks/use-matrix-client";
import { useQuery } from "@tanstack/react-query";
import { RoomEvent, RoomType } from "matrix-js-sdk";
import { useSyncExternalStore, useEffect, useState } from "react";
import type { FC } from "react";
import { MatrixRTCSessionEvent, MatrixRTCSessionManagerEvents } from "matrix-js-sdk/lib/matrixrtc";
import { Room as CallRoom } from "@/components/room";
import { Hash, Volume2 } from "lucide-react";

interface RoomProps {
    roomId: string;
    isDm?: boolean;
}

export const Room: FC<RoomProps> = ({ roomId, isDm }) => {
    const call = useCallContext();

    const { client, ready } = useMatrixClient();
    const [remoteParticipantCount, setRemoteParticipantCount] = useState(0);
    const [showChat, setShowChat] = useState<boolean>(true);

    const roomQuery = useQuery({
        queryKey: ["rooms", roomId],
        queryFn: () => client.getRoom(roomId),
        staleTime: Infinity,
        enabled: ready
    });

    const isCallRoom = roomQuery.data?.getType() === RoomType.ElementVideo;

    const roomName = useSyncExternalStore(
        callback => {
            client.on(RoomEvent.Name, callback);
            return () => void client.off(RoomEvent.Name, callback);
        },
        () => client.getRoom(roomId)?.name.trim() ?? roomId
    );

    useEffect(() => {
        if (!isCallRoom) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setShowChat(true);
        } else {
            setShowChat(false);
        }

        if (!ready || !roomQuery.data) {
            return;
        }

        const room = roomQuery.data;
        const myUserId = client.getUserId();

        const checkActiveCall = () => {
            const session = client.matrixRTC.getRoomSession(room);
            const activeMemberships = session.memberships.filter(m => !m.isExpired());
            const count = new Set(
                activeMemberships.map(m => m.userId).filter(userId => userId !== myUserId)
            ).size;
            setRemoteParticipantCount(count);
        };

        checkActiveCall();
        const intervalId = window.setInterval(checkActiveCall, 3000);

        const session = client.matrixRTC.getRoomSession(room);
        session.on(MatrixRTCSessionEvent.MembershipsChanged, checkActiveCall);

        const onSessionEvent = (roomIdStr: string) => {
            if (roomIdStr === room.roomId) {
                checkActiveCall();
            }
        };

        client.matrixRTC.on(MatrixRTCSessionManagerEvents.SessionStarted, onSessionEvent);
        client.matrixRTC.on(MatrixRTCSessionManagerEvents.SessionEnded, onSessionEvent);

        return () => {
            window.clearInterval(intervalId);
            session.off(MatrixRTCSessionEvent.MembershipsChanged, checkActiveCall);
            client.matrixRTC.off(MatrixRTCSessionManagerEvents.SessionStarted, onSessionEvent);
            client.matrixRTC.off(MatrixRTCSessionManagerEvents.SessionEnded, onSessionEvent);
        };
    }, [client, ready, roomQuery.data, isCallRoom]);

    if (!roomQuery.isSuccess || roomQuery.data === null) {
        return null;
    }

    const hasRemoteCall = remoteParticipantCount > 0;

    

    if (!roomQuery.isSuccess) {
        return null;
    }

    return (
        <div className="flex h-full w-full">
            <div className="flex h-full min-h-0 w-full flex-col">
                <div className="flex items-center border-b p-3">
                    <h2 className="font-semibold flex items-center gap-2">
                        {isCallRoom ? <Volume2 size={16} /> : <Hash size={16} />}
                     {roomName}
                     </h2>

                    {(isDm ?? isCallRoom) && (
                        <>
                            {hasRemoteCall && call.state === "idle" && (
                                <span className="ml-3 rounded-full bg-emerald-100 px-2 py-1 text-xs font-medium text-emerald-800">
                                    Appel en cours ({remoteParticipantCount})
                                </span>
                            )}
                            <div className="ml-auto flex items-center gap-2">
                                {call.state === "idle" && (
                                    <Button
                                        className="hover:bg-primary/90 transition"
                                        onClick={() => {
                                            void call.join(roomId).catch(console.error);
                                            setShowChat(false);
                                        }}
                                    >
                                        {hasRemoteCall ? "Rejoindre l’appel" : "Démarrer un appel"}
                                    </Button>
                                )}

                                {call.state === "joining" && (
                                    <Button size="sm" disabled>
                                        Connexion...
                                    </Button>
                                )}

                                {call.state === "active" &&
                                    call.room.roomId === roomQuery.data.roomId && (
                                        <>
                                            <Button
                                                variant="secondary"
                                                onClick={() => {
                                                    setShowChat(prev => !prev);
                                                }}
                                            >
                                                {showChat ? "Masquer le chat" : "Afficher le chat"}
                                            </Button>
                                            <Button
                                                variant="destructive"
                                                onClick={() => {
                                                    void call.leave().catch(console.error);
                                                    setShowChat(true);
                                                }}
                                            >
                                                Quitter l’appel
                                            </Button>
                                        </>
                                    )}
                            </div>
                        </>
                    )}
                </div>
                {(isDm ?? isCallRoom) &&
                    call.state === "active" &&
                    call.room.roomId === roomQuery.data.roomId && (
                        <CallRoom liveKitRoom={call.liveKitRoom} />
                    )}

                {showChat && <TextChat roomId={roomId} />}
            </div>
        </div>
    );
};
