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
import { useQuery } from "@tanstack/react-query";
import { Command, Mail } from "lucide-react";
import { Direction, EventType } from "matrix-js-sdk";
import type { ComponentProps, FC } from "react";

type Props = ComponentProps<typeof Sidebar>;

export const AppSidebar: FC<Props> = props => {
    const { client, ready } = useMatrixClientContext();

    const roomQuery = useQuery({
        queryKey: ["spaces"],
        queryFn: () => client.getRooms().filter(r => r.isSpaceRoom()),
        enabled: ready
    });

    console.log(client.getRooms().filter(r => r.name.includes("Home")));
    console.log(
        client
            .getRooms()
            .find(r => r.name.includes("in public"))
            ?.getLiveTimeline()
            .getState(Direction.Forward)
            ?.getStateEvents(EventType.SpaceParent)
    );

    return (
        <Sidebar
            collapsible="icon"
            className="overflow-hidden *:data-[sidebar=sidebar]:flex-row"
            {...props}
        >
            {/* This is the first sidebar */}
            {/* We disable collapsible and adjust width to icon. */}
            {/* This will make the sidebar appear as icons. */}
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
                                    // eslint-disable-next-line jsx-a11y/anchor-is-valid
                                    <a href="#">
                                        <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                                            <Command className="size-4" />
                                        </div>
                                        <div className="grid flex-1 text-left text-sm leading-tight">
                                            <span className="truncate font-medium">Acme Inc</span>
                                            <span className="truncate text-xs">Enterprise</span>
                                        </div>
                                    </a>
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
                                    roomQuery.data.map(room => (
                                        <SidebarMenuItem key={room.roomId}>
                                            <SidebarMenuButton
                                                tooltip={{
                                                    children: room.name,
                                                    hidden: false
                                                }}
                                                className="px-2.5 md:px-2"
                                                isActive
                                            >
                                                <Mail />
                                                <span>{room.name}</span>
                                            </SidebarMenuButton>
                                        </SidebarMenuItem>
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
            {/* This is the second sidebar */}
            {/* We disable collapsible and let it fill remaining space */}
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
