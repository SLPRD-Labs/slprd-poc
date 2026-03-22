import { useMatrixClient } from "@/hooks/use-matrix-client";
import { Pen, Trash, FileIcon, Loader2 } from "lucide-react";
import { MatrixEventEvent, MsgType, RelationType, EventType } from "matrix-js-sdk";
import type { MatrixEvent } from "matrix-js-sdk";
import type { FC } from "react";
import type React from "react";
import { useEffect, useState } from "react";
import { Button } from "../ui/button";
import {
    Dialog,
    DialogContent,
    DialogTitle,
    DialogTrigger
} from "../ui/dialog";
import { Textarea } from "../ui/textarea";

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

const AuthenticatedMedia: FC<{ mxcUrl: string; msgtype: string; body: string }> = ({
    mxcUrl,
    msgtype,
    body
}) => {
    const { client } = useMatrixClient();
    const [objectUrl, setObjectUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let url: string | null = null;
        const controller = new AbortController();

        const fetchMedia = async () => {
            const accessToken = client.getAccessToken();

            const httpUrl = client.mxcUrlToHttp(
                mxcUrl,
                undefined,
                undefined,
                undefined,
                true,
                true,
                true
            );

            if (!accessToken || !httpUrl) {
                if (!controller.signal.aborted) setLoading(false);
                return;
            }

            try {
                const res = await fetch(httpUrl, {
                    signal: controller.signal,
                    headers: { Authorization: `Bearer ${accessToken}` }
                });

                if (!res.ok) throw new Error("Failed to fetch media");

                const blob = await res.blob();
                if (!controller.signal.aborted) {
                    url = URL.createObjectURL(blob);
                    setObjectUrl(url);
                }
            } catch (error) {
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-expect-error
                if (error.name === "AbortError") return;
                console.error("Media fetch error:", error);
            } finally {
                if (!controller.signal.aborted) setLoading(false);
            }
        };

        void fetchMedia();

        return () => {
            controller.abort();
            if (url) URL.revokeObjectURL(url);
        };
    }, [client, mxcUrl]);

    if (loading) {
        return (
            <div className="mt-2 flex w-fit items-center gap-2 rounded-md border p-3 text-sm text-slate-500">
                <Loader2 className="size-4 animate-spin" /> Chargement...
            </div>
        );
    }

    if (!objectUrl) {
        return <div className="mt-2 text-sm text-red-500">Erreur de chargement du média</div>;
    }

    if (msgtype === "m.image") {
        return (
            <Dialog>
                <DialogTrigger
                    render={
                        <button className="focus-visible:ring-ring mt-2 max-w-sm cursor-pointer overflow-hidden rounded-md border bg-gray-50/50 transition-opacity outline-none hover:opacity-90 focus-visible:ring-2 focus-visible:ring-offset-2" />
                    }
                >
                    <img src={objectUrl} alt={body} className="max-h-96 w-full object-contain" />
                </DialogTrigger>

                <DialogContent className="flex max-h-[95vh] w-auto max-w-[95vw] items-center justify-center border-none bg-transparent p-0 shadow-none ring-0">
                    <DialogTitle className="sr-only">Aperçu de l&#39;image : {body}</DialogTitle>

                    <img
                        src={objectUrl}
                        alt={body}
                        className="max-h-[90vh] max-w-[90vw] rounded-md object-contain"
                    />
                </DialogContent>
            </Dialog>
        );
    }

    return (
        <a
            href={objectUrl}
            download={body}
            className="mt-2 flex w-fit items-center gap-2 rounded-md border bg-gray-50 p-3 transition-colors hover:bg-gray-100"
        >
            <FileIcon className="size-5 text-indigo-500" />
            <span className="text-sm font-medium text-slate-700 underline-offset-4 hover:underline">
                {body}
            </span>
        </a>
    );
};

const MessageItem: FC<{ event: MatrixEvent; roomId: string }> = ({ event, roomId }) => {
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

    const eventContent = event.getContent();
    const msgtype = eventContent.msgtype;
    const body = eventContent.body as string;

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
        const onRedacted = () => {
            setIsRedacted(true);
        };
        event.on(MatrixEventEvent.BeforeRedaction, onRedacted);
        return () => {
            event.off(MatrixEventEvent.BeforeRedaction, onRedacted);
        };
    }, [event]);

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
                    <span className="text-muted-foreground text-xs italic">
                        Message supprimé
                    </span>
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
            return <AuthenticatedMedia mxcUrl={mxcUrl} msgtype={msgtype} body={currentMessage} />;
        }

        return (
            <span className="text-sm wrap-break-word whitespace-pre-wrap">
                {currentMessage}
            </span>
        );
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
        </div>
    );
};

export default MessageItem;