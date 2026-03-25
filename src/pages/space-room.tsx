import { Room } from "@/pages/room";
import { Route } from "@/routes/_mainLayout/space/$spaceId/room/$roomId";

export function SpaceRoom() {
    const { roomId } = Route.useParams();
    return <Room roomId={roomId} />;
}
