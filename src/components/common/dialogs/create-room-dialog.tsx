'use client';

import { Button } from '@/components/ui/button';
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { LoaderCircle, Volume2, Lock } from 'lucide-react';
import { Visibility, Preset } from "matrix-js-sdk";
import { useEffect, useState, type SyntheticEvent } from 'react';
import { useForm } from '@tanstack/react-form'
import { useMatrixClient } from '@/hooks/use-matrix-client';

export function CreateRoomDialog({
    openCreateRoom,
    setOpenCreateRoom,
}: {
    openCreateRoom: boolean;
    setOpenCreateRoom: (open: boolean) => void;
}) {
    const [loading, setLoading] = useState<boolean>(false);
    const [roomId, setRoomId] = useState<string | null>(null);
    const { client } = useMatrixClient();

    const handleCreateRoom = async (value: {
        name: string;
        users: string;
        private: boolean;
    }) => 
    {
        setLoading(true);

        const inviteRaw = value.users;
        const invite = inviteRaw
            ? inviteRaw.split(",").map(s => s.trim()).filter(Boolean)
            : [];

        try {
            const { room_id } = await client.createRoom({
                name: value.name,
                visibility: value.private ? Visibility.Private : Visibility.Public,
                preset: value.private ? Preset.PrivateChat : Preset.PublicChat,
                invite,
                power_level_content_override: { events_default: 0 },
            });
            setRoomId(room_id);
            console.log("Room created with ID:", room_id);
        } finally {
            setLoading(false);
        }
    };


    const form = useForm({
        defaultValues: {
            name: '',
            users: '',
            private: false,
        },
        onSubmit: async ({ value }) => {
            handleCreateRoom(value)
            console.log(value)
        },
    })

    return (
        <Dialog open={openCreateRoom} onOpenChange={setOpenCreateRoom}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Créer un salon</DialogTitle>
                </DialogHeader>
                <form onSubmit={(e) => {
                    e.preventDefault()
                    form.handleSubmit()
                }}>
                    <form.Field
                        name="private"
                        children={(field) => (
                        <RadioGroup
                            value={field.state.value ? 'private' : 'public'}
                            onValueChange={(val) => {
                                const isPrivate = val === 'private';
                                form.reset({
                                    name: '',
                                    users: '',
                                    private: isPrivate,
                                });
                            }}
                            className="mt-5"
                        >
                            <div className="flex items-center gap-3">
                                <RadioGroupItem value="public" id="public" />
                                <Label htmlFor="public" className="flex items-center gap-2">
                                    <Volume2 size={16} /> Vocal public
                                </Label>
                                </div>

                                <div className="flex items-center gap-3">
                                <RadioGroupItem value="private" id="private" />
                                <Label htmlFor="private" className="flex items-center gap-2">
                                    <Lock size={16} /> Vocal privé
                                </Label>
                            </div>
                        </RadioGroup>
                        )}
                    />
            

                    <form.Field
                        name="name"
                        children={(field) => (
                        <Input
                            className="mt-5"
                            placeholder="Nom du salon"
                            value={field.state.value}
                            onChange={(e) => field.handleChange(e.target.value)}
                        />
                        )}
                    />

                    <form.Subscribe
                        selector={(state) => state.values.private}
                        children={(isPrivate) =>
                        isPrivate ? (
                            <form.Field
                            name="users"
                            children={(field) => (
                                <Input
                                className="mt-2"
                                placeholder="@alice, @bob"
                                value={field.state.value}
                                onChange={(e) => field.handleChange(e.target.value)}
                                />
                            )}
                            />
                        ) : null
                        }
                    />

                <DialogFooter className='mt-5'>
                    <DialogClose>
                        <Button type="button" variant="outline" disabled={loading}>
                            Annuler
                        </Button>
                    </DialogClose>
                    <Button type="submit" variant="default"  disabled={loading}>
                        {loading && <LoaderCircle className="animate-spin" />}
                        Créer
                    </Button>
                </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
