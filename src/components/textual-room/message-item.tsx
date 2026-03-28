import { useMatrixClient } from "@/hooks/use-matrix-client";
import { getReplyToEventId } from "@/utils/messagesRelations";
import { MatrixEventEvent, MsgType, RelationType, EventType } from "matrix-js-sdk";
import type { MatrixEvent } from "matrix-js-sdk";
import type { FC } from "react";
import { useEffect, useState } from "react";
import { MessageSquare, Pen, Trash } from "lucide-react";
import { ReplyPreview } from "./reply-preview";
import { Button } from "../ui/button";
import { AuthenticatedMedia } from "./authenticated-media";
import { Textarea } from "../ui/textarea";
import { ActionDropdown } from "./action-dropdown";
import { InvitePreviewCard } from "./invite-preview-card";

interface Props {
    event: MatrixEvent;
    threadCount?: number;
    onOpenThread?: (rootEventId: string) => void;
    onJumpToEvent?: (eventId: string) => void;
    onReply?: (eventId: string) => void;
    isHighlighted?: boolean;
}

interface ReactionContent {
    "m.relates_to"?: {
        rel_type?: string;
        event_id?: string;
        key?: string;
    };
}

interface MessageContent {
    body: string;
    "m.new_content"?: {
        body: string;
    };
}

const collectReactionsByEmoji = (events: MatrixEvent[], targetEventId: string) => {
    const byEmoji = new Map<string, MatrixEvent[]>();

    for (const timelineEvent of events) {
        if (
            timelineEvent.getType() !== (EventType.Reaction as string) ||
            timelineEvent.isRedacted()
        )
            continue;

        const relatesTo = timelineEvent.getContent<ReactionContent>()["m.relates_to"];
        if (!relatesTo) continue;

        if (
            relatesTo.rel_type !== RelationType.Annotation ||
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

const MessageItem: FC<Props> = ({
    event,
    threadCount = 0,
    onOpenThread,
    onJumpToEvent,
    onReply,
    isHighlighted = false
}) => {
    const { client } = useMatrixClient();
    const currentUser = client.getUserId();
    const userSender = event.getSender();
    const isSender = userSender === currentUser;
    const isEdited = !!event.replacingEvent();
    const [replacingEvent, setReplacingEvent] = useState(event.replacingEvent());
    const [isEditing, setIsEditing] = useState(false);
    const [isRedacted, setIsRedacted] = useState(event.isRedacted());
    const isRemoved = isRedacted || replacingEvent?.isRedacted();
    const content = event.getContent<MessageContent>();
    const replacingContent = replacingEvent?.getContent<MessageContent>();
    const currentMessage = replacingContent?.["m.new_content"]?.body ?? content.body;
    const [editedContent, setEditedContent] = useState(currentMessage);
    const [hovered, setHovered] = useState(false);
    const [isReactionPending, setIsReactionPending] = useState(false);
    const [underline, setUnderline] = useState(false);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const eventId = event.getId();
    const roomId = event.getRoomId();
    const replyEventId = getReplyToEventId(event);
    const isThreadRoot = threadCount > 0;

    const eventContent = event.getContent();
    const msgtype = eventContent.msgtype;
    const body = eventContent.body as string;
    const info = eventContent.info as { size?: number } | undefined;

    const getMessageReactions = () => {
        if (!roomId || !eventId) return null;
        const room = client.getRoom(roomId);
        if (!room) return null;

        const timelineEvents = room.getLiveTimeline().getEvents();
        return collectReactionsByEmoji(timelineEvents, eventId);
    };

    const toggleReaction = async (emoji: string) => {
        const userId = client.getUserId();
        if (!roomId || !eventId || !userId || isReactionPending) return;

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
        const onRedacted = () => {
            setIsRedacted(true);
        };
        event.on(MatrixEventEvent.BeforeRedaction, onRedacted);
        return () => {
            event.off(MatrixEventEvent.BeforeRedaction, onRedacted);
        };
    }, [event]);

    if (!eventId || !roomId) return null;

    const handleEdit = () => {
        setEditedContent(currentMessage);
        setIsEditing(true);
    };

    const handleSave = async () => {
        const messageToSend = editedContent.trim();
        if (!messageToSend) return;

        const eventId = event.getId();
        if (!eventId) return;

        await client.sendMessage(roomId, null, {
            msgtype: MsgType.Text,
            body: `*${messageToSend}`,
            "m.new_content": {
                msgtype: MsgType.Text,
                body: messageToSend
            },
            "m.relates_to": {
                rel_type: RelationType.Replace,
                event_id: eventId
            }
        });

        setIsEditing(false);
    };

    const handleCancel = () => {
        setEditedContent(currentMessage);
        setIsEditing(false);
    };

    const handleRemove = async () => {
        const eventId = event.getId();
        if (!eventId) return;
        await client.redactEvent(roomId, eventId);
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

    const renderContent = () => {
        if (isRemoved) {
            return (
                <span className="text-sm wrap-break-word whitespace-pre-wrap">
                    <span className="text-muted-foreground text-xs italic">Message supprimé</span>
                </span>
            );
        }

        const mxcUrl = eventContent.url as string | undefined;

        if (
            mxcUrl &&
            (msgtype === "m.image" ||
                msgtype === "m.file" ||
                msgtype === "m.video" ||
                msgtype === "m.audio")
        ) {
            return (
                <AuthenticatedMedia
                    mxcUrl={mxcUrl}
                    msgtype={msgtype}
                    body={body}
                    fileSize={info?.size}
                    onDialogOpenChange={open => {
                        setIsDialogOpen(open);
                        if (open) setHovered(false);
                    }}
                />
            );
        }

        const trimmedMessage = currentMessage.trim();

        if (!trimmedMessage.includes(" ")) {
            try {
                const url = new URL(trimmedMessage, window.location.origin);
                const segments = url.pathname.split("/").filter(Boolean);
                const joinIndex = segments.indexOf("join");

                if (joinIndex !== -1 && segments[joinIndex + 1]) {
                    const inviteId = segments[joinIndex + 1];
                    return <InvitePreviewCard inviteId={inviteId} />;
                }
            } catch {
                // not a valid URL
            }
        }

        return (
            <span className="text-sm wrap-break-word whitespace-pre-wrap">{currentMessage}</span>
        );
    };

    return (
        <div
            data-event-id={eventId}
            className={`relative flex flex-col px-4 py-1 transition-colors ${
                hovered ? "bg-secondary" : ""
            } ${isHighlighted ? "bg-primary/20 ring-primary ring-1" : ""}`}
            onMouseEnter={() => {
                setHovered(true);
            }}
            onMouseLeave={() => {
                setHovered(false);
            }}
        >
            {hovered && !isEditing && !isDialogOpen && (
                <div className="bg-background absolute -top-3 right-4 z-10 flex items-center gap-1 rounded-md border px-1 py-0.5 shadow-sm">
                    {isSender && !isRemoved && (
                        <>
                            <Button
                                variant="ghost"
                                className="cursor-pointer"
                                title="Remove"
                                onClick={() => {
                                    handleRemove().catch(console.error);
                                }}
                            >
                                <Trash size={16} />
                            </Button>
                            <Button
                                variant="ghost"
                                className="cursor-pointer"
                                title="Edit"
                                onClick={handleEdit}
                            >
                                <Pen size={16} />
                            </Button>
                            <span className="text-gray-300">|</span>
                        </>
                    )}
                    {!isRemoved && (
                        <>
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
                            <ActionDropdown
                                eventId={eventId}
                                onOpenThread={onOpenThread}
                                onReply={onReply}
                                threadExists={isThreadRoot}
                            />
                        </>
                    )}
                </div>
            )}

            {roomId && replyEventId && (
                <ReplyPreview
                    roomId={roomId}
                    replyEventId={replyEventId}
                    onJumpToEvent={onJumpToEvent}
                />
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
                    {isEdited ? " (modifié)" : ""}
                </span>
            </div>

            {isEditing ? (
                <>
                    <div className="flex w-full items-center gap-2">
                        <Textarea
                            value={editedContent}
                            onChange={e => {
                                setEditedContent(e.target.value);
                            }}
                            autoFocus={true}
                            onFocus={e => {
                                const len = e.target.value.length;
                                e.target.setSelectionRange(len, len);
                            }}
                            onKeyDown={e => {
                                handleKeyDown(e).catch(console.error);
                            }}
                        />
                    </div>

                    <div className="text-muted-foreground mt-1 ml-2 text-xs">
                        <p>
                            Entrer pour{" "}
                            <Button
                                type="button"
                                className="cursor-pointer bg-transparent p-0 text-xs text-blue-500 hover:underline"
                                onClick={() => {
                                    handleSave().catch(console.error);
                                }}
                            >
                                sauvegarder
                            </Button>
                            , Echap pour{" "}
                            <Button
                                className="cursor-pointer bg-transparent p-0 text-xs text-blue-500 hover:underline"
                                onClick={handleCancel}
                            >
                                annuler
                            </Button>
                        </p>
                    </div>
                </>
            ) : (
                renderContent()
            )}

            {renderReactions()}

            {isThreadRoot && eventId && (
                <button
                    type="button"
                    onClick={() => {
                        onOpenThread?.(eventId);
                    }}
                    onMouseEnter={() => {
                        setUnderline(true);
                    }}
                    onMouseLeave={() => {
                        setUnderline(false);
                    }}
                    className="text-muted-foreground bg-muted mt-1 inline-flex w-fit items-center gap-1 rounded-md border px-2 py-1 text-xs hover:cursor-pointer"
                >
                    <MessageSquare size={14} />
                    Ouvrir le thread •
                    <span className={`font-semibold text-blue-700 ${underline ? "underline" : ""}`}>
                        {threadCount} message{threadCount > 1 ? "s" : ""}
                    </span>
                </button>
            )}
        </div>
    );
};

export default MessageItem;
