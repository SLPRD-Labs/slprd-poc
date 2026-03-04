import { useMatrixClientContext } from "@/contexts/matrix-client-context/matrix-client-context";
import { useQuery } from "@tanstack/react-query";

export const useCurrentUserQuery = () => {
    const { client, ready } = useMatrixClientContext();

    return useQuery({
        queryKey: ["currentUser"],
        queryFn: () => client.getUser(client.getSafeUserId()),
        staleTime: Infinity,
        enabled: ready
    });
};
