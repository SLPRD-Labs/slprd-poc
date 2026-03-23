import { Rooms } from "@/pages/rooms";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_mainLayout/space/$spaceId/room/")({
    component: Rooms
});
