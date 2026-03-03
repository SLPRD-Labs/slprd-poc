import { useMatrixClientContext } from "@/contexts/matrix-client-context/matrix-client-context";
import { Route } from "@/routes/_mainLayout/space/$spaceId/room/$roomId";
import { useQuery } from "@tanstack/react-query";
import type { FC } from "react";

export const Room: FC = () => {
    const { spaceId, roomId } = Route.useParams();

    const { client, ready } = useMatrixClientContext();

    const spaceQuery = useQuery({
        queryKey: ["spaces", spaceId],
        queryFn: () => client.getRoom(spaceId),
        staleTime: Infinity,
        enabled: ready
    });

    const roomQuery = useQuery({
        queryKey: ["spaces", spaceId, "room", roomId],
        queryFn: () => client.getRoom(roomId),
        staleTime: Infinity,
        enabled: ready
    });

    if (!spaceQuery.isSuccess || !roomQuery.isSuccess) {
        return null;
    }

    return (
        <span>
            Room {roomQuery.data?.name} in Space {spaceQuery.data?.name}
        </span>
    );
};
