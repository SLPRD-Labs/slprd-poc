import { Button } from "@/components/ui/button";
import { useMatrixClient } from "@/hooks/use-matrix-client";
import { Route } from "@/routes/_mainLayout/join/$inviteId";
import { spaceService } from "@/services/matrix/space";
import { useQueryClient } from "@tanstack/react-query";
import { Compass, Loader2 } from "lucide-react";
import { useState } from "react";

export function JoinInvitePage() {
    const { inviteId } = Route.useParams();
    const navigate = Route.useNavigate();

    const { client } = useMatrixClient();
    const queryClient = useQueryClient();

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const decodedInviteId = decodeURIComponent(inviteId);

    const roomObj = client
        .getRooms()
        .find(
            r =>
                r.roomId === decodedInviteId ||
                r.getCanonicalAlias() === decodedInviteId ||
                r.getAltAliases().includes(decodedInviteId)
        );
    const isJoined = roomObj?.getMyMembership() === "join";

    const handleAction = async () => {
        if (isJoined && roomObj.roomId) {
            await navigate({ to: "/space/$spaceId", params: { spaceId: roomObj.roomId } });
            return;
        }

        setLoading(true);
        setError(null);
        try {
            const spaceId = await spaceService.joinSpaceAndChildren(client, decodedInviteId);
            await queryClient.invalidateQueries({ queryKey: ["spaces"] });
            await queryClient.invalidateQueries({ queryKey: ["space", spaceId, "rooms"] });

            await navigate({ to: "/space/$spaceId", params: { spaceId } });
        } catch (err: unknown) {
            console.error("Join error:", err);
            setError(
                "Impossible de rejoindre ce serveur. Le lien est expiré, invalide ou vous n'avez pas la permission."
            );
            setLoading(false);
        }
    };

    return (
        <div className="bg-muted/10 flex h-full w-full items-center justify-center p-4">
            <div className="bg-background flex w-full max-w-md flex-col items-center gap-6 rounded-2xl border p-8 text-center shadow-lg">
                <div className="flex size-20 items-center justify-center rounded-3xl bg-green-500 text-white shadow-md">
                    <Compass className="size-10" />
                </div>

                <div className="flex flex-col gap-2">
                    <h1 className="text-2xl font-bold">
                        {isJoined ? "Serveur déjà rejoint" : "Rejoindre un serveur"}
                    </h1>
                    <p className="text-muted-foreground text-sm">
                        {isJoined
                            ? "Vous êtes déjà membre de "
                            : "Vous avez été invité à rejoindre "}
                        <br />
                        <strong className="bg-muted text-foreground mt-2 inline-block rounded px-2 py-1 font-mono">
                            {decodedInviteId}
                        </strong>
                    </p>
                </div>

                {error && (
                    <div className="w-full rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">
                        ⚠️ {error}
                    </div>
                )}

                <div className="mt-4 flex w-full flex-col gap-3">
                    <Button
                        size="lg"
                        className="h-12 w-full text-base"
                        variant={isJoined ? "secondary" : "default"}
                        onClick={() => void handleAction()}
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <Loader2 className="mr-2 size-5 animate-spin" /> Connexion...
                            </>
                        ) : isJoined ? (
                            "Ouvrir le serveur"
                        ) : (
                            "Accepter l'invitation"
                        )}
                    </Button>
                    <Button
                        size="lg"
                        variant="ghost"
                        className="w-full"
                        onClick={() => void navigate({ to: "/" })}
                        disabled={loading}
                    >
                        Retourner à l&#39;accueil
                    </Button>
                </div>
            </div>
        </div>
    );
}
