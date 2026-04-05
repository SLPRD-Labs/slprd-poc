import { ChevronRight, CornerUpLeft, Ellipsis } from "lucide-react";
import { Button } from "../ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "../ui/dropdown-menu";

interface Props {
    eventId?: string | null;
    onOpenThread?: (rootEventId: string) => void;
    onReply?: (eventId: string) => void;
    threadExists?: boolean;
}

export const ActionDropdown = ({ eventId, onOpenThread, onReply, threadExists }: Props) => {
    const canOpenThread = Boolean(eventId && onOpenThread);
    const canReply = Boolean(eventId && onReply);

    return (
        <DropdownMenu>
            <DropdownMenuTrigger
                render={
                    <Button variant="ghost" title="More actions">
                        <Ellipsis size={16} />
                    </Button>
                }
            />

            <DropdownMenuContent align="end" className="w-64 p-2">
                <DropdownMenuItem
                    className="flex justify-between"
                    disabled={!canReply}
                    onClick={() => {
                        if (eventId && onReply) onReply(eventId);
                    }}
                >
                    Répondre
                    <CornerUpLeft size={16} />
                </DropdownMenuItem>

                <DropdownMenuItem
                    className="flex justify-between"
                    disabled={!canOpenThread}
                    onClick={() => {
                        if (eventId && onOpenThread) {
                            onOpenThread(eventId);
                        }
                    }}
                >
                    {threadExists ? "Ouvrir le thread" : "Créer un thread"}
                    <ChevronRight size={16} />
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
};
