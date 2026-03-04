import { NavRoom } from "@/components/common/sidebar/nav-room";
import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarHeader,
    SidebarInput
} from "@/components/ui/sidebar";
import { useMatrixClientContext } from "@/contexts/matrix-client-context/matrix-client-context";
import { spaceService } from "@/services/matrix/space";
import { useQuery } from "@tanstack/react-query";
import type { FC } from "react";

interface Props {
    spaceId: string;
    activeRoomId?: string;
}

export const RoomSidebar: FC<Props> = ({ spaceId, activeRoomId }) => {
    const { client, ready } = useMatrixClientContext();

    const roomsQuery = useQuery({
        queryKey: ["space", spaceId, "rooms"],
        queryFn: () => spaceService.getRoomsBySpaceId(client, spaceId),
        staleTime: Infinity,
        enabled: ready
    });

    return (
        <Sidebar collapsible="none" className="hidden flex-1 md:flex">
            <SidebarHeader className="gap-3.5 border-b p-4">
                <SidebarInput placeholder="Type to search..." />
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
