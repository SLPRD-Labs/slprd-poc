import type { MatrixEvent } from "matrix-js-sdk";
import { EventType, RelationType } from "matrix-js-sdk";
import { useState } from "react";
import type { FC } from "react";
import { Button } from "../ui/button";
import { Pen, Trash } from "lucide-react";
import { useMatrixClientContext } from "@/contexts/matrix-client-context/matrix-client-context";

// Relation payload used by m.reaction events.
interface ReactionContent {
    "m.relates_to"?: {
        rel_type?: string;
        event_id?: string;
        key?: string;
    };
}

const collectReactionsByEmoji = (events: MatrixEvent[], targetEventId: string) => {
    const byEmoji = new Map<string, MatrixEvent[]>();

    for (const timelineEvent of events) {
        if (timelineEvent.getType() !== "m.reaction" || timelineEvent.isRedacted()) {
            continue;
        }

        const relatesTo =
            timelineEvent.getContent<ReactionContent>()["m.relates_to"];

        if (!relatesTo) {
            continue;
        }

        if (
            relatesTo.rel_type !== "m.annotation" ||
            relatesTo.event_id !== targetEventId ||
            typeof relatesTo.key !== "string" ||
            relatesTo.key.length === 0
        ) {
            continue;
        }

        const existing = byEmoji.get(relatesTo.key) ?? [];
        existing.push(timelineEvent);
        byEmoji.set(relatesTo.key, existing);
    }

    return byEmoji;
};

const MessageItem: FC<{ event: MatrixEvent }> = ({ event }) => {
    const { client } = useMatrixClientContext();
    const [hovered, setHovered] = useState(false);
    const [isReactionPending, setIsReactionPending] = useState(false);

    const getMessageReactions = () => {
        const roomId = event.getRoomId();
        const eventId = event.getId();
        if (!roomId || !eventId) return null;

        const room = client.getRoom(roomId);
        if (!room) return null;

        const timelineEvents = room.getLiveTimeline().getEvents();
        return collectReactionsByEmoji(timelineEvents, eventId);
    };

    const toggleReaction = async (emoji: string) => {
        const roomId = event.getRoomId();
        const eventId = event.getId();
        const userId = client.getUserId();

        if (!roomId || !eventId || !userId || isReactionPending) {
            return;
        }

        const reactionsByEmoji = getMessageReactions();
        const myReactionEvents = (reactionsByEmoji?.get(emoji) ?? []).filter(
            reactionEvent => reactionEvent.getSender() === userId
        );

        setIsReactionPending(true);

        try {
            if (myReactionEvents.length > 0) {
                const myReactionIds = myReactionEvents
                    .map(reactionEvent => reactionEvent.getId())
                    .filter((reactionId): reactionId is string => Boolean(reactionId));

                await Promise.all(
                    myReactionIds.map(reactionId => client.redactEvent(roomId, reactionId))
                );
            } else {
                await client.sendEvent(roomId, EventType.Reaction, {
                    "m.relates_to": {
                        rel_type: RelationType.Annotation,
                        event_id: eventId,
                        key: emoji
                    }
                });
            }
        } catch (error) {
            console.error("Erreur pendant l'appel Matrix :", error);
        } finally {
            setIsReactionPending(false);
        }
    };

    const renderReactions = () => {
        const reactionsByEmoji = getMessageReactions();
        if (!reactionsByEmoji || reactionsByEmoji.size === 0) return null;

        const userId = client.getUserId();
        const annotations = Array.from(reactionsByEmoji.entries()).sort((a, b) =>
            a[0].localeCompare(b[0])
        );

        return (
            <div className="mt-1 flex flex-wrap gap-1">
                {annotations.map(([emoji, reactionEvents]) => {
                    const count = reactionEvents.length;
                    if (count === 0) return null;

                    const hasMyReaction = reactionEvents.some(
                        reactionEvent => reactionEvent.getSender() === userId
                    );

                    return (
                        <button
                            key={emoji}
                            onClick={() => void toggleReaction(emoji)}
                            disabled={isReactionPending}
                            className={`flex items-center gap-1 rounded-full border px-1.5 py-0.5 text-xs transition-colors disabled:opacity-60 ${
                                hasMyReaction
                                    ? "border-purple-300 bg-purple-100 text-purple-800"
                                    : "border-gray-200 bg-gray-50 text-black hover:bg-gray-100"
                            }`}
                            aria-label={`${emoji}, ${String(count)} reaction${count === 1 ? "" : "s"}`}
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
                        disabled={isReactionPending}
                        onClick={() => void toggleReaction("❤️")}
                    >
                        <span className="text-xs">❤️</span>
                    </Button>
                    <Button
                        variant="ghost"
                        aria-label="React with 👍"
                        disabled={isReactionPending}
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
