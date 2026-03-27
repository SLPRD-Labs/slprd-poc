<<<<<<< HEAD
import { SidebarMenuAction, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";
import { Link } from "@tanstack/react-router";
<<<<<<< HEAD
import { Ellipsis, Hash, Volume2 } from "lucide-react";
=======
import { Hash, Volume2, Lock } from "lucide-react";
>>>>>>> 729b139 ((create-room) - Création des room terminée il reste la redirection (Noëllie))
import type { Room } from "matrix-js-sdk";
import { RoomEvent } from "matrix-js-sdk";
import type { FC } from "react";
import { useEffect, useState } from "react";
=======
import { Button } from "@/components/ui/button";
import { SidebarMenuAction, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";
import { Link } from "@tanstack/react-router";
import { Ellipsis, Hash, Volume2 } from "lucide-react";
import { RoomEvent, type Room } from "matrix-js-sdk";
import { useEffect, useState, type FC } from "react";
>>>>>>> 8a63d35 ((create-room) - Ajout dialog de modification et suppression)
import { EditRoomDialog } from "../dialogs/edit-room-dialog";
import { useMatrixClient } from "@/hooks/use-matrix-client";

interface Props {
    spaceId: string;
    room: Room;
    isActive?: boolean;
    isCall?: boolean;
}

export const NavRoom: FC<Props> = ({ spaceId, room, isActive, isCall }) => {
<<<<<<< HEAD
<<<<<<< HEAD
    const { client } = useMatrixClient();

    const [displayName, setDisplayName] = useState(room.name.trim() || room.roomId);
=======
    const { client } = useMatrixClient();

    const [displayName, setDisplayName] = useState(room.name?.trim() || room.roomId);
>>>>>>> 8a63d35 ((create-room) - Ajout dialog de modification et suppression)
    const [openEditRoom, setOpenEditRoom] = useState<boolean>(false);

    useEffect(() => {
        const onRoomName = (updatedRoom: Room) => {
            if (updatedRoom.roomId === room.roomId) {
<<<<<<< HEAD
                setDisplayName(updatedRoom.name.trim() || room.roomId);
=======
                setDisplayName(updatedRoom.name?.trim() || room.roomId);
>>>>>>> 8a63d35 ((create-room) - Ajout dialog de modification et suppression)
            }
        };

        client.on(RoomEvent.Name, onRoomName);
        return () => {
            client.off(RoomEvent.Name, onRoomName);
        };
    }, [client, room.roomId]);
<<<<<<< HEAD
=======
    const displayName = room.name?.trim() || room.roomId;
>>>>>>> 729b139 ((create-room) - Création des room terminée il reste la redirection (Noëllie))
=======
>>>>>>> 8a63d35 ((create-room) - Ajout dialog de modification et suppression)

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
<<<<<<< HEAD
                        {isCall ? <Volume2 /> : <Hash />}
=======
                        {isCall ? <Volume2 /> : <Hash /> } 
>>>>>>> 729b139 ((create-room) - Création des room terminée il reste la redirection (Noëllie))
                        <span>{displayName}</span>
                    </Link>
                }
            />
            <SidebarMenuAction
                showOnHover
<<<<<<< HEAD
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
=======
                className="hover:!bg-transparent hover:!text-sidebar-foreground"
                onClick={() => setOpenEditRoom(true)}
            >
                <Ellipsis />
            </SidebarMenuAction>
            <EditRoomDialog openEditRoom={openEditRoom} setOpenEditRoom={setOpenEditRoom} spaceId={spaceId} room={room} />    
>>>>>>> 8a63d35 ((create-room) - Ajout dialog de modification et suppression)
        </SidebarMenuItem>
    );
};
