import { SidebarMenuAction, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";
import { Link } from "@tanstack/react-router";
import { Ellipsis, Hash, Volume2 } from "lucide-react";
import { RoomEvent, type Room } from "matrix-js-sdk";
import { useEffect, useState, type FC } from "react";
import { EditRoomDialog } from "../dialogs/edit-room-dialog";
import { useMatrixClient } from "@/hooks/use-matrix-client";

interface Props {
    spaceId: string;
    room: Room;
    isActive?: boolean;
    isCall?: boolean;
}

export const NavRoom: FC<Props> = ({ spaceId, room, isActive, isCall }) => {
    const { client } = useMatrixClient();

    const [displayName, setDisplayName] = useState(room.name?.trim() || room.roomId);
    const [openEditRoom, setOpenEditRoom] = useState<boolean>(false);

    useEffect(() => {
        const onRoomName = (updatedRoom: Room) => {
            if (updatedRoom.roomId === room.roomId) {
                setDisplayName(updatedRoom.name?.trim() || room.roomId);
            }
        };

        client.on(RoomEvent.Name, onRoomName);
        return () => {
            client.off(RoomEvent.Name, onRoomName);
        };
    }, [client, room.roomId]);

    return (
        <SidebarMenuItem className="flex flex-row items-center justify-between">
            <SidebarMenuButton
                className="hover:bg-sidebar-accent hover:text-sidebar-accent-foreground text-sm whitespace-nowrap"
                isActive={isActive}
                render={
                    <Link
                        to="/space/$spaceId/room/$roomId"
                        params={{ spaceId: spaceId, roomId: room.roomId }}
                    >
                        {isCall ? <Volume2 /> : <Hash /> } 
                        <span>{displayName}</span>
                    </Link>
                }
            />
            <SidebarMenuAction
                showOnHover
                className="hover:!bg-transparent hover:!text-sidebar-foreground"
                onClick={() => setOpenEditRoom(true)}
            >
                <Ellipsis />
            </SidebarMenuAction>
            <EditRoomDialog openEditRoom={openEditRoom} setOpenEditRoom={setOpenEditRoom} spaceId={spaceId} room={room} />    
        </SidebarMenuItem>
    );
};
