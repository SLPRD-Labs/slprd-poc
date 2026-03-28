import { MatrixAvatar } from "@/components/common/avatar/matrix-avatar";
import type { Room } from "matrix-js-sdk";
import type { FC } from "react";
import { cn } from "@/libs/utils/style";

interface Props {
    room: Room;
    isRounded: boolean;
    className?: string;
}

export const RoomAvatar: FC<Props> = ({ room, isRounded, className }) => {
    return (
        <MatrixAvatar
            avatarUrl={room.getMxcAvatarUrl()}
            alt={room.name}
            isRounded={isRounded}
            fallbackText={room.name.charAt(0).toUpperCase()}
            className={cn("size-full text-lg", className)}
        />
    );
};
