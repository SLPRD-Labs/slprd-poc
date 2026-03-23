import type { IAuthContext } from "@/contexts/auth-context/auth-context";
import { RootLayout } from "@/layouts/root";
import type { QueryClient } from "@tanstack/react-query";
import { createRootRouteWithContext } from "@tanstack/react-router";

interface RouterContext {
    queryClient: QueryClient;
    authContext: IAuthContext;
}

export const Route = createRootRouteWithContext<RouterContext>()({
    component: RootLayout
});
