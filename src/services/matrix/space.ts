import { getMyMembership } from "@/libs/utils/matrix/room";
import { getChildOrder, partitionSpacesAndRooms, sanitizeOrder } from "@/libs/utils/matrix/space";
import type { MatrixClient, Room } from "matrix-js-sdk";
import { EventTimeline, EventType, KnownMembership } from "matrix-js-sdk";

class SpaceService {
    public getRootAndInvitedSpaces(client: MatrixClient): {
        rootSpaces: Room[];
        invitedSpaces: Room[];
    } {
        const joinedSpaces: Room[] = [];
        const invitedSpaces: Room[] = [];

        for (const space of client.getVisibleRooms(true).filter(r => r.isSpaceRoom())) {
            switch (getMyMembership(space)) {
                case KnownMembership.Join:
                case KnownMembership.Knock:
                    joinedSpaces.push(space);
                    break;
                case KnownMembership.Invite:
                    invitedSpaces.push(space);
                    break;
            }
        }

        const rootSpaces = this.filterRootSpaces(client, joinedSpaces);
        this.sortRootSpaces(rootSpaces);

        this.sortRootSpaces(invitedSpaces);

        return {
            rootSpaces,
            invitedSpaces
        };
    }

    public getRoomsBySpaceId(client: MatrixClient, spaceId: string): Room[] {
        const traverseSpace = (spaceId: string, parentPath: Set<string>): Set<string> | null => {
            if (parentPath.has(spaceId)) {
                return null;
            }

            const space = client.getRoom(spaceId);
            if (!space) {
                return null;
            }

            const [childSpaces, childRooms] = partitionSpacesAndRooms(
                this.getChildren(client, space)
            );

            const roomIds = new Set(childRooms.map(r => r.roomId));

            const newPath = new Set(parentPath).add(spaceId);

            for (const childSpace of childSpaces) {
                const childRooms = traverseSpace(childSpace.roomId, newPath);
                if (childRooms !== null) {
                    for (const childRoom of childRooms) {
                        roomIds.add(childRoom);
                    }
                }
            }

            return new Set(
                [...roomIds].flatMap(roomId => {
                    return client.getRoomUpgradeHistory(roomId, true, true).map(r => r.roomId);
                })
            );
        };

        const rooms = traverseSpace(spaceId, new Set()) ?? new Set();

        return [...rooms].map(r => client.getRoom(r)).filter(r => r !== null);
    }

    private filterRootSpaces(client: MatrixClient, joinedSpaces: Room[]): Room[] {
        const unseenSpaces = new Set(joinedSpaces);

        for (const space of joinedSpaces) {
            for (const childSpace of this.getChildSpaces(client, space)) {
                unseenSpaces.delete(childSpace);
            }
        }

        const rootSpaces = [...unseenSpaces];
        rootSpaces.sort((a, b) => a.roomId.localeCompare(b.roomId));
        const detachedNodes = new Set(rootSpaces);

        for (const rootSpace of rootSpaces) {
            this.markTreeChildren(client, rootSpace, detachedNodes);
        }

        for (const detachedNode of detachedNodes) {
            if (!detachedNodes.has(detachedNode)) {
                continue;
            }
            rootSpaces.push(detachedNode);
            this.markTreeChildren(client, detachedNode, detachedNodes);
        }

        return rootSpaces;
    }

    private getChildSpaces(client: MatrixClient, space: Room): Room[] {
        return this.getChildren(client, space).filter(
            r => r.isSpaceRoom() && getMyMembership(r) === KnownMembership.Join
        );
    }

    private getChildren(client: MatrixClient, space: Room): Room[] {
        const childEvents =
            space
                .getLiveTimeline()
                .getState(EventTimeline.FORWARDS)
                ?.getStateEvents(EventType.SpaceChild)
                .filter(e => e.getContent().via) ?? [];

        childEvents.sort((a, b) => {
            const aKey = getChildOrder(a);
            const bKey = getChildOrder(b);

            for (let i = 0; i < aKey.length; i++) {
                const av = aKey[i];
                const bv = bKey[i];

                if (av === undefined && bv === undefined) continue;
                if (av === undefined) return 1;
                if (bv === undefined) return -1;

                if (av < bv) return -1;
                if (av > bv) return 1;
            }

            return 0;
        });

        return childEvents
            .map(e => {
                const history = client.getRoomUpgradeHistory(e.getStateKey() ?? "", true, true);
                return history.at(-1);
            })
            .filter(r => r !== undefined)
            .filter(
                r =>
                    getMyMembership(r) === KnownMembership.Join ||
                    getMyMembership(r) === KnownMembership.Invite
            );
    }

    private markTreeChildren(client: MatrixClient, rootSpace: Room, unseen: Set<Room>): void {
        const stack = [rootSpace];
        while (stack.length) {
            const space = stack.pop();
            if (!space) {
                continue;
            }
            unseen.delete(space);
            for (const childSpace of this.getChildSpaces(client, space)) {
                if (unseen.has(childSpace)) {
                    stack.push(childSpace);
                }
            }
        }
    }

    private sortRootSpaces(spaces: Room[]): void {
        spaces.sort((a, b) => {
            const aTag = this.getSpaceTagOrdering(a);
            const bTag = this.getSpaceTagOrdering(b);

            if (aTag !== undefined || bTag !== undefined) {
                if (aTag === undefined) return 1;
                if (bTag === undefined) return -1;
                if (aTag < bTag) return -1;
                if (aTag > bTag) return 1;
            }

            if (a.roomId < b.roomId) return -1;
            if (a.roomId > b.roomId) return 1;

            return 0;
        });
    }

    private getSpaceTagOrdering(space: Room): string | undefined {
        const e = space.getAccountData(EventType.SpaceOrder);
        if (e === undefined) {
            return undefined;
        }
        return sanitizeOrder(e);
    }
}

export const spaceService = new SpaceService();
