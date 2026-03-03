import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_mainLayout/space/$spaceId/")({
    beforeLoad: () => {
        // TODO: redirect to first room
    },
    component: () => null
});
