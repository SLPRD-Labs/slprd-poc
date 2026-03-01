import type { ActiveCallContext, ICallContext } from "@/contexts/call-context/call-context";
import { CallContext } from "@/contexts/call-context/call-context";
import { useMatrixClientContext } from "@/contexts/matrix-client-context/matrix-client-context";
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

    const { client } = useMatrixClientContext();

    const join = async (roomId: string) => {
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

            rtcSession.joinRTCSession({ userId, deviceId, memberId }, [transport]);

            // const body = {
            //     room_id: room.roomId,
            //     slot_id: "m.call#ROOM",
            //     openid_token: await client.getOpenIdToken(),
            //     member: {
            //         id: memberId,
            //         claimed_user_id: userId,
            //         claimed_device_id: deviceId
            //     },
            // };
            //
            // const livekitTokenResponse = await fetch(client.getLivekitServiceURL() + "/get_token", {
            //     method: "POST",
            //     headers: {
            //         "Content-Type": "application/json",
            //     },
            //     body: JSON.stringify(body),
            // });

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

            await navigator.mediaDevices.getUserMedia({ audio: true, video: true });

            const liveKitRoom = new LiveKitRoom();
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

        await call.rtcSession.leaveRoomSession();
        await call.liveKitRoom.disconnect();

        setCall(null);
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
