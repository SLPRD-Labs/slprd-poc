import type { EventType, KnownMembership, MatrixEvent, Room } from "matrix-js-sdk";

export const getMyMembership = (room: Room): KnownMembership => {
    return room.getMyMembership() as KnownMembership;
};

export const getEventType = (event: MatrixEvent): EventType => {
    return event.getType() as EventType;
};
