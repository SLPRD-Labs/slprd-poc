import { useMatrixClient } from "@/hooks/use-matrix-client";
import { useQuery } from "@tanstack/react-query";

export const useCurrentUserQuery = () => {
    const { client, ready } = useMatrixClient();

    return useQuery({
        queryKey: ["currentUser"],
        queryFn: () => client.getUser(client.getSafeUserId()),
        staleTime: Infinity,
        enabled: ready
    });
};
