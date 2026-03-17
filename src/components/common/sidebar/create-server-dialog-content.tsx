import { useMatrixClientContext } from "@/contexts/matrix-client-context/matrix-client-context";
import { useQueryClient } from "@tanstack/react-query";
import { EventType, HistoryVisibility, Preset, RoomType } from "matrix-js-sdk";
import type { FC, SyntheticEvent } from "react";
import { useState, useEffect } from "react";
import {
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useNavigate } from "@tanstack/react-router";
import { Plus } from "lucide-react";

interface Props {
    open: boolean;
    onSuccess: () => void;
}

export const CreateServerDialogContent: FC<Props> = ({ open, onSuccess }) => {
    const { client } = useMatrixClientContext();
    const queryClient = useQueryClient();
    const navigate = useNavigate();

    const [name, setName] = useState("");
    const [topic, setTopic] = useState("");
    const [isPublic, setIsPublic] = useState(false);
    const [alias, setAlias] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (open) {
            setName("");
            setTopic("");
            setIsPublic(false);
            setAlias("");
            setLoading(false);
            setError(null);
        }
    }, [open]);

    const handleSubmit = async (e: SyntheticEvent) => {
        e.preventDefault();

        const trimmedName = name.trim();
        if (!trimmedName) return;

        const trimmedAlias = alias.trim();
        if (isPublic && trimmedAlias) {
            const aliasLocalpartRegex = /^[0-9a-zA-Z._=-]+$/;
            if (!aliasLocalpartRegex.test(trimmedAlias)) {
                setError(
                    "L'adresse du serveur ne peut contenir que des lettres, chiffres, points, tirets et underscores."
                );
                return;
            }
        }

        setLoading(true);
        setError(null);

        try {
            const spaceResponse = await client.createRoom({
                name: trimmedName,
                topic,
                preset: isPublic ? Preset.PublicChat : Preset.PrivateChat,
                room_alias_name: isPublic && trimmedAlias ? trimmedAlias : undefined,
                creation_content: { type: RoomType.Space },
                power_level_content_override: {
                    events_default: 100,
                    invite: isPublic ? 0 : 50
                },
                initial_state: [
                    {
                        type: "m.room.history_visibility",
                        state_key: "",
                        content: {
                            history_visibility: isPublic
                                ? HistoryVisibility.WorldReadable
                                : HistoryVisibility.Invited
                        }
                    }
                ]
            });

            const spaceId = spaceResponse.room_id;
            const homeserver = client.getDomain() ?? new URL(client.getHomeserverUrl()).host;

            const generalResponse = await client.createRoom({
                name: "general",
                preset: isPublic ? Preset.PublicChat : Preset.PrivateChat,
                initial_state: [
                    {
                        type: "m.room.history_visibility",
                        state_key: "",
                        content: {
                            history_visibility: isPublic
                                ? HistoryVisibility.WorldReadable
                                : HistoryVisibility.Invited
                        }
                    },
                    {
                        type: EventType.SpaceParent,
                        state_key: spaceId,
                        content: { via: [homeserver], canonical: true }
                    }
                ]
            });

            const generalRoomId = generalResponse.room_id;

            await client.sendStateEvent(
                spaceId,
                EventType.SpaceChild,
                { via: [homeserver] },
                generalRoomId
            );

            await queryClient.invalidateQueries({ queryKey: ["spaces"] });
            await queryClient.invalidateQueries({ queryKey: ["space", spaceId, "rooms"] });

            onSuccess();

            await navigate({
                to: "/space/$spaceId/room/$roomId",
                params: { spaceId, roomId: generalRoomId }
            });
        } catch (err) {
            console.error("Failed to create space:", err);

            setError(
                typeof err === "object" &&
                    err !== null &&
                    "message" in err &&
                    typeof err.message === "string"
                    ? err.message
                    : "Échec de la création du serveur"
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <DialogContent>
            <DialogHeader>
                <div className="flex flex-row items-center gap-4">
                    <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-indigo-500 text-white">
                        <Plus className="size-6" />
                    </div>
                    <div className="flex flex-col text-left">
                        <DialogTitle>Créer un serveur</DialogTitle>
                        <DialogDescription>
                            Configurez votre nouvel espace de discussion
                        </DialogDescription>
                    </div>
                </div>
            </DialogHeader>

            <form
                onSubmit={e => {
                    void handleSubmit(e);
                }}
                className="flex flex-col gap-4 py-2"
            >
                <div className="grid gap-1.5">
                    <Label htmlFor="space-name">Nom</Label>
                    <Input
                        id="space-name"
                        placeholder="Ex: Mon Super Serveur"
                        value={name}
                        onChange={e => {
                            setName(e.target.value);
                        }}
                        required
                    />
                </div>

                <div className="grid gap-1.5">
                    <Label htmlFor="space-topic">Description (optionnel)</Label>
                    <Input
                        id="space-topic"
                        placeholder="À quoi sert ce serveur ?"
                        value={topic}
                        onChange={e => {
                            setTopic(e.target.value);
                        }}
                    />
                </div>

                <div className="border-border flex items-center gap-3 rounded-lg border p-4">
                    <input
                        type="checkbox"
                        id="space-public"
                        checked={isPublic}
                        onChange={e => {
                            setIsPublic(e.target.checked);
                        }}
                        className="size-4 rounded border-gray-300"
                    />
                    <div className="grid gap-1.5 leading-none">
                        <Label htmlFor="space-public">Rendre ce serveur public</Label>
                        <p className="text-muted-foreground text-xs">
                            N&#39;importe qui pourra le trouver et le rejoindre.
                        </p>
                    </div>
                </div>

                {isPublic && (
                    <div className="grid gap-1.5">
                        <Label htmlFor="space-alias">Adresse du serveur (optionnel)</Label>
                        <Input
                            id="space-alias"
                            placeholder="ex: mon-serveur"
                            value={alias}
                            onChange={e => {
                                setAlias(e.target.value);
                            }}
                        />
                    </div>
                )}

                {error && (
                    <div className="b-red-50 rounded-md border border-red-200 p-3 text-xs text-red-600">
                        ⚠️ {error}
                    </div>
                )}

                <Button type="submit" disabled={loading} className="mt-2">
                    {loading ? "Création en cours..." : "Créer le serveur"}
                </Button>
            </form>
        </DialogContent>
    );
};
