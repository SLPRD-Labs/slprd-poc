import { SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";
import { Link } from "@tanstack/react-router";
import { Hash, Volume2, Lock } from "lucide-react";
import type { Room } from "matrix-js-sdk";
import type { FC } from "react";

interface Props {
    spaceId: string;
    room: Room;
    isActive?: boolean;
    isCall?: boolean;
}

export const NavRoom: FC<Props> = ({ spaceId, room, isActive, isCall }) => {
    const displayName = room.name?.trim() || room.roomId;

    return (
        <SidebarMenuItem>
            <SidebarMenuButton
                className="hover:bg-sidebar-accent hover:text-sidebar-accent-foreground text-sm whitespace-nowrap"
                isActive={isActive}
                render={
                    <Link //TODO : Diriger vers callRoom
                        to="/space/$spaceId/room/$roomId"
                        params={{ spaceId: spaceId, roomId: room.roomId }}
                    >
                        {isCall ? <Volume2 /> : <Hash /> } 
                        <span>{displayName}</span>
                    </Link>
                }
            />
        </SidebarMenuItem>
    );
};
