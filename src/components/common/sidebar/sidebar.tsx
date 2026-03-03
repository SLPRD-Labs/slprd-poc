import { NavSpace } from "@/components/common/sidebar/nav-space";
import { NavUser } from "@/components/common/sidebar/nav-user";
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarHeader,
    SidebarInput,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem
} from "@/components/ui/sidebar";
import { useMatrixClientContext } from "@/contexts/matrix-client-context/matrix-client-context";
import { spaceService } from "@/services/matrix/space";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { Command } from "lucide-react";
import type { ComponentProps, FC } from "react";

type Props = ComponentProps<typeof Sidebar>;

export const AppSidebar: FC<Props> = props => {
    const { client, ready } = useMatrixClientContext();

    const roomQuery = useQuery({
        queryKey: ["spaces", "root", "invited"],
        queryFn: () => spaceService.getRootAndInvitedSpaces(client),
        staleTime: Infinity,
        enabled: ready
    });

    return (
        <Sidebar
            collapsible="icon"
            className="overflow-hidden *:data-[sidebar=sidebar]:flex-row"
            {...props}
        >
            <Sidebar
                collapsible="none"
                className="w-[calc(var(--sidebar-width-icon)+1px)]! border-r"
            >
                <SidebarHeader>
                    <SidebarMenu>
                        <SidebarMenuItem>
                            <SidebarMenuButton
                                size="lg"
                                className="md:h-8 md:p-0"
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
                        <SidebarGroupContent className="px-1.5 md:px-0">
                            <SidebarMenu className="gap-1">
                                {roomQuery.isSuccess &&
                                    roomQuery.data.rootSpaces.map(room => (
                                        <NavSpace key={room.roomId} room={room} />
                                    ))}
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                </SidebarContent>
                <SidebarFooter>
                    <NavUser
                        user={{
                            name: "shadcn",
                            email: "m@example.com",
                            avatar: "https://ui.shadcn.com/avatars/shadcn.jpg"
                        }}
                    />
                </SidebarFooter>
            </Sidebar>
            <Sidebar collapsible="none" className="hidden flex-1 md:flex">
                <SidebarHeader className="gap-3.5 border-b p-4">
                    <SidebarInput placeholder="Type to search..." />
                </SidebarHeader>
                <SidebarContent>
                    <SidebarGroup className="px-0">
                        <SidebarGroupContent>
                            {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
                            <a
                                href="#"
                                className="hover:bg-sidebar-accent hover:text-sidebar-accent-foreground flex flex-col items-start gap-2 border-b p-4 text-sm leading-tight whitespace-nowrap last:border-b-0"
                            >
                                <div className="flex w-full items-center gap-2">
                                    <span>Mail</span> <span className="ml-auto text-xs">Ajd</span>
                                </div>
                                <span className="font-medium">Subject</span>
                                <span className="line-clamp-2 w-[260px] text-xs whitespace-break-spaces">
                                    Teaser
                                </span>
                            </a>
                        </SidebarGroupContent>
                    </SidebarGroup>
                </SidebarContent>
            </Sidebar>
        </Sidebar>
    );
};
