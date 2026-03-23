import { useMatrixClient } from "@/hooks/use-matrix-client";
import type { MatrixEvent } from "matrix-js-sdk";
import {
    EventType,
    KnownMembership,
    MsgType,
    RelationType,
    RoomEvent,
    RoomMemberEvent
} from "matrix-js-sdk";
import type { FC, KeyboardEvent } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { WrittingAnimation } from "./writting-animation";
import { Button } from "../ui/button";
import { ArrowDown, SendHorizonal, X } from "lucide-react";
import MessageItem from "./message-item";
import { Textarea } from "../ui/textarea";
import { PresenceSidenav } from "../presence-sidenav";

interface Props {
    roomId: string;
}

interface PendingFile {
    id: string;
    file: File;
    previewUrl?: string;
}

export const TextChat: FC<Props> = ({ roomId }) => {
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
    const [typingUsers, setTypingUsers] = useState<string>("");
    const [input, setInput] = useState("");

    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [hasMoreHistory, setHasMoreHistory] = useState(true);

    const scrollRef = useRef<HTMLDivElement>(null);
    const bottomRef = useRef<HTMLDivElement>(null);

    const getThreadRootId = (event: MatrixEvent): string | null => {
        const relatesTo = event.getContent()?.["m.relates_to"];
        if (relatesTo?.rel_type === "m.thread" && typeof relatesTo?.event_id === "string") {
            return relatesTo.event_id;
        }
        return null;
    };

    const { threadRepliesCount } = useMemo(() => {
        const countByRoot: Record<string, number> = {};
                const main: MatrixEvent[] = [];

        for (const ev of messages) {
            if (ev.getType() !== "m.room.message") continue;
            const rootId = getThreadRootId(ev);
            if (rootId) {
                countByRoot[rootId] = (countByRoot[rootId] ?? 0) + 1;
            } else {
                main.push(ev);
            }        
        }

        return { threadRepliesCount: countByRoot };
    }, [messages]);

    const activeThreadMessages = useMemo(() => {
        if (!activeThreadRootId) return [];
        return messages.filter(
            ev => ev.getType() === "m.room.message" && getThreadRootId(ev) === activeThreadRootId
        );
    }, [messages, activeThreadRootId]);

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

            for (let i = 0; i < 5; i++) {
                if (cancelled) return;

                if (el.scrollHeight > el.clientHeight) return;

                const loaded = await loadOlder(10);

                if (!loaded) {
                    setHasMoreHistory(false);
                    return;
                }

                bottomRef.current?.scrollIntoView();
            }
        };

        void bootstrapHistory();

        return () => {
            cancelled = true;
        };
    }, [roomId, loadOlder]);

    useEffect(() => {
        client.on(RoomEvent.Timeline, refreshMessages);
        return () => {
            client.off(RoomEvent.Timeline, refreshMessages);
        };
    }, [client, refreshMessages]);

    useEffect(() => {
        bottomRef.current?.scrollIntoView();
    }, [roomId]);

    const handleScroll = useCallback(async () => {
        const el = scrollRef.current;
        if (!el || isLoadingMore) return;

        if (el.scrollTop <= 24) {
            setIsLoadingMore(true);
            try {
                const prevScrollHeight = el.scrollHeight;

                const loaded = await loadOlder(10);
                if (!loaded) {
                    setHasMoreHistory(false);
                    return;
                }

                el.scrollTop = Math.max(0, el.scrollHeight - prevScrollHeight);
            } finally {
                setIsLoadingMore(false);
            }
        }
    }, [isLoadingMore, hasMoreHistory, loadOlder]);

    useEffect(() => {
        if (!error) return;

        const timer = setTimeout(() => {
            setError(null);
        }, 10000);

        return () => {
            clearTimeout(timer);
        };
    }, [error]);

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

    const handleScroll = useCallback(async () => {
        const el = scrollRef.current;
        if (!el || isLoadingMore) return;

        if (el.scrollTop === 0) {
            setIsLoadingMore(true);
            const room = client.getRoom(roomId);

            if (!room) {
                setIsLoadingMore(false);
                return;
            }

            const prevScrollHeight = el.scrollHeight;

            try {
                await client.scrollback(room, 10);
                refreshMessages();

                requestAnimationFrame(() => {
                    el.scrollTop = el.scrollHeight - prevScrollHeight;
                });
            } finally {
                setIsLoadingMore(false);
            }
        }
    }, [client, roomId, isLoadingMore, refreshMessages]);

    const sendMain = async (e?: React.SyntheticEvent<HTMLFormElement>) => {
        e?.preventDefault();

        const body = input.trim();
        if (!body) return;

        await client.sendTyping(roomId, false, 4000);
        await client.sendTextMessage(roomId, body);

            setInput("");
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

    const sendThread = async (e?: React.SyntheticEvent<HTMLFormElement>) => {
        e?.preventDefault();
        const body = threadInput.trim();
        if (!body || !activeThreadRootId) return;

        await client.sendTyping(roomId, false, 4000);
        await client.sendEvent(roomId, EventType.RoomMessage, {
            msgtype: MsgType.Text,
            body,
            "m.relates_to": {
                rel_type: RelationType.Thread,
                event_id: activeThreadRootId
            }
        });

        setThreadInput("");
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            void sendMain();
            return;
        }

        void client.sendTyping(roomId, true, 4000);
    };

    const handleThreadKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            void sendThread();
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
                <div className="min-h-0 flex-1 overflow-y-auto py-2">
                    {messages.map(event => {
                        if (event.getType() === "m.room.message") {
                            // Not showing threaded messages in the main timeline, they are visible in the thread view
                            if (getThreadRootId(event) !== null) return null;

                            return (
                                <MessageItem
                                    key={event.getId()}
                                    event={event}
                                    threadCount={threadRepliesCount[event.getId() ?? ""] ?? 0}
                                    onOpenThread={setActiveThreadRootId}
                                />
                            );
                        }

                        if (event.getType() === "m.room.member") {
                            return (
                                <div
                                    key={event.getId()}
                                    className="text-muted-foreground text-center text-xs"
                                >
                                    {event.sender?.name &&
                                        (event.getContent().membership === "join"
                                            ? `${event.sender.name} a rejoint le salon`
                                            : `${event.sender.name} a quitté le salon`)}
                                </div>
                            );
                        }

                        return null;
                    })}

                    <div ref={bottomRef} />

                    <div className="sticky bottom-4 m-4 flex-1 items-end flex justify-end">
                        <Button
                            variant="ghost"
                            className="bg-secondary hover:bg-primary hover:text-primary-foreground rounded-full p-3 shadow-lg"
                            onClick={() => bottomRef.current?.scrollIntoView({ behavior: "smooth" })}
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
                            <WrittingAnimation /> {typingUsers}
                        </>
                    )}
                </div>

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
                    </div>
                </div>

                <Button
                    type="submit"
                    size="icon"
                    className="bg-primary text-primary-foreground hover:bg-primary/90 h-12 w-12 shrink-0 rounded-full md:hidden"
                    disabled={isUploading || (!input.trim() && pendingFiles.length === 0)}
                    aria-label="Envoyer le message"
                >
                    <SendHorizonal className="size-5" />
                </Button>
            </form>
                        </div>


             {activeThreadRootId ? (
                <aside className="hidden w-90 shrink-0 border-l md:flex md:flex-col">
                    <div className="flex items-center justify-between border-b p-3">
                        <span className="text-sm font-semibold">Thread</span>
                        <Button variant="ghost" onClick={() => setActiveThreadRootId(null)}>
                            <X size={16} />
                        </Button>
                    </div>
                    <div className="flex-1 overflow-y-auto p-2">
                        {activeThreadMessages.map(event => (
                            <MessageItem key={event.getId()} event={event} />
                        ))}
                    </div>

                    <form
                        onSubmit={e => {
                            void sendThread(e);
                        }}
                        className="flex items-center gap-2 border-t p-3"
                    >
                        <Textarea
                            value={threadInput}
                            onChange={e => setThreadInput(e.target.value)}
                            onKeyDown={handleThreadKeyDown}
                            placeholder="Répondre dans le thread..."
                            className="resize-none overflow-y-auto"
                        />
                        <Button type="submit">
                            <SendHorizonal className="size-4" />
                        </Button>
                    </form>
                </aside>
            ) : (
                <div className="h-full w-80 shrink-0 border-l">
                    <PresenceSidenav />
                </div>
            )}
        </div>
    );
};
