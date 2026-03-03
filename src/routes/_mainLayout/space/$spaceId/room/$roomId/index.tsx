import { Room } from "@/pages/room";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_mainLayout/space/$spaceId/room/$roomId/")({
    loader: async ({ context, params }) => {
        const { spaceId, roomId } = params;

        const queries = [
            context.queryClient.ensureQueryData({
                queryKey: ["spaces", spaceId],
                queryFn: () => context.matrixClientContext.client.getRoom(spaceId),
                staleTime: Infinity
            }),
            context.queryClient.ensureQueryData({
                queryKey: ["spaces", spaceId, "room", roomId],
                queryFn: () => context.matrixClientContext.client.getRoom(roomId),
                staleTime: Infinity
            })
        ];

        await Promise.all(queries);
    },
    component: Room
});
