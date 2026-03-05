import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAvatarUrl } from "@/hooks/use-avatar-url";
import type { Room } from "matrix-js-sdk";
import type { FC } from "react";

interface Props {
    room: Room;
}

export const RoomAvatar: FC<Props> = ({ room }) => {
    const avatarUrl = useAvatarUrl(room.getMxcAvatarUrl());

    return (
        <Avatar className="size-full rounded-xl after:rounded-xl">
            <AvatarImage
                src={avatarUrl ?? undefined}
                alt={room.name}
                className="rounded-xl grayscale"
            />
            {avatarUrl === null && (
                <AvatarFallback className="rounded-xl text-lg">
                    {room.name.charAt(0).toUpperCase()}
                </AvatarFallback>
            )}
        </Avatar>
    );
};
