import { Room } from "@/pages/room";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_mainLayout/space/$spaceId/room/$roomId/")({
    component: SpaceRoomPage
});

// eslint-disable-next-line react-refresh/only-export-components
function SpaceRoomPage() {
    const { roomId } = Route.useParams();
    return <Room roomId={roomId} />;
}
