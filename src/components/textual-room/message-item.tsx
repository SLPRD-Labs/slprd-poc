import type { MatrixEvent } from "matrix-js-sdk";
import { useState } from "react";
import type { FC } from "react";
import { Button } from "../ui/button";
import { Pen, Trash } from "lucide-react";

const MessageItem: FC<{ event: MatrixEvent }> = ({ event }) => {
    const [hovered, setHovered] = useState(false);

    return (
        <div
            className="group relative flex flex-col rounded px-4 py-1"
            style={{ backgroundColor: hovered ? "#f3f4f6" : "transparent" }}
            onMouseEnter={() => {
                setHovered(true);
            }}
            onMouseLeave={() => {
                setHovered(false);
            }}
        >
            {hovered && (
                <div className="absolute -top-3 right-4 z-10 flex items-center gap-1 rounded-md border bg-white px-1 py-0.5 shadow-sm">
                    <Button variant="ghost" disabled title="Remove">
                        <Trash size={16} />
                    </Button>
                    <Button variant="ghost" disabled title="Edit">
                        <Pen size={16} />
                    </Button>
                </div>
            )}

            <span className="text-sm font-medium text-purple-800">
                {event.sender?.name}
                <span className="text-muted-foreground ml-2 text-xs">
                    {new Date(event.getTs()).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit"
                    })}
                </span>
            </span>
            <span className="text-sm wrap-break-word whitespace-pre-wrap">
                {event.getContent().body}
            </span>
        </div>
    );
};

export default MessageItem;
