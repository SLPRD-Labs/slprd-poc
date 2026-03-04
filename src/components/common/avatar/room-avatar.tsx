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
        <Avatar className="rounded-md after:rounded-md">
            <AvatarImage
                src={avatarUrl ?? undefined}
                alt={room.name}
                className="rounded-md grayscale"
            />
            {avatarUrl !== undefined && (
                <AvatarFallback className="rounded-md">
                    {room.name.charAt(0).toUpperCase()}
                </AvatarFallback>
            )}
        </Avatar>
    );
};
