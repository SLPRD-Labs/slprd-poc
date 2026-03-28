import { TextChat } from "@/components/textual-room/text-chat";
import { MatrixLiveKitCall } from "@/components/matrix-livekit-call";
import { Button } from "@/components/ui/button";
import { useCallContext } from "@/contexts/call-context/call-context";
import { useMatrixClient } from "@/hooks/use-matrix-client";
import { useQuery } from "@tanstack/react-query";
import type { FC } from "react";
import { useEffect, useState } from "react";
import { MatrixRTCSessionEvent, MatrixRTCSessionManagerEvents } from "matrix-js-sdk/lib/matrixrtc";

interface RoomProps {
    roomId: string;
    isDm?: boolean;
}

export const Room: FC<RoomProps> = ({ roomId, isDm }) => {
    const { client, ready } = useMatrixClient();
    const call = useCallContext();
    const [remoteParticipantCount, setRemoteParticipantCount] = useState(0);

    const roomQuery = useQuery({
        queryKey: ["rooms", roomId],
        queryFn: () => client.getRoom(roomId),
        staleTime: Infinity,
        enabled: ready
    });

    useEffect(() => {
        if (!ready || !roomQuery.data) {
            return;
        }

        const room = roomQuery.data;
        const myUserId = client.getUserId();

        const checkActiveCall = () => {
            const session = client.matrixRTC.getRoomSession(room);
            const activeMemberships = session.memberships.filter(m => !m.isExpired());
            const count = new Set(
                activeMemberships
                    .map(m => m.userId)
                    .filter(userId => userId !== myUserId)
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
    }, [client, ready, roomQuery.data]);

    if (!roomQuery.isSuccess || roomQuery.data === null) {
        return null;
    }

    const hasRemoteCall = remoteParticipantCount > 0;

    return (
        <div className="flex h-full w-full">
            <div className="flex h-full w-full flex-col">
                <div className="flex border-b p-3">
                    <h2 className="font-semibold"># {roomQuery.data.name}</h2>
                    {isDm && hasRemoteCall && call.state === "idle" && (
                        <span className="ml-3 rounded-full bg-emerald-100 px-2 py-1 text-xs font-medium text-emerald-800">
                            Appel en cours ({remoteParticipantCount})
                        </span>
                    )}
                    <div className="ml-auto flex items-center gap-2">
                        {isDm && call.state === "idle" && (
                            <Button
                                size="sm"
                                onClick={() => {
                                    void call.join(roomId).catch((error: unknown) => {
                                        console.error("Failed to start/join call:", error);
                                    });
                                }}
                            >
                                {hasRemoteCall ? "Rejoindre l’appel" : "Démarrer l’appel"}
                            </Button>
                        )}
                        {isDm && call.state === "joining" && (
                            <Button size="sm" disabled>
                                Connexion...
                            </Button>
                        )}
                        {isDm && call.state === "active" && call.room.roomId === roomId && (
                            <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => {
                                    void call.leave().catch((error: unknown) => {
                                        console.error("Failed to leave call:", error);
                                    });
                                }}
                            >
                                Quitter l’appel
                            </Button>
                        )}
                    </div>
                </div>
                {isDm && call.state === "active" && call.room.roomId === roomId && (
                    <div className="border-b bg-slate-950 p-2">
                        <MatrixLiveKitCall liveKitRoom={call.liveKitRoom} />
                    </div>
                )}
                <div className="min-h-0 flex-1 overflow-hidden">
                    <TextChat roomId={roomId} />
                </div>
            </div>
        </div>
    );
};
