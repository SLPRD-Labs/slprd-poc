import { useMatrixClient } from "@/hooks/use-matrix-client";
import { eventService } from "@/services/matrix/event";
import { buildThreadRepliesCount, getThreadRootId } from "@/utils/messagesRelations";
import type { MatrixEvent } from "matrix-js-sdk";
import {
    EventType,
    KnownMembership,
    MsgType,
    RelationType,
    RoomEvent,
    RoomMemberEvent
} from "matrix-js-sdk";
import type { ChangeEvent, FC, KeyboardEvent, SyntheticEvent } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { RoomMessageEventContent } from "matrix-js-sdk/lib/@types/events";
import { ArrowDown, FileIcon, Loader2, Paperclip, SendHorizonal, Trash, X } from "lucide-react";

import { PresenceSidenav } from "../presence-sidenav";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import MessageItem from "./message-item";
import { ThreadPanel } from "./thread-panel";
import { WrittingAnimation } from "./writting-animation";

interface Props {
    roomId: string;
    isDM?: boolean;
}

interface PendingFile {
    id: string;
    file: File;
    previewUrl?: string;
}

export const TextChat: FC<Props> = ({ roomId, isDM }) => {
    const { client } = useMatrixClient();

    const filterEvents = (event: MatrixEvent) => {
        if (event.getType() !== "m.room.message" && event.getType() !== "m.room.member")
            return false;
        const relatesTo = event.getContent()["m.relates_to"];
        return relatesTo?.rel_type !== RelationType.Replace;
    };

    const [messages, setMessages] = useState<MatrixEvent[]>(
        () => client.getRoom(roomId)?.getLiveTimeline().getEvents().filter(filterEvents) ?? []
    );

    const [typingUsers, setTypingUsers] = useState("");
    const [input, setInput] = useState("");
    const [replyToEventId, setReplyToEventId] = useState<string | null>(null);
    const [highlightedEventId, setHighlightedEventId] = useState<string | null>(null);

    const [activeThreadRootId, setActiveThreadRootId] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [pendingFiles, setPendingFiles] = useState<PendingFile[]>([]);

    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [hasMoreHistory, setHasMoreHistory] = useState(true);

    const highlightTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const scrollRef = useRef<HTMLDivElement>(null);
    const bottomRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const threadRepliesCount = useMemo(() => buildThreadRepliesCount(messages), [messages]);

    const replyToEvent = useMemo(
        () => messages.find(e => e.getId() === replyToEventId) ?? null,
        [messages, replyToEventId]
    );
    const [nameVersion, setNameVersion] = useState(0);

    const refreshMessages = useCallback(() => {
        const events =
            client.getRoom(roomId)?.getLiveTimeline().getEvents().filter(filterEvents) ?? [];
        setMessages([...events]);
    }, [client, roomId]);

    const loadOlder = useCallback(
        async (limit = 20) => {
            const room = client.getRoom(roomId);
            if (!room) return false;

            const before = room.getLiveTimeline().getEvents().length;
            await client.scrollback(room, limit);
            const after = room.getLiveTimeline().getEvents().length;

            refreshMessages();
            return after > before;
        },
        [client, roomId, refreshMessages]
    );

    // Loading more history on mount until we fill the scroll container or we reach the end of history
    useEffect(() => {
        let cancelled = false;

        const bootstrapHistory = async () => {
            const el = scrollRef.current;
            if (!el) return;

            try {
                for (let i = 0; i < 5; i++) {
                    if (cancelled) return;
                    if (el.scrollHeight > el.clientHeight) return;

                    const loaded = await loadOlder(10);
                    if (!loaded) {
                        setHasMoreHistory(false);
                        return;
                    }

                    await new Promise<void>(resolve =>
                        requestAnimationFrame(() => {
                            resolve();
                        })
                    );
                    bottomRef.current?.scrollIntoView();
                }
            } catch (err) {
                console.error("Failed to load history:", err);
            }
        };

        void bootstrapHistory();

        return () => {
            cancelled = true;
        };
    }, [roomId, loadOlder]);

    useEffect(() => {
        const onNameChange = () => {
            refreshMessages();
            setNameVersion(v => v + 1);
        };

        client.on(RoomEvent.Timeline, refreshMessages);
        client.on(RoomMemberEvent.Name, onNameChange);
        return () => {
            client.off(RoomEvent.Timeline, refreshMessages);
            client.off(RoomMemberEvent.Name, onNameChange);
        };
    }, [client, refreshMessages]);

    useEffect(() => {
        bottomRef.current?.scrollIntoView();
    }, [roomId]);

    useEffect(() => {
        return () => {
            if (highlightTimeoutRef.current) clearTimeout(highlightTimeoutRef.current);
        };
    }, []);

    useEffect(() => {
        const room = client.getRoom(roomId);
        if (!room) {
            setTypingUsers("");
            return;
        }

        const handler = () => {
            const typing: string[] = room
                .getMembersWithMembership(KnownMembership.Join)
                .filter(member => member.typing && member.userId !== client.getUserId())
                .map(member => member.name.trim() || member.userId);

            if (typing.length === 0) setTypingUsers("");
            else if (typing.length === 1) setTypingUsers(`${typing[0]} est en train d'écrire...`);
            else if (typing.length === 2) {
                setTypingUsers(
                    `${new Intl.ListFormat("fr", {
                        style: "long",
                        type: "conjunction"
                    }).format(typing)} sont en train d'écrire...`
                );
            } else setTypingUsers("Plusieurs personnes sont en train d'écrire...");
        };

        handler();
        client.on(RoomMemberEvent.Typing, handler);

        return () => {
            client.off(RoomMemberEvent.Typing, handler);
            setTypingUsers("");
        };
    }, [client, roomId]);

    const waitNextPaint = () =>
        new Promise<void>(resolve => {
            requestAnimationFrame(() => {
                resolve();
            });
        });

    const jumpToEvent = useCallback(
        async (eventId: string) => {
            const container = scrollRef.current;
            if (!container) return;

            const queryTarget = () =>
                container.querySelector<HTMLElement>(`[data-event-id="${eventId}"]`);

            let target = queryTarget();

            if (!target) {
                await eventService.getEventById(client, roomId, eventId);

                for (let i = 0; i < 20; i++) {
                    target = queryTarget();
                    if (target) break;

                    const loaded = await loadOlder(30);
                    if (!loaded) break;

                    await waitNextPaint();
                }

                await waitNextPaint();
                target = queryTarget();
                if (!target) return;
            }

            await waitNextPaint();
            target.scrollIntoView({ behavior: "smooth", block: "center" });

            setHighlightedEventId(eventId);

            if (highlightTimeoutRef.current) clearTimeout(highlightTimeoutRef.current);
            highlightTimeoutRef.current = setTimeout(() => {
                setHighlightedEventId(prev => (prev === eventId ? null : prev));
            }, 1800);
        },
        [client, roomId, loadOlder]
    );

    const handleScroll = useCallback(async () => {
        const el = scrollRef.current;
        if (!el || isLoadingMore || !hasMoreHistory) return;

        if (el.scrollTop <= 24) {
            setIsLoadingMore(true);
            try {
                const prevScrollHeight = el.scrollHeight;

                const loaded = await loadOlder(10);
                if (!loaded) {
                    setHasMoreHistory(false);
                    return;
                }

                await waitNextPaint();
                el.scrollTop = Math.max(0, el.scrollHeight - prevScrollHeight);
            } finally {
                setIsLoadingMore(false);
            }
        }
    }, [isLoadingMore, hasMoreHistory, loadOlder]);

    useEffect(() => {
        const room = client.getRoom(roomId);
        if (!room) return;

        const handler = () => {
            const typing = room
                .getMembersWithMembership(KnownMembership.Join)
                .filter(member => member.typing && member.userId !== client.getUserId())
                .map(member => member.name);

            if (typing.length === 0) {
                setTypingUsers("");
            } else if (typing.length === 1) {
                setTypingUsers(`${typing[0]} est en train d'écrire...`);
            } else if (typing.length === 2) {
                setTypingUsers(
                    `${new Intl.ListFormat("fr", {
                        style: "long",
                        type: "conjunction"
                    }).format(typing)} sont en train d'écrire...`
                );
            } else {
                setTypingUsers("Plusieurs personnes sont en train d'écrire...");
            }
        };

        client.on(RoomMemberEvent.Typing, handler);
        return () => {
            client.off(RoomMemberEvent.Typing, handler);
        };
    }, [client, roomId]);

    useEffect(() => {
        if (!error) return;

        const timer = setTimeout(() => {
            setError(null);
        }, 10000);

        return () => {
            clearTimeout(timer);
        };
    }, [error]);

    const sendMain = async (e?: SyntheticEvent<HTMLFormElement>) => {
        e?.preventDefault();

        const body = input.trim();
        const hasFiles = pendingFiles.length > 0;

        if (!body && !hasFiles) return;

        setIsUploading(true);

        try {
            if (body) {
                const content: RoomMessageEventContent = {
                    msgtype: MsgType.Text,
                    body
                };

                if (replyToEventId) {
                    content["m.relates_to"] = {
                        "m.in_reply_to": {
                            event_id: replyToEventId
                        }
                    };
                }

                await client.sendTyping(roomId, false, 4000);
                await client.sendEvent(roomId, EventType.RoomMessage, content);
            }

            for (const pending of pendingFiles) {
                const { file } = pending;
                const uploadResponse = await client.uploadContent(file);
                const mxcUrl = uploadResponse.content_uri;

                const baseContent = {
                    body: file.name,
                    url: mxcUrl,
                    info: {
                        size: file.size,
                        mimetype: file.type
                    }
                };

                if (file.type.startsWith("image/")) {
                    await client.sendMessage(roomId, { ...baseContent, msgtype: MsgType.Image });
                } else if (file.type.startsWith("video/")) {
                    await client.sendMessage(roomId, { ...baseContent, msgtype: MsgType.Video });
                } else if (file.type.startsWith("audio/")) {
                    await client.sendMessage(roomId, { ...baseContent, msgtype: MsgType.Audio });
                } else {
                    await client.sendMessage(roomId, { ...baseContent, msgtype: MsgType.File });
                }
            }

            setInput("");
            setReplyToEventId(null);
            setPendingFiles(prevPendingFiles => {
                prevPendingFiles.forEach(pending => {
                    if (pending.previewUrl) {
                        URL.revokeObjectURL(pending.previewUrl);
                    }
                });

                return [];
            });
            if (textareaRef.current) textareaRef.current.style.height = "auto";

            bottomRef.current?.scrollIntoView({ behavior: "smooth" });
        } catch (err) {
            console.error("Failed to send message/files:", err);
            setError("Échec de l'envoi du message ou du fichier.");
        } finally {
            setIsUploading(false);
        }
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            void sendMain();
            return;
        }
        void client.sendTyping(roomId, true, 4000);
    };

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        const MAX_FILE_SIZE_MB = 50;
        const validFiles: PendingFile[] = [];
        let hasError = false;

        for (const file of Array.from(files)) {
            if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
                hasError = true;
            } else {
                validFiles.push({
                    id: crypto.randomUUID(),
                    file,
                    previewUrl: file.type.startsWith("image/")
                        ? URL.createObjectURL(file)
                        : undefined
                });
            }
        }

        if (hasError) {
            setError(
                `Un ou plusieurs fichiers dépassent la taille maximale de ${MAX_FILE_SIZE_MB.toString()} Mo et ont été ignorés.`
            );
        } else {
            setError(null);
        }

        setPendingFiles(prev => [...prev, ...validFiles]);

        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const removePendingFile = (idToRemove: string) => {
        setPendingFiles(prev => {
            const index = prev.findIndex(pf => pf.id === idToRemove);
            if (index === -1) return prev;

            const newFiles = [...prev];
            const removed = newFiles.splice(index, 1)[0];
            if (removed.previewUrl) {
                URL.revokeObjectURL(removed.previewUrl);
            }
            return newFiles;
        });
    };

    const formatDate = (timestamp: number) => {
        const date = new Date(timestamp);
        const now = new Date();
        const yesterday = new Date();
        yesterday.setDate(now.getDate() - 1);

        if (date.toDateString() === now.toDateString()) {
            return "Aujourd'hui";
        }
        if (date.toDateString() === yesterday.toDateString()) {
            return "Hier";
        }

        return date.toLocaleDateString("fr-FR", {
            day: "numeric",
            month: "long",
            year: "numeric"
        });
    };

    return (
        <div className="flex h-full w-full flex-row overflow-hidden">
            <div className="flex h-full min-w-0 flex-1 flex-col overflow-hidden">
                <div
                    ref={scrollRef}
                    onScroll={() => void handleScroll()}
                    className="flex min-h-0 flex-1 flex-col overflow-y-auto py-2"
                >
                    {isLoadingMore && (
                        <div className="text-muted-foreground flex justify-center py-2 text-xs">
                            Chargement...
                        </div>
                    )}

                    {messages.map((event, index) => {
                        if (event.getType() === "m.room.member") {
                            const content = event.getContent();
                            const prevContent = event.getPrevContent() as {
                                membership?: string;
                            } | null;

                            const membership = content.membership;
                            const prevMembership = prevContent?.membership;

                            if (
                                membership === KnownMembership.Join &&
                                prevMembership === KnownMembership.Join
                            ) {
                                return null;
                            }

                            return (
                                <div
                                    key={event.getId()}
                                    className="text-muted-foreground text-center text-xs"
                                >
                                    {event.sender?.name &&
                                        (event.getContent().membership === KnownMembership.Join
                                            ? `${event.sender.name} a rejoint le salon`
                                            : `${event.sender.name} a quitté le salon`)}
                                </div>
                            );
                        }

                        if (event.getType() === "m.room.message") {
                            if (getThreadRootId(event) !== null) return null;

                            const currentDate = new Date(event.getTs()).toDateString();

                            const prevMessageEvent = messages
                                .slice(0, index)
                                .reverse()
                                .find(e => e.getType() === "m.room.message");

                            const prevDate = prevMessageEvent
                                ? new Date(prevMessageEvent.getTs()).toDateString()
                                : null;

                            const safeEventId = event.getId() ?? "unknown";
                            const safeVersion = String(nameVersion);

                            return (
                                <div key={safeEventId}>
                                    {currentDate !== prevDate && (
                                        <div className="my-2 flex items-center gap-2 px-4">
                                            <div className="bg-border h-px flex-1" />
                                            <span className="text-muted-foreground text-xs">
                                                {formatDate(event.getTs())}
                                            </span>
                                            <div className="bg-border h-px flex-1" />
                                        </div>
                                    )}
                                    <MessageItem
                                        key={`${safeEventId}-${safeVersion}`}
                                        event={event}
                                        threadCount={threadRepliesCount[event.getId() ?? ""] ?? 0}
                                        onOpenThread={setActiveThreadRootId}
                                        onJumpToEvent={eventId => void jumpToEvent(eventId)}
                                        onReply={setReplyToEventId}
                                        isHighlighted={highlightedEventId === event.getId()}
                                    />
                                </div>
                            );
                        }

                        return null;
                    })}

                    <div ref={bottomRef} />

                    <div className="sticky bottom-4 m-4 flex flex-1 items-end justify-end">
                        <Button
                            variant="ghost"
                            className="bg-secondary hover:bg-primary hover:text-primary-foreground rounded-full p-3 shadow-lg"
                            onClick={() =>
                                bottomRef.current?.scrollIntoView({ behavior: "smooth" })
                            }
                        >
                            <ArrowDown className="size-4" />
                        </Button>
                    </div>
                </div>

                {error && (
                    <div className="mx-4 mt-2 rounded-md border border-red-200 bg-red-50 p-3 text-xs text-red-600">
                        ⚠️ {error}
                    </div>
                )}

                <div className="text-muted-foreground flex flex-row items-center gap-2 px-4 text-sm">
                    {typingUsers !== "" && (
                        <>
                            <WrittingAnimation />
                            {typingUsers}
                        </>
                    )}
                </div>

                {replyToEvent && (
                    <div className="bg-muted/40 flex items-start justify-between border-t px-4 py-2 text-xs">
                        <div className="min-w-0">
                            <div className="font-medium">Réponse à {replyToEvent.sender?.name}</div>
                            <div className="text-muted-foreground truncate">
                                {String(replyToEvent.getContent().body)}
                            </div>
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                                setReplyToEventId(null);
                            }}
                        >
                            <X className="size-4" />
                        </Button>
                    </div>
                )}
                <form
                    onSubmit={e => {
                        void sendMain(e);
                    }}
                    className="bg-background flex items-end gap-2 border-t p-4"
                >
                    <input
                        type="file"
                        multiple
                        className="hidden"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                    />

                    <div className="border-input focus-within:border-ring flex max-h-[40vh] flex-1 flex-col overflow-hidden rounded-2xl border bg-transparent transition-all">
                        {pendingFiles.length > 0 && (
                            <div className="border-border/40 bg-muted/20 flex gap-3 overflow-x-auto border-b p-3">
                                {pendingFiles.map(pf => (
                                    <div
                                        key={pf.id}
                                        className="bg-background relative flex h-16 w-16 shrink-0 items-center justify-center rounded-lg border shadow-sm"
                                    >
                                        <button
                                            type="button"
                                            onClick={() => {
                                                removePendingFile(pf.id);
                                            }}
                                            className="text-destructive-foreground absolute -top-2 -right-2 flex size-6 items-center justify-center rounded-md bg-white shadow-sm transition-all hover:scale-110"
                                            aria-label={`Supprimer ${pf.file.name}`}
                                        >
                                            <Trash className="size-3.5" />
                                        </button>
                                        {pf.previewUrl ? (
                                            <img
                                                src={pf.previewUrl}
                                                alt={pf.file.name}
                                                className="size-full rounded-lg object-cover"
                                            />
                                        ) : (
                                            <div className="text-muted-foreground flex flex-col items-center gap-1 overflow-hidden p-1">
                                                <FileIcon className="size-6 shrink-0" />
                                                <span className="w-full truncate text-center text-[9px] leading-tight font-medium">
                                                    {pf.file.name}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="flex items-end gap-1 px-1">
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="text-muted-foreground hover:text-foreground mb-1 h-10 w-10 shrink-0 rounded-full"
                                disabled={isUploading}
                                onClick={() => fileInputRef.current?.click()}
                                aria-label="Joindre un fichier"
                            >
                                {isUploading ? (
                                    <Loader2 className="size-5 animate-spin" />
                                ) : (
                                    <Paperclip className="size-5" />
                                )}
                            </Button>

                            <Textarea
                                ref={textareaRef}
                                value={input}
                                onChange={e => {
                                    setInput(e.target.value);
                                }}
                                onInput={e => {
                                    const target = e.target as HTMLTextAreaElement;
                                    target.style.height = "auto";
                                    target.style.height = `${target.scrollHeight.toString()}px`;
                                }}
                                onKeyDown={handleKeyDown}
                                placeholder={`Message #${client.getRoom(roomId)?.name ?? roomId}`}
                                rows={1}
                                className="max-h-[40vh] min-h-12 w-full flex-1 resize-none overflow-y-auto border-0 px-2 py-3 text-base leading-relaxed shadow-none focus-visible:ring-0 md:text-base"
                            />

                            <Button
                                type="submit"
                                size="icon"
                                className="bg-primary text-primary-foreground hover:bg-primary/90 h-12 w-12 shrink-0 rounded-full"
                                disabled={
                                    isUploading || (!input.trim() && pendingFiles.length === 0)
                                }
                                aria-label="Envoyer le message"
                            >
                                <SendHorizonal className="size-5" />
                            </Button>
                        </div>
                    </div>
                </form>
            </div>

            {activeThreadRootId ? (
                <ThreadPanel
                    client={client}
                    roomId={roomId}
                    activeThreadRootId={activeThreadRootId}
                    messages={messages}
                    onClose={() => {
                        setActiveThreadRootId(null);
                    }}
                />
            ) : (
                !isDM && (
                    <div className="h-full w-80 shrink-0 border-l">
                        <PresenceSidenav />
                    </div>
                )
            )}
        </div>
    );
};
