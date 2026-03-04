import type { KnownMembership, Room } from "matrix-js-sdk";

export const getMyMembership = (room: Room): KnownMembership => {
    return room.getMyMembership() as KnownMembership;
};
