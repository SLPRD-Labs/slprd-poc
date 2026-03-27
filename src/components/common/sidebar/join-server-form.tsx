import { Button } from "@/components/ui/button";
import { DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useMatrixClient } from "@/hooks/use-matrix-client";
import { spaceService } from "@/services/matrix/space";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { Compass, ArrowLeft, Loader2, CheckCircle2 } from "lucide-react";
import type { FC, SyntheticEvent } from "react";
import { useState } from "react";

interface Props {
    onBack: () => void;
    onSuccess: () => void;
}

export const JoinServerForm: FC<Props> = ({ onBack, onSuccess }) => {
    const { client } = useMatrixClient();
    const queryClient = useQueryClient();
    const navigate = useNavigate();

    const [inviteLink, setInviteLink] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const extractMatrixId = (input: string) => {
        const trimmed = input.trim();
        if (!trimmed) return "";

        try {
            const url = new URL(trimmed);
            if (url.pathname.includes("/join/")) {
                const parts = url.pathname.split("/join/");
                return decodeURIComponent(parts[1]);
            }
        } catch {
            // continue
        }

        try {
            const decoded = decodeURIComponent(trimmed);
            const match = /([#!][a-zA-Z0-9_=.-]+:[a-zA-Z0-9.-]+)/.exec(decoded);
            return match ? match[1] : trimmed;
        } catch {
            const match = /([#!][a-zA-Z0-9_=.-]+:[a-zA-Z0-9.-]+)/.exec(trimmed);
            return match ? match[1] : trimmed;
        }
    };

    const roomIdOrAlias = extractMatrixId(inviteLink);

    const roomObj = roomIdOrAlias
        ? client
              .getRooms()
              .find(
                  r =>
                      r.roomId === roomIdOrAlias ||
                      r.getCanonicalAlias() === roomIdOrAlias ||
                      r.getAltAliases().includes(roomIdOrAlias)
              )
        : undefined;

    const isJoined = roomObj?.getMyMembership() === "join";

    const handleSubmit = async (e: SyntheticEvent) => {
        e.preventDefault();

        if (!roomIdOrAlias || (!roomIdOrAlias.startsWith("!") && !roomIdOrAlias.startsWith("#"))) {
            setError(
                "Veuillez entrer un lien ou un identifiant Matrix valide (commençant par # ou !)."
            );
            return;
        }

        if (isJoined && roomObj.roomId) {
            onSuccess();
            await navigate({
                to: "/space/$spaceId",
                params: { spaceId: roomObj.roomId }
            });
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const spaceId = await spaceService.joinSpaceAndChildren(client, roomIdOrAlias);

            await queryClient.invalidateQueries({ queryKey: ["spaces"] });
            await queryClient.invalidateQueries({ queryKey: ["space", spaceId, "rooms"] });

            onSuccess();

            await navigate({
                to: "/space/$spaceId",
                params: { spaceId }
            });
        } catch (err) {
            console.error("Failed to join space:", err);
            setError(
                "Impossible de rejoindre ce serveur. Le lien est peut-être expiré ou invalide."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col gap-4">
            <DialogHeader>
                <div className="flex flex-row items-center gap-4">
                    <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-green-500 text-white">
                        <Compass className="size-6" />
                    </div>
                    <div className="flex flex-col text-left">
                        <DialogTitle>Rejoindre un serveur</DialogTitle>
                        <DialogDescription>
                            Entrez l&#39;invitation ci-dessous pour rejoindre un serveur existant.
                        </DialogDescription>
                    </div>
                </div>
            </DialogHeader>

            <form onSubmit={e => void handleSubmit(e)} className="flex flex-col gap-4 py-2">
                <div className="grid gap-1.5">
                    <Label htmlFor="invite-link">Lien d&#39;invitation ou identifiant</Label>
                    <Input
                        id="invite-link"
                        placeholder="ex: https://matrix.to/#/#mon-serveur:matrix.org"
                        value={inviteLink}
                        onChange={e => {
                            setInviteLink(e.target.value);
                        }}
                        required
                    />
                    <span className="text-muted-foreground mt-1 text-xs">
                        Les invitations ressemblent à <strong>#alias:domaine.com</strong> ou à un
                        lien.
                    </span>
                </div>

                {isJoined && (
                    <div className="flex items-center gap-2 rounded-md border border-green-200 bg-green-50 p-3 text-sm text-green-700">
                        <CheckCircle2 className="size-5 shrink-0" />
                        <span>Vous êtes déjà membre de ce serveur !</span>
                    </div>
                )}

                {error && (
                    <div className="rounded-md border border-red-200 bg-red-50 p-3 text-xs text-red-600">
                        ⚠️ {error}
                    </div>
                )}

                <div className="mt-4 flex flex-col gap-2">
                    <Button
                        type="submit"
                        disabled={loading || !inviteLink.trim()}
                        variant={isJoined ? "secondary" : "default"}
                    >
                        {loading ? (
                            <>
                                <Loader2 className="mr-2 size-4 animate-spin" /> Connexion...
                            </>
                        ) : isJoined ? (
                            "Ouvrir le serveur"
                        ) : (
                            "Rejoindre le serveur"
                        )}
                    </Button>
                    <Button type="button" variant="ghost" onClick={onBack} disabled={loading}>
                        <ArrowLeft className="mr-2 size-4" /> Retour
                    </Button>
                </div>
            </form>
        </div>
    );
};
