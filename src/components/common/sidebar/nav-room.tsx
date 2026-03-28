import { SidebarMenuAction, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";
import { Link } from "@tanstack/react-router";
import { Ellipsis, Hash, Volume2 } from "lucide-react";
import type { Room } from "matrix-js-sdk";
import { RoomEvent } from "matrix-js-sdk";
import type { FC } from "react";
import { useEffect, useState } from "react";
import { EditRoomDialog } from "../dialogs/edit-room-dialog";
import { useMatrixClient } from "@/hooks/use-matrix-client";
import { useCallContext } from "@/contexts/call-context/call-context";

interface Props {
    spaceId: string;
    room: Room;
    isActive?: boolean;
    isCall?: boolean;
}

export const NavRoom: FC<Props> = ({ spaceId, room, isActive, isCall }) => {
    const call = useCallContext();
    
    const { client } = useMatrixClient();

    const [displayName, setDisplayName] = useState(room.name.trim() || room.roomId);
    const [openEditRoom, setOpenEditRoom] = useState<boolean>(false);
    const [pendingRoomId, setPendingRoomId] = useState<string | null>(null);

    useEffect(() => {
        const onRoomName = (updatedRoom: Room) => {
            if (updatedRoom.roomId === room.roomId) {
                setDisplayName(updatedRoom.name.trim() || room.roomId);
            }
        };

        if (call.state === "idle" && pendingRoomId) {
            call.join(pendingRoomId);
            setPendingRoomId(null);
        }

        client.on(RoomEvent.Name, onRoomName);
        return () => {
            client.off(RoomEvent.Name, onRoomName);
        };
    }, [client, room.roomId, call.state, pendingRoomId]);

    return (
        <SidebarMenuItem className="flex flex-row items-center justify-between">
            <SidebarMenuButton
                className="hover:bg-sidebar-accent hover:text-sidebar-accent-foreground text-sm whitespace-nowrap"
                isActive={isActive}
                render={
                    <Link
                        to="/space/$spaceId/room/$roomId"
                        params={{ spaceId: spaceId, roomId: room.roomId }}
                        onClick={async () => {
                            if (!isCall) return;

                            if (call.state === "active") {
                                if (call.room.roomId === room.roomId) return;

                                setPendingRoomId(room.roomId);
                                await call.leave();
                            }

                            if (call.state === "idle") {
                                await call.join(room.roomId);
                            }
                        }}
                    >
                        {isCall ? <Volume2 /> : <Hash />}
                        <span>{displayName}</span>
                    </Link>
                }
            />
            <SidebarMenuAction
                showOnHover
                className="hover:!text-sidebar-foreground hover:!bg-transparent"
                onClick={() => {
                    setOpenEditRoom(true);
                }}
            >
                <Ellipsis />
            </SidebarMenuAction>
            <EditRoomDialog
                openEditRoom={openEditRoom}
                setOpenEditRoom={setOpenEditRoom}
                spaceId={spaceId}
                room={room}
            />
        </SidebarMenuItem>
    );
};