import { useState, useMemo } from "react";
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
import { Check, Copy, UserPlus, Send } from "lucide-react";
import { useMatrixClient } from "@/hooks/use-matrix-client";
import { useUserDirectory } from "@/hooks/use-user-directory";
import { getOrCreateDM } from "@/libs/utils/matrix/dm";

export function SpaceInviteDialog({ spaceId }: { spaceId: string }) {
    const { client } = useMatrixClient();
    const [open, setOpen] = useState(false);
    const [copied, setCopied] = useState(false);
    const [query, setQuery] = useState("");
    const [invitingId, setInvitingId] = useState<string | null>(null);
    const [invitedUsers, setInvitedUsers] = useState<Set<string>>(new Set());

    const { users, loading } = useUserDirectory(query);

    const inviteLink = useMemo(() => {
        const space = client.getRoom(spaceId);
        if (!space) return spaceId;
        const identifier = (space.getCanonicalAlias() ?? space.getAltAliases()[0]) || spaceId;
        return `${window.location.origin}/join/${encodeURIComponent(identifier)}`;
    }, [client, spaceId]);

    const handleCopy = () => {
        void navigator.clipboard.writeText(inviteLink);
        setCopied(true);
        setTimeout(() => {
            setCopied(false);
        }, 2000);
    };

    const handleDirectInvite = async (userId: string) => {
        setInvitingId(userId);
        try {
            const dmRoomId = await getOrCreateDM(client, userId);
            if (dmRoomId) {
                await client.sendTextMessage(dmRoomId, inviteLink);
                setInvitedUsers(prev => new Set(prev).add(userId));
            }
        } catch (e) {
            console.error("Erreur lors de l'envoi de l'invitation DM", e);
        } finally {
            setInvitingId(null);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger
                render={
                    <button
                        title="Inviter des amis"
                        className="text-muted-foreground hover:bg-accent hover:text-foreground focus:ring-ring flex h-8 w-8 cursor-pointer items-center justify-center rounded-md transition-colors focus:ring-2 focus:outline-none"
                    />
                }
            >
                <UserPlus className="size-4" />
            </DialogTrigger>

            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Inviter des amis au serveur</DialogTitle>
                </DialogHeader>

                <div className="flex flex-col gap-4 py-4">
                    {/* Lien direct à copier */}
                    <div className="flex flex-col gap-2">
                        <span className="text-muted-foreground text-xs font-semibold uppercase">
                            Envoyer un lien d&#39;invitation
                        </span>
                        <div className="flex items-center gap-2">
                            <Input
                                readOnly
                                value={inviteLink}
                                className="bg-muted/50 font-mono text-xs"
                            />
                            <Button
                                size="icon"
                                onClick={handleCopy}
                                className={copied ? "bg-green-500 hover:bg-green-600" : ""}
                            >
                                {copied ? (
                                    <Check className="size-4" />
                                ) : (
                                    <Copy className="size-4" />
                                )}
                            </Button>
                        </div>
                    </div>

                    <div className="mt-2 flex flex-col gap-2">
                        <span className="text-muted-foreground text-xs font-semibold uppercase">
                            Ou envoyer un Message Privé
                        </span>
                        <Input
                            placeholder="Rechercher quelqu'un..."
                            value={query}
                            onChange={e => {
                                setQuery(e.target.value);
                            }}
                        />

                        <ScrollArea className="mt-1 h-40 rounded-md border">
                            <div className="flex flex-col gap-1 p-2">
                                {loading && (
                                    <p className="text-muted-foreground p-2 text-center text-xs">
                                        Recherche...
                                    </p>
                                )}
                                {!loading &&
                                    users.map(user => (
                                        <div
                                            key={user.user_id}
                                            className="hover:bg-accent flex items-center justify-between rounded-md p-2"
                                        >
                                            <div className="flex flex-col">
                                                <span className="text-sm font-medium">
                                                    {user.display_name ?? user.user_id}
                                                </span>
                                                {user.display_name && (
                                                    <span className="text-muted-foreground text-xs">
                                                        {user.user_id}
                                                    </span>
                                                )}
                                            </div>
                                            <Button
                                                size="sm"
                                                variant={
                                                    invitedUsers.has(user.user_id)
                                                        ? "outline"
                                                        : "secondary"
                                                }
                                                disabled={
                                                    invitingId === user.user_id ||
                                                    invitedUsers.has(user.user_id)
                                                }
                                                onClick={() =>
                                                    void handleDirectInvite(user.user_id)
                                                }
                                            >
                                                {invitedUsers.has(user.user_id) ? (
                                                    <Check className="mr-1 size-4 text-green-500" />
                                                ) : invitingId === user.user_id ? (
                                                    <span className="mr-1 size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                                                ) : (
                                                    <Send className="mr-1 size-3.5" />
                                                )}

                                                {invitedUsers.has(user.user_id)
                                                    ? "Envoyé"
                                                    : invitingId === user.user_id
                                                      ? "Envoi..."
                                                      : "Inviter"}
                                            </Button>
                                        </div>
                                    ))}
                            </div>
                        </ScrollArea>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
