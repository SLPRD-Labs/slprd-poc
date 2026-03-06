import { AppSidebar } from "@/components/common/sidebar/sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { CallContextProvider } from "@/contexts/call-context/call-context-provider";
import { Outlet, useMatchRoute } from "@tanstack/react-router";
import type { CSSProperties, FC } from "react";

const useSpaceRoomMatchRoute = (): false | { spaceId: string; roomId?: string } => {
    "use no memo";

    const matchRoute = useMatchRoute();

    const spaceRoomMatchRoute = matchRoute({
        to: "/space/$spaceId/room/$roomId",
        fuzzy: true
    });

    if (spaceRoomMatchRoute !== false) {
        return spaceRoomMatchRoute;
    }

    return matchRoute({
        to: "/space/$spaceId",
        fuzzy: true
    });
};

export const MainLayout: FC = () => {
    const spaceRoomMatchRoute = useSpaceRoomMatchRoute();

    const style = {
        "--sidebar-width-icon": "4.5rem",
        "--sidebar-width":
            spaceRoomMatchRoute !== false ? "21rem" : "calc(var(--sidebar-width-icon) + 1px)"
    } as CSSProperties;

    return (
        <CallContextProvider>
            <SidebarProvider style={style}>
                <AppSidebar
                    activeSpaceId={
                        spaceRoomMatchRoute !== false ? spaceRoomMatchRoute.spaceId : undefined
                    }
                    activeRoomId={
                        spaceRoomMatchRoute !== false ? spaceRoomMatchRoute.roomId : undefined
                    }
                />
                <SidebarInset className="h-dvh overflow-hidden">
                    <Outlet />
                </SidebarInset>
            </SidebarProvider>
        </CallContextProvider>
    );
};
