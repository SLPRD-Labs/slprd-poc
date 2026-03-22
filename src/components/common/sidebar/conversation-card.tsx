import type { Room } from "matrix-js-sdk";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useMatrixClient } from "@/hooks/use-matrix-client";
import { usePresence } from "@/hooks/use-presence";

interface ConversationCardProps {
    room: Room;
    isActive?: boolean;
    onClick: () => void;
}

export function ConversationCard({ room, isActive, onClick }: ConversationCardProps) {
    const { client } = useMatrixClient();
    const presenceMap = usePresence(client);

    const otherMember = room.getMembers().find(m => m.userId !== client.getUserId());
    const otherUserId = otherMember?.userId;

    const userPresence = otherUserId ? presenceMap[otherUserId] : undefined;
    const userStatus = userPresence?.status ?? "offline";

    return (
        <button
            onClick={onClick}
            className={`flex w-full items-center gap-3 rounded-md px-2 py-2 text-left transition-colors hover:bg-accent/60 ${
                isActive ? "bg-accent" : ""
            }`}
        >
            <div className="relative shrink-0">
                <Avatar>
                    <AvatarImage
                        src={room.getAvatarUrl(client.getHomeserverUrl(), 40, 40, "scale") ?? ""}
                    />
                    <AvatarFallback>{room.name[0]}</AvatarFallback>
                </Avatar>

                <div
                    className={`absolute -right-0.5 -bottom-0.5 h-3 w-3 rounded-full border-2 border-background ${
                        userStatus === "online"
                            ? "bg-green-500"
                            : userStatus === "unavailable"
                              ? "bg-red-500"
                              : "bg-slate-300"
                    }`}
                />
            </div>

            <div className="flex min-w-0 flex-1 items-start justify-center overflow-hidden">
                <span className="w-full truncate text-sm font-medium">{room.name}</span>
            </div>
        </button>
    );
}
