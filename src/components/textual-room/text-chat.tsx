import { useMatrixClientContext } from "@/contexts/matrix-client-context/matrix-client-context";
import { MatrixEvent, RoomEvent } from "matrix-js-sdk";
import { type FC, useCallback, useEffect, useRef, useState } from "react";
import { Button } from "../ui/button";
import { ArrowDown, SendHorizonal } from "lucide-react";
import MessageItem from "./message-item";
import { Textarea } from "../ui/textarea";

interface Props {
    roomId: string;
}

export const TextChat: FC<Props> = ({ roomId }) => {
    const { client } = useMatrixClientContext();
    const [messages, setMessages] = useState<MatrixEvent[]>(() =>
        client.getRoom(roomId)
            ?.getLiveTimeline()
            .getEvents()
            .filter(event => event.getType() === "m.room.message")
            ?? []
    );
    const [input, setInput] = useState("");
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);
    const bottomRef = useRef<HTMLDivElement>(null);

    const refreshMessages = useCallback(() => {
        const events = client.getRoom(roomId)
            ?.getLiveTimeline()
            .getEvents()
            .filter(event => event.getType() === "m.room.message")
            ?? [];
        setMessages([...events]);
    }, [client, roomId]);

    useEffect(() => {
        client.on(RoomEvent.Timeline, refreshMessages);
        return () => { client.off(RoomEvent.Timeline, refreshMessages); };
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
        <div className="flex flex-col h-full overflow-hidden">
            <div
                ref={scrollRef}
                onScroll={handleScroll}
                className="flex flex-1 overflow-y-auto py-2 flex-col"
            >
                {isLoadingMore && (
                    <div className="flex justify-center py-2 text-xs text-muted-foreground">
                        Chargement...
                    </div>
                )}

                {messages.map(event => (
                    <MessageItem key={event.getId()} event={event} />
                ))}
                <div ref={bottomRef} />

                <div className="flex flex-1 sticky bottom-4 justify-end m-4 items-end">
                    <Button
                        variant={"ghost"}
                        className="p-3 bg-secondary hover:bg-primary hover:text-primary-foreground rounded-full shadow-lg"
                        onClick={() => bottomRef.current?.scrollIntoView({ behavior: "smooth" })}
                    >
                        <ArrowDown className="size-4" />
                    </Button>
                </div>
            </div>

            <form onSubmit={send} className="flex gap-2 p-4 border-t items-center">
                <Textarea
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={`Message #${client.getRoom(roomId)?.name ?? roomId}`}
                    className="overflow-y-auto resize-none"
                />
                <Button type="submit">
                    <SendHorizonal className="size-4" />
                </Button>
            </form>
        </div>
    );
};