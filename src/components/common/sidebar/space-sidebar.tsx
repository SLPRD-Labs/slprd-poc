import { NavSpace } from "@/components/common/sidebar/nav-space";
import { NavUser } from "@/components/common/sidebar/nav-user";
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem
} from "@/components/ui/sidebar";
import { useMatrixClient } from "@/hooks/use-matrix-client";
import { spaceService } from "@/services/matrix/space";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { Command } from "lucide-react";
import type { FC } from "react";

interface Props {
    activeSpaceId?: string;
}

export const SpaceSidebar: FC<Props> = ({ activeSpaceId }) => {
    const { client, ready } = useMatrixClient();

    const spacesQuery = useQuery({
        queryKey: ["spaces", "root", "invited"],
        queryFn: () => spaceService.getRootAndInvitedSpaces(client),
        staleTime: Infinity,
        enabled: ready
    });

    return (
        <Sidebar collapsible="none" className="w-[calc(var(--sidebar-width-icon)+1px)]! border-r">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            size="lg"
                            className="h-8 p-0"
                            render={
                                <Link to="/">
                                    <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                                        <Command className="size-4" />
                                    </div>
                                    <div className="grid flex-1 text-left text-sm leading-tight">
                                        <span className="truncate font-medium">SLPRD POC</span>
                                    </div>
                                </Link>
                            }
                        />
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupContent>
                        <SidebarMenu className="gap-1">
                            {spacesQuery.isSuccess &&
                                spacesQuery.data.rootSpaces.map(s => (
                                    <NavSpace
                                        key={s.roomId}
                                        space={s}
                                        isActive={activeSpaceId === s.roomId}
                                    />
                                ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
};
