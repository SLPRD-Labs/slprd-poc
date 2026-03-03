import type { IAuthContext } from "@/contexts/auth-context/auth-context";
import type { IMatrixClientContext } from "@/contexts/matrix-client-context/matrix-client-context";
import { RootLayout } from "@/layouts/root";
import type { QueryClient } from "@tanstack/react-query";
import { createRootRouteWithContext } from "@tanstack/react-router";

interface RouterContext {
    queryClient: QueryClient;
    authContext: IAuthContext;
    matrixClientContext: IMatrixClientContext;
}

export const Route = createRootRouteWithContext<RouterContext>()({
    component: RootLayout
});
