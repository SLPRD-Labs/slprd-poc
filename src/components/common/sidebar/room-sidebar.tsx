import { NavRoom } from "@/components/common/sidebar/nav-room";
import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarHeader
} from "@/components/ui/sidebar";
import { useMatrixClient } from "@/hooks/use-matrix-client";
import { spaceService } from "@/services/matrix/space";
import { useQuery } from "@tanstack/react-query";
import type { FC } from "react";

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
        <Sidebar collapsible="none" className="hidden flex-1 md:flex">
            <SidebarHeader className="gap-3.5 border-b p-4">
                {spaceQuery.isSuccess && spaceQuery.data?.name}
            </SidebarHeader>
            <SidebarContent>
                <SidebarGroup className="px-0">
                    <SidebarGroupContent>
                        {roomsQuery.isSuccess &&
                            roomsQuery.data.map(r => (
                                <NavRoom
                                    key={r.roomId}
                                    spaceId={spaceId}
                                    room={r}
                                    isActive={activeRoomId === r.roomId}
                                />
                            ))}
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
        </Sidebar>
    );
};
