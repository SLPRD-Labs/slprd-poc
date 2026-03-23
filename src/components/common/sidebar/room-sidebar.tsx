import { NavRoom } from "@/components/common/sidebar/nav-room";
import { Button } from "@/components/ui/button";
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
import { CreateRoomDialog } from "../dialogs/create-room-dialog";
import { SpaceInviteDialog } from "@/components/common/sidebar/space-invite-dialog";

interface Props {
    spaceId: string;
    activeRoomId?: string;
}

export const RoomSidebar: FC<Props> = ({ spaceId, activeRoomId }) => {
    const { client, ready } = useMatrixClient();
    const [openCreateRoom, setOpenCreateRoom] = useState(false);

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
            <SidebarHeader className="flex flex-row items-center justify-between border-b p-4 whitespace-nowrap">
                <span className="truncate font-semibold">
                    {spaceQuery.isSuccess && spaceQuery.data?.name}
                </span>
                <div className="flex">
                    <SpaceInviteDialog spaceId={spaceId} />
                    <CreateRoomDialog spaceId={spaceId} />
                </div>
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
                                    isCall={r.isElementVideoRoom() || r.isCallRoom()}
                                />
                            ))}
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
        </Sidebar>
    );
};
