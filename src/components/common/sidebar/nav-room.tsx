import { SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";
import { Link } from "@tanstack/react-router";
import type { Room } from "matrix-js-sdk";
import type { FC } from "react";

interface Props {
    spaceId: string;
    room: Room;
    isActive?: boolean;
}

export const NavRoom: FC<Props> = ({ spaceId, room, isActive }) => {
    return (
        <SidebarMenuItem>
            <SidebarMenuButton
                className="hover:bg-sidebar-accent hover:text-sidebar-accent-foreground flex flex-col items-start gap-2 text-sm leading-tight whitespace-nowrap"
                isActive={isActive}
                render={
                    <Link
                        to="/space/$spaceId/room/$roomId"
                        params={{ spaceId: spaceId, roomId: room.roomId }}
                    >
                        {room.name}
                    </Link>
                }
            />
        </SidebarMenuItem>
    );
};
