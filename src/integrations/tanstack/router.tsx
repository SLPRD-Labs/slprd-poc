import { useAuthContext } from "@/contexts/auth-context/auth-context";
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
        authContext: undefined!
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

    return <RouterProvider router={router} context={{ queryClient, authContext }} />;
};

export const TanStackRouterDevtoolsPlugin: FC = () => {
    return <TanStackRouterDevtoolsPanel router={router} />;
};
