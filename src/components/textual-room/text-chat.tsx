import { useMatrixClient } from "@/hooks/use-matrix-client";
import { ArrowDown, SendHorizonal } from "lucide-react";
import type { MatrixEvent } from "matrix-js-sdk";
import { RoomEvent } from "matrix-js-sdk";
import type { FC } from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import MessageItem from "./message-item";

interface Props {
    roomId: string;
}

export const TextChat: FC<Props> = ({ roomId }) => {
    const { client } = useMatrixClient();
    const [messages, setMessages] = useState<MatrixEvent[]>(
        () =>
            client
                .getRoom(roomId)
                ?.getLiveTimeline()
                .getEvents()
                .filter(event => event.getType() === "m.room.message") ?? []
    );
    const [input, setInput] = useState("");
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);
    const bottomRef = useRef<HTMLDivElement>(null);

    const refreshMessages = useCallback(() => {
        const events =
            client
                .getRoom(roomId)
                ?.getLiveTimeline()
                .getEvents()
                .filter(event => event.getType() === "m.room.message") ?? [];
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

    const handleScroll = useCallback(async () => {
        const el = scrollRef.current;
        if (!el || isLoadingMore) return;

        if (el.scrollTop === 0) {
            setIsLoadingMore(true);
            const room = client.getRoom(roomId);
            if (!room) return;

            const prevScrollHeight = el.scrollHeight;

            await client.scrollback(room, 10);
            refreshMessages();

            requestAnimationFrame(() => {
                el.scrollTop = el.scrollHeight - prevScrollHeight;
            });

            setIsLoadingMore(false);
        }
    }, [client, roomId, isLoadingMore, refreshMessages]);

    const send = async (e?: React.SyntheticEvent<HTMLFormElement>) => {
        e?.preventDefault();
        if (!input.trim()) return;
        await client.sendTextMessage(roomId, input.trim());
        setInput("");
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            void send();
        }
    };

    return (
        <div className="flex h-full flex-col overflow-hidden">
            <div
                ref={scrollRef}
                onScroll={() => {
                    void handleScroll();
                }}
                className="flex flex-1 flex-col overflow-y-auto py-2"
            >
                {isLoadingMore && (
                    <div className="text-muted-foreground flex justify-center py-2 text-xs">
                        Chargement...
                    </div>
                )}

                {messages.map(event => (
                    <MessageItem key={event.getId()} event={event} />
                ))}
                <div ref={bottomRef} />

                <div className="sticky bottom-4 m-4 flex flex-1 items-end justify-end">
                    <Button
                        variant={"ghost"}
                        className="bg-secondary hover:bg-primary hover:text-primary-foreground rounded-full p-3 shadow-lg"
                        onClick={() => bottomRef.current?.scrollIntoView({ behavior: "smooth" })}
                    >
                        <ArrowDown className="size-4" />
                    </Button>
                </div>
            </div>

            <form
                onSubmit={() => {
                    void send();
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
