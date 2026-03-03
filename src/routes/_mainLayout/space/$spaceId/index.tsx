import { Space } from "@/pages/space";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_mainLayout/space/$spaceId/")({
    loader: async ({ context, params }) => {
        const { spaceId } = params;

        await context.queryClient.ensureQueryData({
            queryKey: ["spaces", spaceId],
            queryFn: () => context.matrixClientContext.client.getRoom(spaceId),
            staleTime: Infinity
        });
    },
    component: Space
});
