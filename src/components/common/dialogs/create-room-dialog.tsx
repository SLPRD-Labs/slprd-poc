'use client';

import { Button } from '@/components/ui/button';
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { LoaderCircle, Volume2, Hash } from 'lucide-react';
import { Visibility, Preset, EventType, RoomType } from "matrix-js-sdk";
import { useEffect, useState } from 'react';
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
    const { client } = useMatrixClient();

    const path = window.location.pathname;
    const parts = path.split("/");
    const currentSpaceId = decodeURIComponent(parts[2]);

    const handleCreateRoom = async (value: {
        name: string;
        type: string;
    }) => 
    {
        setLoading(true);

        const isCall = value.type !== 'text';

        try {
            const { room_id } = await client.createRoom({
                name: value.name,
                visibility:  Visibility.Public,
                preset: Preset.PublicChat,
                creation_content: isCall
                    ? { type: RoomType.ElementVideo }
                    : undefined,
                power_level_content_override: { events_default: 0 }
            });

            await client.sendStateEvent(
                currentSpaceId,
                EventType.SpaceChild,
                { via: [client.getDomain()!] },
                room_id,
            );
            setOpenCreateRoom(false);
        } finally {
            setLoading(false);
        }
    };

    const form = useForm({
        defaultValues: {
            name: '',
            type: 'public',
        },
        onSubmit: async ({ value }) => {
            handleCreateRoom(value)
        },
    })

    useEffect(() => {
        form.reset();
    }, [openCreateRoom])

    return (
        <Dialog open={openCreateRoom} onOpenChange={setOpenCreateRoom}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Créer un salon</DialogTitle>
                </DialogHeader>
                <form onSubmit={(e) => {
                    e.preventDefault();
                    form.handleSubmit();
                }}>
                    <form.Field
                        name="type"
                        children={(field) => (
                        <RadioGroup
                            value={field.state.value}
                            onValueChange={(val) => { field.handleChange(val) }}
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

                <DialogFooter className='mt-5'>
                    <DialogClose
                        render={<Button type="button" variant="outline" disabled={loading} />}
                    >
                        Annuler
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
