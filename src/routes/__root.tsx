import type { IAuthContext } from "@/contexts/auth-context/auth-context";
import { RootLayout } from "@/layouts/root";
import { createRootRouteWithContext } from "@tanstack/react-router";

interface RouterContext {
    auth: IAuthContext;
}

export const Route = createRootRouteWithContext<RouterContext>()({
    component: RootLayout
});
