import { useMatrixClient } from "@/hooks/use-matrix-client";
import type { MatrixEvent } from "matrix-js-sdk";
import { KnownMembership, RelationType, RoomEvent, RoomMemberEvent, MsgType } from "matrix-js-sdk";
import type { ChangeEvent, FC, KeyboardEvent } from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowDown, SendHorizonal, Paperclip, Loader2 } from "lucide-react";

import MessageItem from "./message-item";
import { WrittingAnimation } from "./writting-animation";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";

interface Props {
    roomId: string;
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
    const [isUploading, setIsUploading] = useState(false);

    const scrollRef = useRef<HTMLDivElement>(null);
    const bottomRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const refreshMessages = useCallback(() => {
        const events =
            client.getRoom(roomId)?.getLiveTimeline().getEvents().filter(filterEvents) ?? [];
        setMessages([...events]);
    }, [client, roomId]);

    useEffect(() => {
        client.on(RoomEvent.Timeline, refreshMessages);
        return () => {
            client.off(RoomEvent.Timeline, refreshMessages);
        };
    }, [client, refreshMessages]);

    useEffect(() => {
        bottomRef.current?.scrollIntoView();
    }, [roomId]);

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

    const sendMain = async (e?: React.SyntheticEvent<HTMLFormElement>) => {
        e?.preventDefault();

        const body = input.trim();
        if (!body) return;

        await client.sendTyping(roomId, false, 4000);
        await client.sendTextMessage(roomId, body);

        setInput("");
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            void sendMain();
            return;
        }

        void client.sendTyping(roomId, true, 4000);
    };

    const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        try {
            const uploadResponse = await client.uploadContent(file);
            const mxcUrl = uploadResponse.content_uri;

            let msgtype: MsgType = MsgType.File;
            if (file.type.startsWith("image/")) msgtype = MsgType.Image;
            else if (file.type.startsWith("video/")) msgtype = MsgType.Video;
            else if (file.type.startsWith("audio/")) msgtype = MsgType.Audio;

            await client.sendMessage(roomId, {
                msgtype,
                body: file.name,
                url: mxcUrl,
                info: {
                    size: file.size,
                    mimetype: file.type
                }
            } as never);

            bottomRef.current?.scrollIntoView({ behavior: "smooth" });
        } catch (error) {
            console.error("Failed to upload file:", error);
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        }
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
        <div className="flex h-full w-full flex-col overflow-hidden">
            <div ref={scrollRef} className="flex min-h-0 flex-1 flex-col overflow-y-auto py-2">
                {messages.map((event, index) => {
                    if (event.getType() === "m.room.member") {
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
                        const currentDate = new Date(event.getTs()).toDateString();

                        const prevMessageEvent = messages
                            .slice(0, index)
                            .reverse()
                            .find(e => e.getType() === "m.room.message");

                        const prevDate = prevMessageEvent
                            ? new Date(prevMessageEvent.getTs()).toDateString()
                            : null;

                        return (
                            <div key={event.getId()}>
                                {currentDate !== prevDate && (
                                    <div className="my-2 flex items-center gap-2 px-4">
                                        <div className="bg-border h-px flex-1" />
                                        <span className="text-muted-foreground text-xs">
                                            {formatDate(event.getTs())}
                                        </span>
                                        <div className="bg-border h-px flex-1" />
                                    </div>
                                )}
                                <MessageItem event={event} roomId={roomId} />
                            </div>
                        );
                    }

                    return null;
                })}

                <div ref={bottomRef} />
            </div>

            <div className="sticky bottom-4 m-4 flex items-end justify-end">
                <Button
                    variant="ghost"
                    className="bg-secondary hover:bg-primary hover:text-primary-foreground rounded-full p-3 shadow-lg"
                    onClick={() => bottomRef.current?.scrollIntoView({ behavior: "smooth" })}
                >
                    <ArrowDown className="size-4" />
                </Button>
            </div>

            <div className="text-muted-foreground flex flex-row items-center gap-2 px-4 text-sm">
                {typingUsers !== "" && (
                    <>
                        <WrittingAnimation />
                        {typingUsers}
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
                    className="hidden"
                    ref={fileInputRef}
                    onChange={e => {
                        void handleFileChange(e);
                    }}
                />

                <div className="border-input focus-within:border-ring flex max-h-[40vh] flex-1 items-end gap-1 overflow-hidden rounded-2xl border bg-transparent px-1 transition-all">
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="text-muted-foreground hover:text-foreground mb-1 h-10 w-10 shrink-0 rounded-full"
                        disabled={isUploading}
                        onClick={() => fileInputRef.current?.click()}
                    >
                        {isUploading ? (
                            <Loader2 className="size-5 animate-spin" />
                        ) : (
                            <Paperclip className="size-5" />
                        )}
                    </Button>

                    <Textarea
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

                <Button
                    type="submit"
                    size="icon"
                    className="bg-primary text-primary-foreground hover:bg-primary/90 h-12 w-12 shrink-0 rounded-full md:hidden"
                    disabled={isUploading || !input.trim()}
                >
                    <SendHorizonal className="size-5" />
                </Button>
            </form>
        </div>
    );
};
