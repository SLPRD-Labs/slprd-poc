import { NavRoom } from "@/components/common/sidebar/nav-room";
import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarHeader,
    SidebarMenu
} from "@/components/ui/sidebar";
import { useMatrixClient } from "@/hooks/use-matrix-client";
import { spaceService } from "@/services/matrix/space";
import { useQuery } from "@tanstack/react-query";
import type { FC } from "react";
import { SpaceInviteDialog } from "@/components/common/sidebar/space-invite-dialog";

interface Props {
    spaceId: string;
    activeRoomId?: string;
}

export const RoomSidebar: FC<Props> = ({ spaceId, activeRoomId }) => {
    const { client, ready } = useMatrixClient();

    const spaceQuery = useQuery({
        queryKey: ["space", spaceId],
        queryFn: () => client.getRoom(spaceId),
        staleTime: Infinity,
        enabled: ready
    });

    const roomsQuery = useQuery({
        queryKey: ["space", spaceId, "rooms"],
        queryFn: () => spaceService.getRoomsBySpaceId(client, spaceId),
        staleTime: Infinity,
        enabled: ready
    });

    return (
        <Sidebar collapsible="none" className="flex-1">
            <SidebarHeader className="flex-row items-center justify-between border-b p-4 whitespace-nowrap">
                <span className="truncate font-semibold">
                    {spaceQuery.isSuccess && spaceQuery.data?.name}
                </span>

                <SpaceInviteDialog spaceId={spaceId} />
            </SidebarHeader>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupContent>
                        <SidebarMenu className="gap-1">
                            {roomsQuery.isSuccess &&
                                roomsQuery.data.map(r => (
                                    <NavRoom
                                        key={r.roomId}
                                        spaceId={spaceId}
                                        room={r}
                                        isActive={activeRoomId === r.roomId}
                                    />
                                ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
        </Sidebar>
    );
};
