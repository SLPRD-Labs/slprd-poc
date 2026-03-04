import { useMatrixClientContext } from "@/contexts/matrix-client-context/matrix-client-context";
import { MatrixEvent, RoomEvent } from "matrix-js-sdk";
import { type FC, useEffect, useState } from "react";
import { Button } from "../ui/button";
import { SendHorizonal } from "lucide-react";
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

    useEffect(() => {
        const handler = () => {
            const events = client.getRoom(roomId)
                ?.getLiveTimeline()
                .getEvents()
                .filter(event => event.getType() === "m.room.message")
                 ?? [];
            setMessages([...events]);
        };

        client.on(RoomEvent.Timeline, handler);
        return () => { client.off(RoomEvent.Timeline, handler); };
    }, [client, roomId]);

    const send = async (e?: React.SyntheticEvent<HTMLFormElement>) => {
        e?.preventDefault();
        if (!input.trim()) return;
        await client.sendTextMessage(roomId, input.trim());
        setInput("");
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            send();
        }
    };

    return (
    <div className="flex flex-col h-full overflow-hidden">
        <div className="flex-1 overflow-y-auto py-2">
            {messages.map(event => (
                <MessageItem key={event.getId()} event={event} />
            ))}
        </div>

        <form onSubmit={send} className="flex gap-2 p-4 border-t items-center">
                <Textarea
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={`Message #${client.getRoom(roomId)?.name ?? roomId}`}
                    className="overflow-y-auto"
                />
                <Button
                    type="submit"
                    className="bg-primary text-primary-foreground px-4 py-2 rounded text-sm"
                >
                    <SendHorizonal className="size-4" />
                </Button>
            </form>
        </div>
    );
};