import { Header } from "@/components/common/header/header";
import { AppSidebar } from "@/components/common/sidebar/sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { CallContextProvider } from "@/contexts/call-context/call-context-provider";
import { Outlet } from "@tanstack/react-router";
import type { CSSProperties, FC } from "react";

export const MainLayout: FC = () => {
    const style = {
        "--sidebar-width": "350px"
    } as CSSProperties;

    return (
        <CallContextProvider>
            <SidebarProvider style={style}>
                <AppSidebar />
                <SidebarInset className="h-dvh overflow-hidden">
                    <Outlet />
                </SidebarInset>
            </SidebarProvider>
        </CallContextProvider>
    );
};
