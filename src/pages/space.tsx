import { useMatrixClientContext } from "@/contexts/matrix-client-context/matrix-client-context";
import { Route } from "@/routes/_mainLayout/space/$spaceId";
import { useQuery } from "@tanstack/react-query";
import type { FC } from "react";

export const Space: FC = () => {
    const { spaceId } = Route.useParams();

    const { client, ready } = useMatrixClientContext();

    const spaceQuery = useQuery({
        queryKey: ["spaces", spaceId],
        queryFn: () => client.getRoom(spaceId),
        staleTime: Infinity,
        enabled: ready
    });

    if (!spaceQuery.isSuccess) {
        return null;
    }

    return <span>Space {spaceQuery.data?.name}</span>;
};
