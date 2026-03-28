import { Button } from "@/components/ui/button";
import { useCallContext } from "@/contexts/call-context/call-context";
import { useMatrixClient } from "@/hooks/use-matrix-client";
import { useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { RoomStateEvent, ClientEvent, EventType } from "matrix-js-sdk";
import { MatrixRTCSessionManagerEvents } from "matrix-js-sdk/lib/matrixrtc";
import { toMDirectContent } from "@/libs/utils/matrix/accountData";

interface IncomingCall {
    roomId: string;
    roomName: string;
}

export const IncomingCallBanner = () => {
    const { client } = useMatrixClient();
    const call = useCallContext();
    const navigate = useNavigate();

    const [incomingCall, setIncomingCall] = useState<IncomingCall | null>(null);
    const [joiningIncoming, setJoiningIncoming] = useState(false);

    // useRef instead of useState: mutations never trigger re-renders or effect
    // recreations, which was causing the interval to reset on every snooze.
    const snoozedUntilByRoom = useRef<Record<string, number>>({});

    const detectIncomingCall = useCallback(() => {
        const myUserId = client.getUserId();
        if (!myUserId) {
            setIncomingCall(null);
            return;
        }

        const now = Date.now();

        const accountData = client.getAccountData(EventType.Direct);
        const mDirect = toMDirectContent(accountData);
        const allDmRoomIds = Object.values(mDirect).flat();

        const candidate = client
            .getRooms()
            .filter(room => room.getMyMembership() === "join" && allDmRoomIds.includes(room.roomId))
            .find(room => {
                if ((snoozedUntilByRoom.current[room.roomId] ?? 0) > now) {
                    return false;
                }

                const session = client.matrixRTC.getRoomSession(room);
                const activeMemberships = session.memberships.filter(
                    membership => !membership.isExpired()
                );

                if (activeMemberships.length === 0) {
                    return false;
                }

                const hasCurrentUser = activeMemberships.some(
                    membership => membership.userId === myUserId
                );
                const hasOtherUser = activeMemberships.some(
                    membership => membership.userId !== myUserId
                );

                return hasOtherUser && !hasCurrentUser;
            });

        setIncomingCall(
            candidate ? { roomId: candidate.roomId, roomName: candidate.name } : null
        );
    }, [client]);

    useEffect(() => {
        if (call.state !== "idle") {
            setIncomingCall(null);
            return;
        }

        // Initial check in case a call is already in progress on mount.
        detectIncomingCall();

        // Listen to MatrixRTC membership changes instead of polling with setInterval.
        // This fires immediately when someone joins or leaves a call.
        const rtcManager = client.matrixRTC;
        // SessionStarted/SessionEnded fire when a room transitions from having no
        // active RTC session to having one, and vice-versa.
        rtcManager.on(MatrixRTCSessionManagerEvents.SessionStarted, detectIncomingCall);
        rtcManager.on(MatrixRTCSessionManagerEvents.SessionEnded, detectIncomingCall);
 
        // RoomStateEvent.Events catches mid-session membership changes: a new
        // participant joining an existing call, or one leaving.
        client.on(RoomStateEvent.Events, detectIncomingCall);
        // Also check when auto-joining new rooms
        client.on(ClientEvent.Room, detectIncomingCall);
 
        return () => {
            rtcManager.off(MatrixRTCSessionManagerEvents.SessionStarted, detectIncomingCall);
            rtcManager.off(MatrixRTCSessionManagerEvents.SessionEnded, detectIncomingCall);
            client.off(RoomStateEvent.Events, detectIncomingCall);
            client.off(ClientEvent.Room, detectIncomingCall);
        };
    }, [call.state, client, detectIncomingCall]);

    const snoozeIncomingCall = (roomId: string, durationMs: number) => {
        snoozedUntilByRoom.current[roomId] = Date.now() + durationMs;
    };

    const handleJoinIncomingCall = async () => {
        if (call.state !== "idle" || incomingCall === null || joiningIncoming) {
            return;
        }

        setJoiningIncoming(true);

        // Capture roomId before the async call in case state changes mid-flight.
        const targetRoomId = incomingCall.roomId;

        try {
            await call.join(targetRoomId);
            await navigate({ to: "/dm/$roomId", params: { roomId: targetRoomId } });
            // Snooze after joining to avoid the banner reappearing immediately if the
            // user leaves and the remote participant is still in the call.
            snoozeIncomingCall(targetRoomId, 20_000);
            setIncomingCall(null);
        } catch (error) {
            console.error("Failed to join incoming call:", error);
        } finally {
            setJoiningIncoming(false);
        }
    };

    if (call.state !== "idle" || incomingCall === null) {
        return null;
    }

    return (
        <div className="flex items-center justify-between border-b bg-emerald-50 px-4 py-2">
            <div className="text-sm text-emerald-900">
                Incoming call in <span className="font-semibold">{incomingCall.roomName}</span>
            </div>
            <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                    snoozeIncomingCall(incomingCall.roomId, 60_000);
                    setIncomingCall(null);
                }}
            >
                Ignore
            </Button>
            <Button
                size="sm"
                onClick={() => {
                    void handleJoinIncomingCall();
                }}
                disabled={joiningIncoming}
            >
                {joiningIncoming ? "Joining..." : "Join call"}
            </Button>
        </div>
    );
};