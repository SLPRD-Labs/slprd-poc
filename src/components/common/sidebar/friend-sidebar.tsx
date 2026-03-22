import { useState } from "react";
import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarHeader,
    SidebarMenu
} from "@/components/ui/sidebar";
import { CreateDMModal } from "@/components/common/sidebar/create-dm-dialog";
import { useMatrixClient } from "@/hooks/use-matrix-client";
import { ConversationCard } from "@/components/common/sidebar/conversation-card";
import { useDirectMessages } from "@/hooks/use-direct-messages";
import { useNavigate } from "@tanstack/react-router";

export const FriendSidebar = () => {
    const { client } = useMatrixClient();
    const navigate = useNavigate();

    const [activeRoomId, setActiveRoomId] = useState<string | null>(null);

    const navigateToDm = async (routeId: string) => {
        setActiveRoomId(routeId);
        await navigate({
            to: "/dm/$roomId",
            params: { roomId: routeId }
        });
    };


    const rooms = useDirectMessages(client);

    const sortedRooms = [...rooms].sort((a, b) => {
        const lastA = a.getLastLiveEvent()?.getTs() ?? 0;
        const lastB = b.getLastLiveEvent()?.getTs() ?? 0;
        return lastB - lastA;
    });

    return (
        <Sidebar collapsible="none" className="flex-1 border-r">
            <SidebarHeader className="flex flex-row items-center justify-between border-b p-4">
                <p className="text-sm font-semibold">Messages privés</p>
                <CreateDMModal />
            </SidebarHeader>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            <div className="space-y-1 p-2">
                                {sortedRooms.length > 0 ? (
                                    sortedRooms.map(room => (
                                        <ConversationCard
                                            key={room.roomId}
                                            room={room}
                                            isActive={room.roomId === activeRoomId}
                                            onClick={() => {void navigateToDm(room.roomId);}}
                                        />
                                    ))
                                ) : (
                                    <p className="text-muted-foreground p-4 text-center text-xs italic">
                                        Aucune conversation
                                    </p>
                                )}
                            </div>
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
        </Sidebar>
    );
};
