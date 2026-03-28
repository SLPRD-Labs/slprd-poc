import { EventTimeline, EventType, Preset } from "matrix-js-sdk";
import type { MatrixClient, Room } from "matrix-js-sdk";

type MDirectContent = Partial<Record<string, string[]>>;
type AccountDataType = Parameters<MatrixClient["getAccountData"]>[0];

const M_DIRECT_EVENT = "m.direct" as AccountDataType;
const RTC_MEMBER_EVENT = "org.matrix.msc3401.call.member";
const STABLE_RTC_MEMBER_EVENT = "m.call.member";

const isStringArray = (value: unknown): value is string[] =>
    Array.isArray(value) && value.every(item => typeof item === "string");

const toMDirectContent = (value: unknown): MDirectContent => {
    if (!value || typeof value !== "object") {
        return {};
    }

    return Object.entries(value as Record<string, unknown>).reduce<MDirectContent>(
        (acc, [userId, roomIds]) => {
            if (isStringArray(roomIds)) {
                acc[userId] = roomIds;
            }
            return acc;
        },
        {}
    );
};

const isJoinedRoom = (client: MatrixClient, roomId: string): roomId is string => {
    const room = client.getRoom(roomId);
    return room?.getMyMembership() === "join";
};

const isOneToOneRoomWithUser = (room: Room, targetUserId: string): boolean => {
    const validMembers = room.getMembers().filter(member => member.membership === "join" || member.membership === "invite");
    const hasTargetMember = validMembers.some(member => member.userId === targetUserId);
    return hasTargetMember && validMembers.length === 2;
};

const canSendRtcMemberState = (room: Room, userId: string): boolean => {
    return (
        room.getLiveTimeline().getState(EventTimeline.FORWARDS)?.maySendStateEvent(RTC_MEMBER_EVENT, userId)
        ?? room.getLiveTimeline().getState(EventTimeline.FORWARDS)?.maySendStateEvent(STABLE_RTC_MEMBER_EVENT, userId) ?? false
    );
};

const getPowerLevelsContent = (room: Room): Record<string, unknown> => {
    const event = room.getLiveTimeline().getState(EventTimeline.FORWARDS)?.getStateEvents("m.room.power_levels", "");
    const content = event?.getContent();
    if (!content || typeof content !== "object") {
        return {};
    }
    return { ...(content as Record<string, unknown>) };
};

const getEventLevels = (powerLevels: Record<string, unknown>): Record<string, number> => {
    const events = powerLevels.events;
    if (!events || typeof events !== "object") {
        return {};
    }

    return Object.entries(events as Record<string, unknown>).reduce<Record<string, number>>(
        (acc, [eventType, level]) => {
            if (typeof level === "number") {
                acc[eventType] = level;
            }
            return acc;
        },
        {}
    );
};

const ensureCallCompatibleRoom = async (
    client: MatrixClient,
    room: Room,
    userId: string
): Promise<boolean> => {
    if (canSendRtcMemberState(room, userId)) {
        return true;
    }

    // If user cannot edit power levels, we cannot repair this room.
    if (!room.getLiveTimeline().getState(EventTimeline.FORWARDS)?.maySendStateEvent("m.room.power_levels", userId)) {
        return false;
    }

    const powerLevels = getPowerLevelsContent(room);
    const eventLevels = getEventLevels(powerLevels);

    const updatedEvents = {
        ...eventLevels,
        [RTC_MEMBER_EVENT]: 0,
        [STABLE_RTC_MEMBER_EVENT]: 0,
    };

    await client.sendStateEvent(room.roomId, EventType.RoomPowerLevels, {
        ...powerLevels,
        events: updatedEvents,
    });

    return canSendRtcMemberState(room, userId);
};

export const addRoomToMDirect = async (
    client: MatrixClient,
    targetUserId: string,
    roomId: string
): Promise<void> => {
    try {
        const accountData = client.getAccountData(M_DIRECT_EVENT);
        const mDirect = toMDirectContent(accountData?.getContent());
        
        const existingRooms = mDirect[targetUserId] ?? [];
        if (!existingRooms.includes(roomId)) {
            mDirect[targetUserId] = [...existingRooms, roomId];
            await client.setAccountData(M_DIRECT_EVENT, mDirect);
        }
    } catch (error) {
        console.error("Failed to add room to m.direct:", error);
    }
};

export const getOrCreateDM = async (
    client: MatrixClient,
    targetUserId: string
): Promise<string | undefined> => {
    try {
        const myUserId = client.getUserId();
        if (!myUserId) {
            return undefined;
        }

        // 1. Read m.direct room candidates.
        const accountData = client.getAccountData(M_DIRECT_EVENT);
        const mDirect = toMDirectContent(accountData?.getContent());
        const existingRooms = mDirect[targetUserId] ?? [];

        // 2. Prefer joined m.direct rooms that are real 1:1 DMs and call-compatible.
        for (const roomId of existingRooms) {
            if (!isJoinedRoom(client, roomId)) {
                continue;
            }

            const room = client.getRoom(roomId);
            if (!room) {
                continue;
            }

            if (!isOneToOneRoomWithUser(room, targetUserId)) {
                continue;
            }

            if (await ensureCallCompatibleRoom(client, room, myUserId)) {
                return roomId;
            }
        }

        // 3. Create a new DM with call member permissions open to everyone.
        const response = await client.createRoom({
            invite: [targetUserId],
            is_direct: true,
            preset: Preset.PrivateChat,
            power_level_content_override: {
                events: {
                    [RTC_MEMBER_EVENT]: 0,
                    [STABLE_RTC_MEMBER_EVENT]: 0,
                },
            },
        });

        const newRoomId = response.room_id;

        // 4. Update m.direct and deduplicate.
        mDirect[targetUserId] = [...new Set([...(mDirect[targetUserId] ?? []), newRoomId])];
        await client.setAccountData(M_DIRECT_EVENT, mDirect);

        return newRoomId;
    } catch (error) {
        console.error("Failed to get/create DM:", error);
        return undefined;
    }
};
