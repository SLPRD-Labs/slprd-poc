<<<<<<< HEAD
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
=======
'use client';

import { Button } from '@/components/ui/button';
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LoaderCircle } from 'lucide-react';
import { EventType, Room } from "matrix-js-sdk";
import { useEffect, useState } from 'react';
import { useForm } from '@tanstack/react-form'
import { useMatrixClient } from '@/hooks/use-matrix-client';
>>>>>>> 8a63d35 ((create-room) - Ajout dialog de modification et suppression)

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
<<<<<<< HEAD
    const space = client.getRoom(spaceId);
    const myUserId = client.getUserId();
    const canEdit = space?.userMayUpgradeRoom(myUserId ?? "");
    const [errorMessage, setErrorMessage] = useState<string>("");

    const handleEditRoom = async (value: { name: string }) => {
        setLoading(true);
        setErrorMessage("");

        try {
            if (!canEdit) {
                setErrorMessage("Vous n'avez pas les droits pour modifier ce salon.");
                return;
            }

            await client.sendStateEvent(room.roomId, EventType.RoomName, { name: value.name });
=======

    const handleEditRoom = async (value: { name: string; }) => {
        setLoading(true);

        try {
            await client.sendStateEvent(
                room.roomId,
                EventType.RoomName,
                { name: value.name },
            );
>>>>>>> 8a63d35 ((create-room) - Ajout dialog de modification et suppression)
            setOpenEditRoom(false);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteRoom = async () => {
        setLoading(true);
<<<<<<< HEAD
        setErrorMessage("");

        try {
            if (!canEdit) {
                setErrorMessage("Vous n'avez pas les droits pour supprimer ce salon.");
                return;
            }

            await client.sendStateEvent(spaceId, EventType.SpaceChild, {}, room.roomId);
=======

        try {
            await client.sendStateEvent(
                spaceId,        
                EventType.SpaceChild,
                {},            
                room.roomId,         
            );
>>>>>>> 8a63d35 ((create-room) - Ajout dialog de modification et suppression)
            setOpenEditRoom(false);
        } finally {
            setLoading(false);
        }
    };

    const form = useForm({
        defaultValues: {
<<<<<<< HEAD
            name: room.name
        },
        onSubmit: async ({ value }) => {
            await handleEditRoom(value);
        }
    });

    const { reset } = form;

    useEffect(() => {
        reset();
        setErrorMessage("");
    }, [openEditRoom, reset]);
=======
            name: room.name ?? '',
        },
        onSubmit: async ({ value }) => {
            handleEditRoom(value)
        },
    })

    useEffect(() => {
        form.reset();
    }, [openEditRoom])
>>>>>>> 8a63d35 ((create-room) - Ajout dialog de modification et suppression)

    return (
        <Dialog open={openEditRoom} onOpenChange={setOpenEditRoom}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Modifier le salon</DialogTitle>
                </DialogHeader>
<<<<<<< HEAD
                <form
                    onSubmit={e => {
                        e.preventDefault();
                        void form.handleSubmit();
                    }}
                >
                    <form.Field name="name">
                        {field => (
                            <div className="mt-2 space-y-2">
=======
                <form onSubmit={(e) => {
                    e.preventDefault();
                    form.handleSubmit();
                }}>            
                    <form.Field
                        name="name"
                        children={(field) => (
                            <div className="space-y-2 mt-2">
>>>>>>> 8a63d35 ((create-room) - Ajout dialog de modification et suppression)
                                <Label htmlFor="room-name">Nom</Label>
                                <Input
                                    id="room-name"
                                    placeholder="Nom du salon"
                                    value={field.state.value}
<<<<<<< HEAD
                                    onChange={e => {
                                        field.handleChange(e.target.value);
                                    }}
=======
                                    onChange={(e) => field.handleChange(e.target.value)}
>>>>>>> 8a63d35 ((create-room) - Ajout dialog de modification et suppression)
                                    required
                                />
                            </div>
                        )}
<<<<<<< HEAD
                    </form.Field>

                    {errorMessage && (
                        <p className="text-destructive mt-2 text-sm">{errorMessage}</p>
                    )}

                    <DialogFooter className="mt-5">
                        <Button
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
                            {loading && <LoaderCircle className="animate-spin" />}
                            Supprimer
                        </Button>
=======
                    />

                    <DialogFooter className='mt-5'>
                        <DialogClose
                            render={<Button type="button" variant="destructive" disabled={loading} onClick={handleDeleteRoom}/>}
                        >
                            Supprimer
                        </DialogClose>
>>>>>>> 8a63d35 ((create-room) - Ajout dialog de modification et suppression)
                        <DialogClose
                            render={<Button type="button" variant="outline" disabled={loading} />}
                        >
                            Annuler
                        </DialogClose>
<<<<<<< HEAD
                        <Button type="submit" variant="default" disabled={loading}>
=======
                        <Button type="submit" variant="default"  disabled={loading}>
>>>>>>> 8a63d35 ((create-room) - Ajout dialog de modification et suppression)
                            {loading && <LoaderCircle className="animate-spin" />}
                            Modifier
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
