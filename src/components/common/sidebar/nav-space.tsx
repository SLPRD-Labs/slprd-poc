import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useRoomAvatarUrl } from "@/hooks/use-room-avatar-url";
import { Link } from "@tanstack/react-router";
import type { Room } from "matrix-js-sdk";
import type { FC } from "react";

interface Props {
    space: Room;
}

export const NavSpace: FC<Props> = ({ space }) => {
    const avatarUrl = useRoomAvatarUrl(space);

    return (
        <Tooltip>
            <TooltipTrigger
                render={
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            className="p-0"
                            isActive
                            render={
                                <Link to="/space/$spaceId" params={{ spaceId: space.roomId }}>
                                    <Avatar className="rounded-md after:rounded-md">
                                        <AvatarImage
                                            src={avatarUrl ?? undefined}
                                            alt={space.name}
                                            className="rounded-md grayscale"
                                        />
                                        {avatarUrl !== undefined && (
                                            <AvatarFallback className="rounded-md">
                                                {space.name.charAt(0).toUpperCase()}
                                            </AvatarFallback>
                                        )}
                                    </Avatar>
                                    <span>{space.name}</span>
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
