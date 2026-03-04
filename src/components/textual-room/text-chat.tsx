import { useMatrixClientContext } from "@/contexts/matrix-client-context/matrix-client-context";
import { MatrixEvent, RoomEvent } from "matrix-js-sdk";
import { type FC, useEffect, useState } from "react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { SendHorizonal } from "lucide-react";
import MessageItem from "./message-item";

interface Props {
    roomId: string;
}

export const TextChat: FC<Props> = ({ roomId }) => {
    const { client } = useMatrixClientContext();
    const [messages, setMessages] = useState<MatrixEvent[]>(() =>
        client.getRoom(roomId)
            ?.getLiveTimeline()
            .getEvents() ?? []
    );
    const [input, setInput] = useState("");

    useEffect(() => {
        const handler = () => {
            const events = client.getRoom(roomId)
                ?.getLiveTimeline()
                .getEvents() ?? [];
            setMessages([...events]);
        };

        client.on(RoomEvent.Timeline, handler);
        return () => { client.off(RoomEvent.Timeline, handler); };
    }, [client, roomId]);

    const send = async (e: React.SyntheticEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!input.trim()) return;
        await client.sendTextMessage(roomId, input.trim());
        setInput("");
    };

    return (
        <div className="flex flex-col h-full">
            <div className="flex flex-col gap-2 overflow-y-auto flex-1 p-4">
                {messages.map(event => (
                    // <div key={event.getId()} className="flex flex-col">
                    //     <span className="text-sm font-medium text-purple-800">
                    //         {event.sender?.name}
                    //         <span className="text-xs text-muted-foreground ml-2">
                    //             {new Date(event.getTs())
                    //                 .toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    //             }
                    //         </span>
                    //     </span>
                    //     <span className="text-sm">
                    //         {event.getContent().body}
                    //     </span>
                    // </div>
                    <MessageItem key={event.getId()} event={event} />
                ))}
            </div>

            <form onSubmit={send} className="flex gap-2 p-4 border-t">
                <Input
                    className="flex-1 border rounded px-3 py-2 text-sm"
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    placeholder={`Message #${client.getRoom(roomId)?.name ?? roomId}`}
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