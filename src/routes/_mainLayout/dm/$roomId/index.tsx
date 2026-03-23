import { Room } from "@/pages/room";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_mainLayout/dm/$roomId/")({
    component: DmRoomPage
});

// eslint-disable-next-line react-refresh/only-export-components
function DmRoomPage() {
    const { roomId } = Route.useParams();
    return <Room roomId={roomId} />;
}
