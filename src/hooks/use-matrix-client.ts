import { useMatrixClientContext } from "@/contexts/matrix-client-context/matrix-client-context";
import { getClient } from "@/integrations/matrix/client";

export const useMatrixClient = () => {
    const { ready } = useMatrixClientContext();

    const client = getClient();
    if (client === null) {
        throw new Error("The Matrix client is not initialized.");
    }

    return { client, ready };
};
