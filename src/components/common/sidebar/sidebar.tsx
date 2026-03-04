import { RoomSidebar } from "@/components/common/sidebar/room-sidebar";
import { SpaceSidebar } from "@/components/common/sidebar/space-sidebar";
import { Sidebar } from "@/components/ui/sidebar";
import { useMatchRoute } from "@tanstack/react-router";
import type { ComponentProps, FC } from "react";

type Props = ComponentProps<typeof Sidebar>;

const useSpaceRoomMatchRoute = (): false | { spaceId: string; roomId?: string } => {
    "use no memo";

    const matchRoute = useMatchRoute();

    const spaceRoomMatchRoute = matchRoute({
        to: "/space/$spaceId/room/$roomId",
        fuzzy: true
    });

    if (spaceRoomMatchRoute !== false) {
        return spaceRoomMatchRoute;
    }

    return matchRoute({
        to: "/space/$spaceId",
        fuzzy: true
    });
};

export const AppSidebar: FC<Props> = props => {
    const spaceRoomMatchRoute = useSpaceRoomMatchRoute();

    return (
        <Sidebar
            collapsible="icon"
            className="overflow-hidden *:data-[sidebar=sidebar]:flex-row"
            {...props}
        >
            <SpaceSidebar
                activeSpaceId={
                    spaceRoomMatchRoute !== false ? spaceRoomMatchRoute.spaceId : undefined
                }
            />
            {spaceRoomMatchRoute !== false && (
                <RoomSidebar
                    spaceId={spaceRoomMatchRoute.spaceId}
                    activeRoomId={spaceRoomMatchRoute.roomId}
                />
            )}
        </Sidebar>
    );
};
