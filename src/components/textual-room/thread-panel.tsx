import { getThreadRootId } from "@/utils/messagesRelations";
import type { MatrixClient, MatrixEvent } from "matrix-js-sdk";
import { EventType, MsgType, RelationType } from "matrix-js-sdk";
import { SendHorizonal, X } from "lucide-react";
import type { FC, KeyboardEvent, SyntheticEvent } from "react";
import { useMemo, useState } from "react";

import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import MessageItem from "./message-item";

interface Props {
    client: MatrixClient;
    roomId: string;
    activeThreadRootId: string;
    messages: MatrixEvent[];
    onClose: () => void;
}

export const ThreadPanel: FC<Props> = ({
    client,
    roomId,
    activeThreadRootId,
    messages,
    onClose
}) => {
    const [threadInput, setThreadInput] = useState("");

    const activeThreadMessages = useMemo(
        () =>
            messages.filter(
                ev =>
                    ev.getType() === "m.room.message" &&
                    getThreadRootId(ev) === activeThreadRootId
            ),
        [messages, activeThreadRootId]
    );

    const sendThread = async (e?: SyntheticEvent<HTMLFormElement>) => {
        e?.preventDefault();

        const body = threadInput.trim();
        if (!body) return;

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

    const handleThreadKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            void sendThread();
            return;
        }
        void client.sendTyping(roomId, true, 4000);
    };

    return (
        <aside className="hidden w-90 shrink-0 border-l md:flex md:flex-col">
            <div className="flex items-center justify-between border-b p-3">
                <span className="text-sm font-semibold">Thread</span>
                <Button variant="ghost" onClick={onClose}>
                    <X size={16} />
                </Button>
            </div>

            <div className="flex-1 overflow-y-auto p-2">
                {activeThreadMessages.map(event => (
                    <MessageItem key={event.getId()} event={event} />
                ))}
            </div>

            <form onSubmit={e => void sendThread(e)} className="flex items-center gap-2 border-t p-3">
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
    );
};