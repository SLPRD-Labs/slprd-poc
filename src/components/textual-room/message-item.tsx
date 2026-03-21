import type { MatrixEvent } from "matrix-js-sdk";
import { useState } from "react";
import type { FC } from "react";
import { Button } from "../ui/button";
import { Pen, Trash } from "lucide-react";
import { useMatrixClientContext } from "@/contexts/matrix-client-context/matrix-client-context";

const MessageItem: FC<{ event: MatrixEvent }> = ({ event }) => {
    const { client } = useMatrixClientContext();
    const [hovered, setHovered] = useState(false);

    const toggleReaction = async (emoji: string) => {
        const roomId = event.getRoomId();
        const eventId = event.getId();
        if (!roomId || !eventId) {
            console.error("❌ RoomId ou EventId manquant");
            return;
        }

        const room = client.getRoom(roomId);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment
        const relationsContainer = (room as any)?.relations;

        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
        const relations = relationsContainer?.getChildEventsForEvent(
            eventId,
            "m.annotation",
            "m.reaction"
        );

        const userId = client.getUserId();
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
        const myReactionEvent = (relations?.getRelations() as MatrixEvent[] | undefined)?.find(
            r => r.getSender() === userId && r.getContent()["m.relates_to"]?.key === emoji
        );

        try {
            if (myReactionEvent) {
                const reactionId = myReactionEvent.getId();
                if (reactionId) {
                    await client.redactEvent(roomId, reactionId);
                }
            } else {
                const content = {
                    "m.relates_to": {
                        rel_type: "m.annotation",
                        event_id: eventId,
                        key: emoji
                    }
                };
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                await client.sendEvent(roomId, "m.reaction" as any, content);
            }
        } catch (error) {
            console.error("❌ Erreur pendant l'appel Matrix :", error);
        }
    };

    const renderReactions = () => {
        const roomId = event.getRoomId();
        const eventId = event.getId();
        if (!roomId || !eventId) return null;
        const room = client.getRoom(roomId);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment
        const relationsContainer = (room as any)?.relations;
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
        const relations = relationsContainer?.getChildEventsForEvent(
            eventId,
            "m.annotation",
            "m.reaction"
        );

        if (!relations) {
            console.log("Render: Pas de relations");
            return null;
        }

        // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
        const annotations = relations.getSortedAnnotationsByKey() as
            | [string, Set<MatrixEvent>][]
            | undefined;

        if (!annotations) return null;

        return (
            <div className="mt-1 flex flex-wrap gap-1">
                {annotations.map(([emoji, eventsSet]) => {
                    const count = eventsSet.size;
                    if (count === 0) return null;

                    const hasMyReaction = Array.from(eventsSet).some(
                        ev => ev.getSender() === client.getUserId()
                    );

                    return (
                        <button
                            key={emoji}
                            onClick={() => void toggleReaction(emoji)}
                            className={`flex items-center gap-1 rounded-full border px-1.5 py-0.5 text-xs transition-colors ${
                                hasMyReaction
                                    ? "border-purple-300 bg-purple-100 text-purple-800"
                                    : "border-gray-200 bg-gray-50 text-black hover:bg-gray-100"
                            }`}
                            aria-label={`${emoji}, ${count} reaction${count === 1 ? "" : "s"}`}
                        >
                            <span>{emoji}</span>
                            <span className="font-bold">{count}</span>
                        </button>
                    );
                })}
            </div>
        );
    };

    return (
        <div
            className="group relative flex flex-col rounded px-4 py-1 hover:bg-gray-50"
            onMouseEnter={() => {
                setHovered(true);
            }}
            onMouseLeave={() => {
                setHovered(false);
            }}
        >
            {hovered && (
                <div className="absolute -top-3 right-4 z-10 flex items-center gap-1 rounded-md border bg-white px-1 py-0.5 shadow-sm">
                    <Button variant="ghost" disabled title="Remove">
                        <Trash size={16} />
                    </Button>
                    <Button variant="ghost" disabled title="Edit">
                        <Pen size={16} />
                    </Button>
                    <span className="text-gray-300">|</span>
                    <Button
                        variant="ghost"
                        aria-label="React with ❤️"
                        onClick={() => void toggleReaction("❤️")}
                    >
                        <span className="text-xs">❤️</span>
                    </Button>
                    <Button
                        variant="ghost"
                        aria-label="React with 👍"
                        onClick={() => void toggleReaction("👍")}
                    >
                        <span className="text-xs">👍</span>
                    </Button>
                </div>
            )}

            <div className="flex items-baseline gap-2">
                <span className="text-sm font-medium text-purple-800">
                    {event.sender?.name ?? event.getSender()}
                </span>
                <span className="text-muted-foreground text-xs">
                    {new Date(event.getTs()).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit"
                    })}
                </span>
            </div>
            <span className="text-sm wrap-break-word whitespace-pre-wrap">
                {event.getContent().body as string}
            </span>
            {renderReactions()}
        </div>
    );
};

export default MessageItem;
