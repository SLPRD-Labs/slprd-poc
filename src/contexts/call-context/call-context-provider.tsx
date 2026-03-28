import type { ActiveCallContext, ICallContext } from "@/contexts/call-context/call-context";
import { CallContext } from "@/contexts/call-context/call-context";
import { useMatrixClient } from "@/hooks/use-matrix-client";
import { Room as LiveKitRoom } from "livekit-client";
import type { Transport } from "matrix-js-sdk/lib/matrixrtc";
import type { FC, PropsWithChildren } from "react";
import { useState } from "react";

export const CallContextProvider: FC<PropsWithChildren> = ({ children }) => {
    const [joining, setJoining] = useState(false);

    const [call, setCall] = useState<Pick<
        ActiveCallContext,
        "room" | "rtcSession" | "liveKitRoom"
    > | null>(null);

    const { client } = useMatrixClient();

    const resetCallState = () => {
        setCall(null);
        setJoining(false);
    };

    const join = async (roomId: string) => {
        if (joining) {
            return;
        }

        if (call !== null && call.room.roomId === roomId) {
            return;
        }

        if (call !== null) {
            try {
                await call.rtcSession.leaveRoomSession(5000);
            } catch {
                // Continue cleanup even if Matrix leave fails.
            }

            try {
                await call.liveKitRoom.disconnect(true);
            } catch {
                // Continue cleanup even if LiveKit disconnect fails.
            }

            resetCallState();
        }

        setJoining(true);

        try {
            const room = client.getRoom(roomId);
            if (room === null) {
                throw new Error(`Room with ID ${roomId} not found`);
            }

            const userId = client.getUserId();
            const deviceId = client.getDeviceId();
            if (userId === null || deviceId === null) {
                throw new Error("User ID or Device ID is null");
            }

            const memberId = crypto.randomUUID();

            const rtcSession = client.matrixRTC.getRoomSession(room);

            const oldestMembership = rtcSession.getOldestMembership();
            const oldestMembershipTransport = oldestMembership?.getTransport(oldestMembership);

            let transport: Transport;
            if (oldestMembershipTransport !== undefined) {
                transport = oldestMembershipTransport;
            } else {
                transport = {
                    type: "livekit",
                    livekit_service_url: client.getLivekitServiceURL(),
                    livekit_alias: room.roomId
                };
            }

            rtcSession.joinRTCSession(
                { userId, deviceId, memberId },
                [transport],
                undefined,
                {
                    notificationType: "ring",
                    callIntent: "video"
                }
            );

            const body = {
                device_id: deviceId,
                openid_token: await client.getOpenIdToken(),
                room: room.roomId
            };

            const livekitTokenResponse = await fetch(
                (client.getLivekitServiceURL() ?? "") + "/sfu/get",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(body)
                }
            );

            const livekitTokenData = (await livekitTokenResponse.json()) as {
                url: string;
                jwt: string;
            };

            const liveKitRoom = new LiveKitRoom();
            liveKitRoom.on("disconnected", () => {
                void rtcSession.leaveRoomSession(5000).catch(() => {
                    // Best effort: disconnection can happen while already leaving.
                });
                resetCallState();
            });

            await liveKitRoom.connect(livekitTokenData.url, livekitTokenData.jwt);

            setCall({
                room,
                rtcSession,
                liveKitRoom
            });
            setJoining(false);
        } catch (e) {
            setJoining(false);
            throw e;
        }
    };

    const leave = async () => {
        if (call === null) {
            return;
        }

        try {
            await call.rtcSession.leaveRoomSession(5000);
        } catch {
            // Continue cleanup even if Matrix leave fails.
        }

        try {
            await call.liveKitRoom.disconnect(true);
        } catch {
            // Continue cleanup even if LiveKit disconnect fails.
        }

        resetCallState();
    };

    let value: ICallContext;
    if (joining) {
        value = { state: "joining" };
    } else if (call === null) {
        value = { state: "idle", join };
    } else {
        value = { state: "active", ...call, leave };
    }

    return <CallContext value={value}>{children}</CallContext>;
};
