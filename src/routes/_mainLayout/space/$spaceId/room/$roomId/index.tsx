import { createFileRoute } from "@tanstack/react-router";
import { SpaceRoom } from "@/pages/space-room";

export const Route = createFileRoute("/_mainLayout/space/$spaceId/room/$roomId/")({
    component: SpaceRoom
});
