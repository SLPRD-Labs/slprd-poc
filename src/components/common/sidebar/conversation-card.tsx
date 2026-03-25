import type { Room } from "matrix-js-sdk";
import { useMatrixClient } from "@/hooks/use-matrix-client";
import { usePresence } from "@/hooks/use-presence";
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";
import type { MouseEvent } from "react";
import { RoomAvatar } from "@/components/common/avatar/room-avatar";

interface ConversationCardProps {
    room: Room;
    isActive?: boolean;
    onClick: () => void;
}

export function ConversationCard({ room, isActive, onClick }: ConversationCardProps) {
    const { client } = useMatrixClient();
    const presenceMap = usePresence(client);

    const membership = room.getMyMembership();
    const isInvite = membership === "invite";

    const otherMember = room.getMembers().find(m => m.userId !== client.getUserId());
    const otherUserId = otherMember?.userId;
    const userPresence = otherUserId ? presenceMap[otherUserId] : undefined;
    const userStatus = userPresence?.status ?? "offline";

    const handleAccept = async (e: MouseEvent) => {
        e.stopPropagation();
        try {
            await client.joinRoom(room.roomId);
        } catch (err) {
            console.error("Erreur acceptation:", err);
        }
    };

    const handleReject = async (e: MouseEvent) => {
        e.stopPropagation();
        try {
            await client.leave(room.roomId);
        } catch (err) {
            console.error("Erreur refus:", err);
        }
    };

    return (
        <div
            onClick={isInvite ? undefined : onClick}
            className={`flex w-full items-center gap-3 rounded-md px-2 py-2 text-left transition-colors ${
                isInvite
                    ? "border-accent bg-background cursor-default border"
                    : "hover:bg-accent/60 cursor-pointer"
            } ${isActive ? "bg-accent" : ""}`}
        >
            <div className="relative shrink-0">
                <RoomAvatar room={room} isRound={true} />

                {!isInvite && (
                    <div
                        className={`border-background absolute -right-0.5 -bottom-0.5 h-3 w-3 rounded-full border-2 ${
                            userStatus === "online"
                                ? "bg-green-500"
                                : userStatus === "unavailable"
                                  ? "bg-red-500"
                                  : "bg-slate-300"
                        }`}
                    />
                )}
            </div>

            <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
                <span className={`truncate text-sm font-medium`}>{room.name}</span>

                {isInvite && (
                    <span className="text-[10px] font-semibold tracking-wider text-purple-500 uppercase">
                        Invitation
                    </span>
                )}
            </div>

            {isInvite ? (
                <div className="flex shrink-0 gap-1">
                    <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7 rounded-full bg-green-100 text-green-700 hover:bg-green-200 hover:text-green-800"
                        onClick={e => void handleAccept(e)}
                    >
                        <Check className="h-4 w-4" />
                    </Button>
                    <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7 rounded-full bg-red-100 text-red-700 hover:bg-red-200 hover:text-red-800"
                        onClick={e => void handleReject(e)}
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </div>
            ) : null}
        </div>
    );
}
