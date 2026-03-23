import { useMatrixClient } from "@/hooks/use-matrix-client";
import { Pen, Trash } from "lucide-react";
import { MatrixEventEvent, MsgType, RelationType, EventType, type MatrixEvent } from "matrix-js-sdk";
import type { FC } from "react";
import { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";

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

        const relatesTo = timelineEvent.getContent<ReactionContent>()["m.relates_to"];

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

const MessageItem: FC<{ event: MatrixEvent, roomId: string }> = ({ event, roomId }) => {
    const { client } = useMatrixClient();
    const currentUser = client.getUserId();
    const userSender = event.getSender();
    const isSender = userSender === currentUser;
    const isEdited = !!event.replacingEvent();
    const [replacingEvent, setReplacingEvent] = useState(event.replacingEvent());
    const [isEditing, setIsEditing] = useState(false);
    const [isRedacted, setIsRedacted] = useState(event.isRedacted());
    const isRemoved = isRedacted || replacingEvent?.isRedacted();
    const currentMessage = replacingEvent?.getContent()["m.new_content"]?.body ?? event.getContent().body;
    const [editedContent, setEditedContent] = useState(currentMessage);
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

    useEffect(() => {
        const onReplaced = () => {
            setReplacingEvent(event.replacingEvent());
        };
        event.on(MatrixEventEvent.Replaced, onReplaced);
        return () => {
            event.off(MatrixEventEvent.Replaced, onReplaced);
        };
    }, [event]);

    useEffect(() => {
        const onRedacted = (_event: MatrixEvent, _redactionEvent: MatrixEvent) => {
            setIsRedacted(true);
        };
        event.on(MatrixEventEvent.BeforeRedaction, onRedacted);
        return () => {
            event.off(MatrixEventEvent.BeforeRedaction, onRedacted);
        };
    }, [event]);

    const handleEdit = () => {
        setIsEditing(true);
    }

    const handleSave = async () => {
        const messageToSend = editedContent.trim();
        await client.sendMessage(roomId, null, {
            msgtype: MsgType.Text,
            body: `*${messageToSend}`,
            "m.new_content": {
                msgtype: MsgType.Text,
                body: `${messageToSend}`
            },
            "m.relates_to": {
                rel_type: RelationType.Replace,
                event_id: event.getId()!,
            },
        });
        setIsEditing(false);
    };

    const handleCancel = () => {
        setEditedContent(currentMessage);
        setIsEditing(false);
    };

    const handleRemove = async () => {
        await client.redactEvent(roomId, event.getId()!);
    };

    const handleKeyDown = async (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            await handleSave();
        }

        if (e.key === "Escape") {
            e.preventDefault();
            handleCancel();
        }
    };
    
    return (
        <div
            className="group hover:bg-secondary relative flex flex-col rounded px-4 py-1"
            onMouseEnter={() => {
                setHovered(true);
            }}
            onMouseLeave={() => {
                setHovered(false);
            }}
        >
            {hovered && !isEditing && (
                <div className="bg-background absolute -top-3 right-4 z-10 flex items-center gap-1 rounded-md border px-1 py-0.5 shadow-sm">
                    {isSender && !isRemoved && (
                        <>
                            <Button variant="ghost" className="cursor-pointer" title="Remove" onClick={handleRemove}>
                                <Trash size={16} />
                            </Button>
                            <Button variant="ghost" className="cursor-pointer" title="Edit" onClick={handleEdit}>
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
                        </>
                    )}
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
                    {isEdited ? (" (modifié)") : ""}
                </span>
            </div>
            <span className="text-sm wrap-break-word whitespace-pre-wrap">
                <span className="text-sm wrap-break-word whitespace-pre-wrap">
                    {isRemoved 
                        ? <span className="text-muted-foreground italic text-xs">Message supprimé</span>
                        : currentMessage
                    }
                </span>
            </span>

            {isEditing ? (  
                <>
                    <div className="flex w-full items-center gap-2">
                        <Textarea
                            value={editedContent}
                            onChange={e => setEditedContent(e.target.value)}
                            autoFocus={true}
                            onFocus={e => {
                                const len = e.target.value.length;
                                e.target.setSelectionRange(len, len);
                            }}
                            onKeyDown={handleKeyDown}
                        />
                    </div>
                
                    <div className="text-xs ml-2 mt-1 text-muted-foreground">
                        <p>Entrer pour <a className="text-blue-500 hover:underline" href="#" onClick={handleSave}>sauvegarder</a>, 
                            Echap pour <a className="text-blue-500 hover:underline" href="#" onClick={handleCancel}>annuler</a>
                        </p>
                    </div>
                </>
            ) : null}
            {renderReactions()}
        </div>
    );
};

export default MessageItem;
