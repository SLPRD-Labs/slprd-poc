import { useMatrixClientContext } from "@/contexts/matrix-client-context/matrix-client-context";
import { useQueryClient } from "@tanstack/react-query";
import { EventType, HistoryVisibility, Preset, RoomType } from "matrix-js-sdk";
import type { FC, SyntheticEvent } from "react";
import { useState } from "react";
import { SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useNavigate } from "@tanstack/react-router";

interface Props {
    onSuccess: () => void;
}

export const CreateServerSheetContent: FC<Props> = ({ onSuccess }) => {
    const { client } = useMatrixClientContext();
    const queryClient = useQueryClient();
    const navigate = useNavigate();

    const [name, setName] = useState("");
    const [topic, setTopic] = useState("");
    const [isPublic, setIsPublic] = useState(false);
    const [alias, setAlias] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: SyntheticEvent) => {
        e.preventDefault();
        if (!name.trim()) return;

        setLoading(true);

        try {
            const spaceResponse = await client.createRoom({
                name,
                topic,
                preset: isPublic ? Preset.PublicChat : Preset.PrivateChat,
                room_alias_name: isPublic && alias ? alias : undefined,
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
            const homeserver = client.getDomain() ?? client.getHomeserverUrl();

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
        } catch (error) {
            console.error("Failed to create space:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <SheetContent side="left" className="sm:max-w-md">
            <SheetHeader>
                <SheetTitle>Create a Server</SheetTitle>
            </SheetHeader>

            <form onSubmit={e => void handleSubmit(e)} className="mt-6 flex flex-col gap-6">
                <div className="grid gap-2">
                    <Label htmlFor="space-name">Name</Label>
                    <Input
                        id="space-name"
                        placeholder="e.g. My Server"
                        value={name}
                        onChange={e => {
                            setName(e.target.value);
                        }}
                        required
                    />
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="space-topic">Description (optional)</Label>
                    <Input
                        id="space-topic"
                        placeholder="What is this server for?"
                        value={topic}
                        onChange={e => {
                            setTopic(e.target.value);
                        }}
                    />
                </div>

                <div className="border-border flex items-center gap-3 rounded-md border p-4">
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
                        <Label htmlFor="space-public">Make this server public</Label>
                        <p className="text-muted-foreground text-xs">
                            Anyone will be able to find and join it.
                        </p>
                    </div>
                </div>

                {isPublic && (
                    <div className="grid gap-2">
                        <Label htmlFor="space-alias">Server Address (optional)</Label>
                        <Input
                            id="space-alias"
                            placeholder="e.g. my-server"
                            value={alias}
                            onChange={e => {
                                setAlias(e.target.value);
                            }}
                        />
                    </div>
                )}

                <Button type="submit" disabled={loading} className="mt-4">
                    {loading ? "Creating..." : "Create Server"}
                </Button>
            </form>
        </SheetContent>
    );
};
