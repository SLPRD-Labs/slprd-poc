"use client";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LoaderCircle } from "lucide-react";
import type { Room } from "matrix-js-sdk";
import { EventType } from "matrix-js-sdk";
import { useEffect, useState } from "react";
import { useForm } from "@tanstack/react-form";
import { useMatrixClient } from "@/hooks/use-matrix-client";

export function EditRoomDialog({
    openEditRoom,
    setOpenEditRoom,
    spaceId,
    room
}: {
    openEditRoom: boolean;
    setOpenEditRoom: (open: boolean) => void;
    spaceId: string;
    room: Room;
}) {
    const [loading, setLoading] = useState<boolean>(false);
    const { client } = useMatrixClient();

    const handleEditRoom = async (value: { name: string }) => {
        setLoading(true);

        try {
            await client.sendStateEvent(room.roomId, EventType.RoomName, { name: value.name });
            setOpenEditRoom(false);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteRoom = async () => {
        setLoading(true);

        try {
            await client.sendStateEvent(spaceId, EventType.SpaceChild, {}, room.roomId);
            setOpenEditRoom(false);
        } finally {
            setLoading(false);
        }
    };

    const form = useForm({
        defaultValues: {
            name: room.name
        },
        onSubmit: async ({ value }) => {
            await handleEditRoom(value);
        }
    });

    useEffect(() => {
        form.reset();
    }, [openEditRoom]);

    return (
        <Dialog open={openEditRoom} onOpenChange={setOpenEditRoom}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Modifier le salon</DialogTitle>
                </DialogHeader>
                <form
                    onSubmit={e => {
                        e.preventDefault();
                        void form.handleSubmit();
                    }}
                >
                    <form.Field name="name">
                        {field => (
                            <div className="mt-2 space-y-2">
                                <Label htmlFor="room-name">Nom</Label>
                                <Input
                                    id="room-name"
                                    placeholder="Nom du salon"
                                    value={field.state.value}
                                    onChange={e => {
                                        field.handleChange(e.target.value);
                                    }}
                                    required
                                />
                            </div>
                        )}
                    </form.Field>

                    <DialogFooter className="mt-5">
                        <DialogClose
                            render={
                                <Button
                                    type="button"
                                    variant="destructive"
                                    disabled={loading}
                                    onClick={() => {
                                        void handleDeleteRoom();
                                    }}
                                />
                            }
                        >
                            Supprimer
                        </DialogClose>
                        <DialogClose
                            render={<Button type="button" variant="outline" disabled={loading} />}
                        >
                            Annuler
                        </DialogClose>
                        <Button type="submit" variant="default" disabled={loading}>
                            {loading && <LoaderCircle className="animate-spin" />}
                            Modifier
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
