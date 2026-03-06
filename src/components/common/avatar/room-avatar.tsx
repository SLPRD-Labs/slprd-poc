import { MatrixAvatar } from "@/components/common/avatar/matrix-avatar";
import type { Room } from "matrix-js-sdk";
import type { FC } from "react";

interface Props {
    room: Room;
}

export const RoomAvatar: FC<Props> = ({ room }) => {
    return (
        <MatrixAvatar
            avatarUrl={room.getMxcAvatarUrl()}
            alt={room.name}
            fallbackText={room.name.charAt(0).toUpperCase()}
            className="size-full text-lg"
        />
    );
};
