import { SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Link } from "@tanstack/react-router";
import { Mail } from "lucide-react";
import type { Room } from "matrix-js-sdk";
import type { FC } from "react";

interface Props {
    room: Room;
}

export const NavSpace: FC<Props> = ({ room }) => {
    return (
        <Tooltip>
            <TooltipTrigger
                render={
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            className="px-2.5 md:px-2"
                            isActive
                            render={
                                <Link to="/space/$spaceId" params={{ spaceId: room.roomId }}>
                                    <Mail />
                                    <span>{room.name}</span>
                                </Link>
                            }
                        />
                    </SidebarMenuItem>
                }
            />
            <TooltipContent side="right" align="center">
                {room.name}
            </TooltipContent>
        </Tooltip>
    );
};
