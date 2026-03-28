"use client";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { LoaderCircle, Volume2, Hash, Plus } from "lucide-react";
import { Visibility, Preset, EventType, RoomType } from "matrix-js-sdk";
import { useEffect, useState } from "react";
import { useForm } from "@tanstack/react-form";
import { useMatrixClient } from "@/hooks/use-matrix-client";

export function CreateRoomDialog({ spaceId }: { spaceId: string }) {
    const [loading, setLoading] = useState<boolean>(false);
    const [open, setOpen] = useState<boolean>(false);
    const [errorMessage, setErrorMessage] = useState<string>("");
    const { client } = useMatrixClient();

    const handleCreateRoom = async (value: { name: string; type: string }) => {
        setLoading(true);

        if (!value.type) {
            setErrorMessage("Veuillez selectionner un type de salon.");
            setLoading(false);
            return;
        }

        setErrorMessage("");

        const isCall = value.type !== "text";

        try {
            const space = client.getRoom(spaceId);
            const myUserId = client.getUserId();
            const myPowerLevel = space?.userMayUpgradeRoom(myUserId ?? "");

            if (!myPowerLevel) {
                setErrorMessage("Vous n'avez pas les droits pour créer un salon dans cet espace.");
                return;
            }

            const { room_id } = await client.createRoom({
                name: value.name,
                visibility: Visibility.Public,
                preset: Preset.PublicChat,
                creation_content: isCall ? { type: RoomType.ElementVideo } : undefined,
                power_level_content_override: { events_default: 0 }
            });

            await client.sendStateEvent(
                spaceId,
                EventType.SpaceChild,
                { via: [client.getDomain() ?? ""] },
                room_id
            );

            if (space) {
                const members = space.getJoinedMembers();
                await Promise.all(
                    members
                        .filter(member => member.userId !== client.getUserId())
                        .map(member => client.invite(room_id, member.userId))
                );
            }

            setOpen(false);
        } finally {
            setLoading(false);
        }
    };

    const form = useForm({
        defaultValues: {
            name: "",
            type: ""
        },
        onSubmit: async ({ value }) => {
            await handleCreateRoom(value);
        }
    });

    useEffect(() => {
        form.reset();
        setErrorMessage("");
    }, [open]);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger
                render={
                    <button
                        title="Créer un salon"
                        className="text-muted-foreground hover:bg-accent hover:text-foreground focus:ring-ring flex h-8 w-8 cursor-pointer items-center justify-center rounded-md transition-colors focus:ring-2 focus:outline-none"
                    />
                }
            >
                <Plus className="size-4" />
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Créer un salon</DialogTitle>
                </DialogHeader>
                <form
                    onSubmit={e => {
                        e.preventDefault();
                        void form.handleSubmit();
                    }}
                >
                    <form.Field name="type">
                        {field => (
                            <RadioGroup
                                value={field.state.value}
                                onValueChange={(val: string) => {
                                    field.handleChange(val);
                                }}
                                className="mt-5"
                            >
                                <div className="flex items-center gap-3">
                                    <RadioGroupItem value="vocal" id="vocal" />
                                    <Label htmlFor="vocal" className="flex items-center gap-2">
                                        <Volume2 size={16} /> Vocal
                                    </Label>
                                </div>

                                <div className="flex items-center gap-3">
                                    <RadioGroupItem value="text" id="text" />
                                    <Label htmlFor="text" className="flex items-center gap-2">
                                        <Hash size={16} /> Textuel
                                    </Label>
                                </div>
                            </RadioGroup>
                        )}
                    </form.Field>

                    <form.Field name="name">
                        {field => (
                            <Input
                                className="mt-5"
                                placeholder="Nom du salon"
                                value={field.state.value}
                                onChange={e => {
                                    field.handleChange(e.target.value);
                                }}
                                required
                            />
                        )}
                    </form.Field>

                    {errorMessage && (
                        <p className="text-destructive mt-2 text-sm">{errorMessage}</p>
                    )}

                    <DialogFooter className="mt-5">
                        <DialogClose
                            render={<Button type="button" variant="outline" disabled={loading} />}
                        >
                            Annuler
                        </DialogClose>
                        <Button type="submit" variant="default" disabled={loading}>
                            {loading && <LoaderCircle className="animate-spin" />}
                            Créer
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
