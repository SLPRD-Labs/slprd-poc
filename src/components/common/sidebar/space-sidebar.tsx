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
    SidebarMenuItem,
    SidebarSeparator
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
        <Sidebar
            collapsible="none"
            className="w-[calc(var(--sidebar-width-icon)+1px)]! border-r p-1.5"
        >
            <SidebarHeader className="m-1 p-1">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            size="lg"
                            className="aspect-square size-full rounded-xl p-0"
                            render={
                                <Link to="/">
                                    <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-full items-center justify-center rounded-xl">
                                        <Command className="size-4" />
                                    </div>
                                </Link>
                            }
                        />
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>
            <SidebarSeparator className="mx-3.5 data-horizontal:w-auto" />
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupContent>
                        <SidebarMenu className="gap-2">
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
