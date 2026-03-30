import { DmRoom } from "@/pages/dm-room";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_mainLayout/dm/$roomId/")({
    component: DmRoom
});
