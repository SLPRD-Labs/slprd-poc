import { Header } from "@/components/common/header/header";
import { AppSidebar } from "@/components/common/sidebar/sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { CallContextProvider } from "@/contexts/call-context/call-context-provider";
import { MatrixClientContextProvider } from "@/contexts/matrix-client-context/matrix-client-context-provider";
import { Route } from "@/routes/_mainLayout";
import { Outlet } from "@tanstack/react-router";
import type { CSSProperties, FC } from "react";

export const MainLayout: FC = () => {
    const { session } = Route.useLoaderData();

    const style = {
        "--sidebar-width": "350px"
    } as CSSProperties;

    return (
        <MatrixClientContextProvider session={session}>
            <CallContextProvider>
                <SidebarProvider style={style}>
                    <AppSidebar />
                    <SidebarInset>
                        <Header />
                        <main className="flex grow flex-col">
                            <Outlet />
                        </main>
                    </SidebarInset>
                </SidebarProvider>
            </CallContextProvider>
        </MatrixClientContextProvider>
    );
};
