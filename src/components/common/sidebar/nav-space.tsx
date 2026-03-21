import { RoomAvatar } from "@/components/common/avatar/room-avatar";
import { SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Link } from "@tanstack/react-router";
import type { Room } from "matrix-js-sdk";
import type { FC } from "react";

interface Props {
    space: Room;
    isActive?: boolean;
}

export const NavSpace: FC<Props> = ({ space, isActive }) => {
    return (
        <Tooltip>
            <TooltipTrigger
                render={
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            className="aspect-square size-full rounded-xl p-0"
                            isActive={isActive}
                            render={
                                <Link to="/space/$spaceId" params={{ spaceId: space.roomId }}>
                                    <RoomAvatar room={space} />
                                </Link>
                            }
                        />
                    </SidebarMenuItem>
                }
            />
            <TooltipContent side="right" align="center">
                {space.name}
            </TooltipContent>
        </Tooltip>
    );
};
