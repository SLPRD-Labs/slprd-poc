import { useMatrixClient } from "@/hooks/use-matrix-client";
import type { MatrixEvent } from "matrix-js-sdk";
import { KnownMembership, RelationType, RoomEvent, RoomMemberEvent } from "matrix-js-sdk";
import type { FC, KeyboardEvent } from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowDown, SendHorizonal } from "lucide-react";

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
    if (event.getType() !== "m.room.message" && event.getType() !== "m.room.member") return false;
    const relatesTo = event.getContent()["m.relates_to"];
    return relatesTo?.rel_type !== RelationType.Replace;
    };

    const [messages, setMessages] = useState<MatrixEvent[]>(
        () =>
            client
                .getRoom(roomId)
                ?.getLiveTimeline()
                .getEvents()
                .filter(filterEvents) ?? []                   
    );

    const [typingUsers, setTypingUsers] = useState<string>("");
    const [input, setInput] = useState("");

    const scrollRef = useRef<HTMLDivElement>(null);
    const bottomRef = useRef<HTMLDivElement>(null);

    const refreshMessages = useCallback(() => {
        const events =
            client
                .getRoom(roomId)
                ?.getLiveTimeline()
                .getEvents()
                .filter(filterEvents) ?? [];
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

        return date.toLocaleDateString ("fr-FR", {
            day: "numeric",
            month: "long",
            year: "numeric",
        });
    };

    return (
        <div className="flex h-full w-full flex-col overflow-hidden">
            <div ref={scrollRef} className="flex min-h-0 flex-1 flex-col overflow-y-auto py-2">
                {messages.map((event, index) => {
                    if (event.getType() === "m.room.message") {

                        const currentDate = new Date(event.getTs()).toDateString();
                        const prevDate = index > 0
                            ? new Date(messages[index - 1].getTs()).toDateString()
                            : null;
                        
                        return (
                            <div key={event.getId()}>
                                {currentDate !== prevDate && (
                                    <div className="flex items-center gap-2 my-2 px-4">
                                        <div className="flex-1 h-px bg-border" />
                                        <span className="text-xs text-muted-foreground">
                                            {formatDate(event.getTs())}
                                        </span>
                                        <div className="flex-1 h-px bg-border" />
                                    </div>
                                )}
                                <MessageItem event={event} roomId={roomId} />
                            </div>
                        );
                    }
                    
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

                    return null;
                })}

                <div ref={bottomRef} />

                <div className="sticky bottom-4 m-4 flex items-end justify-end">
                    <Button
                        variant="ghost"
                        className="bg-secondary hover:bg-primary hover:text-primary-foreground rounded-full p-3 shadow-lg"
                        onClick={() => bottomRef.current?.scrollIntoView({ behavior: "smooth" })}
                    >
                        <ArrowDown className="size-4" />
                    </Button>
                </div>
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
                className="flex items-center gap-2 border-t p-4"
            >
                <Textarea
                    value={input}
                    onChange={e => {
                        setInput(e.target.value);
                    }}
                    onKeyDown={handleKeyDown}
                    placeholder={`Message #${client.getRoom(roomId)?.name ?? roomId}`}
                    className="resize-none overflow-y-auto"
                />
                <Button type="submit">
                    <SendHorizonal className="size-4" />
                </Button>
            </form>
        </div>
    );
};
