import { useMatrixClient } from "@/hooks/use-matrix-client";
import { eventService } from "@/services/matrix/event";
import type { MatrixEvent } from "matrix-js-sdk";
import { useEffect, useState } from "react";

interface Props {
    roomId: string;
    replyEventId: string;
    onJumpToEvent?: (eventId: string) => void;
}

export const ReplyPreview = ({ roomId, replyEventId, onJumpToEvent }: Props) => {
    const { client } = useMatrixClient();
    const [event, setEvent] = useState<MatrixEvent | null>(null);
    const [hoveredReply, setHoveredReply] = useState(false);

    useEffect(() => {
        const load = async () => {
            const found = await eventService.getEventById(client, roomId, replyEventId);
            setEvent(found);
        };

        void load();
    }, [client, roomId, replyEventId]);

    if (!event) return null;

    const senderId = event.getSender() ?? "";
    const senderName =
        (event.sender?.name ?? client.getRoom(roomId)?.getMember(senderId)?.name ?? senderId) ||
        "Utilisateur";

    return (
        <button
            type="button"
            onClick={() => onJumpToEvent?.(replyEventId)}
            className="text-muted-foreground/40 hover:text-muted-foreground mb-1 flex w-full items-start gap-2 text-left hover:cursor-pointer"
            onPointerEnter={() => setHoveredReply(true)}
            onPointerLeave={() => setHoveredReply(false)}
        >
            <div
                className={`mt-1 h-3 w-6 shrink-0 rounded-tl-md border-t-2 border-l-2 ${
                    hoveredReply ? "border-muted-foreground" : "border-muted-foreground/40"
                }`}
            />
            <div className="min-w-0 flex-1 text-xs">
                <span className="text-foreground font-medium">@{senderName}</span>
                <span className="ml-2 truncate">{String(event.getContent()?.body ?? "")}</span>
            </div>
        </button>
    );
};
