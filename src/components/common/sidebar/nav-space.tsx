import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Link } from "@tanstack/react-router";
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
                            className="p-0"
                            isActive
                            render={
                                <Link to="/space/$spaceId" params={{ spaceId: room.roomId }}>
                                    <Avatar className="rounded-md after:rounded-md">
                                        <AvatarImage
                                            src="https://github.com/shadcn.png"
                                            alt="@shadcn"
                                            className="rounded-md grayscale"
                                        />
                                        <AvatarFallback className="rounded-md">
                                            {room.name.charAt(0).toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
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
