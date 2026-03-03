import { useAuthContext } from "@/contexts/auth-context/auth-context";
import { useMatrixClientContext } from "@/contexts/matrix-client-context/matrix-client-context";
import { routeTree } from "@/routeTree.gen";
import { useQueryClient } from "@tanstack/react-query";
import { createRouter, RouterProvider } from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import type { FC } from "react";

const router = createRouter({
    routeTree,
    context: {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        queryClient: undefined!,
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        authContext: undefined!,
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        matrixClientContext: undefined!
    }
});

declare module "@tanstack/react-router" {
    interface Register {
        router: typeof router;
    }
}

export const TanStackRouterProvider: FC = () => {
    const queryClient = useQueryClient();

    const authContext = useAuthContext();

    const matrixClientContext = useMatrixClientContext();

    return (
        <RouterProvider
            router={router}
            context={{ queryClient, authContext, matrixClientContext }}
        />
    );
};

export const TanStackRouterDevtoolsPlugin: FC = () => {
    return <TanStackRouterDevtoolsPanel router={router} />;
};
