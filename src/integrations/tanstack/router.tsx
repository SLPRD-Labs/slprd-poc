import { useAuthContext } from "@/contexts/auth-context/auth-context";
import { routeTree } from "@/routeTree.gen";
import { createRouter, RouterProvider } from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import type { FC } from "react";

const router = createRouter({
    routeTree,
    context: {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        auth: undefined!
    }
});

declare module "@tanstack/react-router" {
    interface Register {
        router: typeof router;
    }
}

export const TanStackRouterProvider: FC = () => {
    const auth = useAuthContext();

    return <RouterProvider router={router} context={{ auth }} />;
};

export const TanStackRouterDevtoolsPlugin: FC = () => {
    return <TanStackRouterDevtoolsPanel router={router} />;
};
