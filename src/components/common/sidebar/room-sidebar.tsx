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
            <SidebarHeader className="border-b p-4 flex flex-row items-center justify-between">
                <span>{spaceQuery.isSuccess && spaceQuery.data?.name}</span>
                <Button size="sm" className="cursor-pointer border-none rounded-none bg-[#171717]" onClick={() => { setOpenCreateRoom(true); }}>
                    <Plus />
                </Button>
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
                    <CreateRoomDialog openCreateRoom={openCreateRoom} setOpenCreateRoom={setOpenCreateRoom} spaceId={spaceId} />
                </SidebarGroup>
            </SidebarContent>
        </Sidebar>
    );
};
