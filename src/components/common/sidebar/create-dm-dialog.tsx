import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, UserPlus } from "lucide-react";
import { useMatrixClient } from "@/hooks/use-matrix-client";
import { useUserDirectory } from "@/hooks/use-user-directory";
import { usePresence } from "@/hooks/use-presence";
import { getOrCreateDM } from "@/libs/utils/matrix/dm";

export function CreateDMModal() {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState("");
    const { client } = useMatrixClient();

    const { users, loading } = useUserDirectory(query);
    const presenceMap = usePresence(client);

    const handleStartChat = async (userId: string) => {
        const roomId = await getOrCreateDM(client, userId);
        console.log("userId ", userId)
        console.log("roomId ", roomId);
        setOpen(false);
        //router.push(`/chat/${roomId}`)
        console.log(`Démarrer une conversation avec ${userId} dans la salle ${String(roomId)}`);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger>
                <Button variant="outline" size="icon" title="Nouveau message">
                   +
                </Button>
            </DialogTrigger>

            <DialogContent className="gap-0 p-0 sm:max-w-106.25">
                <DialogHeader className="border-b p-4">
                    <DialogTitle>Nouvelle conversation</DialogTitle>
                </DialogHeader>

                <div className="border-b bg-slate-50/50 p-4">
                    <div className="relative">
                        <Search className="text-muted-foreground absolute top-2.5 left-2 h-4 w-4" />
                        <Input
                            placeholder="Rechercher un utilisateur..."
                            className="bg-white pl-8"
                            value={query}
                            onChange={e => {setQuery(e.target.value)}}
                        />
                    </div>
                </div>

                <ScrollArea className="h-75">
                    <div className="p-2">
                        {loading ? (
                            <div className="text-muted-foreground p-4 text-center text-sm">
                                Recherche...
                            </div>
                        ) : users.length > 0 ? (
                            users.map(user => {
                                const isOnline = presenceMap[user.user_id].status === "online";
                                return (
                                    <button
                                        key={user.user_id}
                                        onClick={() => {void handleStartChat(user.user_id)}}
                                        className="group flex w-full items-center gap-3 rounded-md p-2 transition-all hover:bg-slate-100"
                                    >
                                        <div className="relative">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100 font-semibold text-purple-700">
                                                {user.display_name?.[0]?.toUpperCase() ?? "?"}
                                            </div>
                                            {isOnline && (
                                                <span className="absolute right-0 bottom-0 h-3 w-3 rounded-full border-2 border-white bg-green-500" />
                                            )}
                                        </div>

                                        <div className="flex-1 text-left">
                                            <p className="text-sm leading-none font-medium">
                                                {user.display_name ?? user.user_id}
                                            </p>
                                            <p className="text-muted-foreground mt-1 max-w-50 truncate text-xs">
                                                {user.user_id}
                                            </p>
                                        </div>

                                        <UserPlus className="h-4 w-4 text-slate-300 transition-colors group-hover:text-purple-600" />
                                    </button>
                                );
                            })
                        ) : (
                            <p className="text-muted-foreground p-4 text-center text-sm">
                                Aucun utilisateur trouvé.
                            </p>
                        )}
                    </div>
                </ScrollArea>
            </DialogContent>
        </Dialog>
    );
}
