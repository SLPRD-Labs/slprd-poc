import { Room } from "@/pages/room";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_mainLayout/space/$spaceId/room/$roomId/")({
    component: Room
});
