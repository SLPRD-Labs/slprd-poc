import { RoomSidebar } from "@/components/common/sidebar/room-sidebar";
import { SpaceSidebar } from "@/components/common/sidebar/space-sidebar";
import { Sidebar } from "@/components/ui/sidebar";
import type { ComponentProps, FC } from "react";

interface Props extends ComponentProps<typeof Sidebar> {
    activeSpaceId?: string;
    activeRoomId?: string;
}

export const AppSidebar: FC<Props> = ({ activeSpaceId, activeRoomId, ...props }) => {
    return (
        <Sidebar
            collapsible="icon"
            className="overflow-hidden *:data-[sidebar=sidebar]:flex-row"
            {...props}
        >
            <SpaceSidebar activeSpaceId={activeSpaceId} />
            {activeSpaceId !== undefined && (
                <RoomSidebar spaceId={activeSpaceId} activeRoomId={activeRoomId} />
            )}
        </Sidebar>
    );
};
