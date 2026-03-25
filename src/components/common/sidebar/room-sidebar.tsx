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
import { Plus } from "lucide-react";
import { useState  } from "react";
import type {FC} from "react";
import { CreateRoomDialog } from "../dialogs/create-room-dialog";

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
            <SidebarHeader className="border-b p-4 whitespace-nowrap">
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
                                    isCall={r.isElementVideoRoom() || r.isCallRoom()}
                                />
                            ))}
                    </SidebarGroupContent>
                    <Button size="sm" className="w-full border-t cursor-pointer border-none rounded-none bg-[#171717] my-2" onClick={() => { setOpenCreateRoom(true); }}>
                        <Plus />
                    </Button>
                    <CreateRoomDialog openCreateRoom={openCreateRoom} setOpenCreateRoom={setOpenCreateRoom} />
                </SidebarGroup>
            </SidebarContent>
        </Sidebar>
    );
};
