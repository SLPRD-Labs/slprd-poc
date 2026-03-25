import { MatrixAvatar } from "@/components/common/avatar/matrix-avatar";
import type { Room } from "matrix-js-sdk";
import type { FC } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface Props {
    room: Room;
    isRound: boolean;
}

export const RoomAvatar: FC<Props> = ({ room, isRound }) => {
    const mxcAvatarUrl = room.getMxcAvatarUrl();

    return !isRound ? (
        <MatrixAvatar
            avatarUrl={mxcAvatarUrl}
            alt={room.name}
            fallbackText={room.name.charAt(0).toUpperCase()}
            className="size-full text-lg"
        />
    ) : (
        <Avatar>
            <AvatarImage
                src={
                    mxcAvatarUrl
                        ? room.getAvatarUrl(mxcAvatarUrl, 40, 40, "scale", true, false) ?? ""
                        : ""
                }
            />
            <AvatarFallback>{room.name[0]}</AvatarFallback>
        </Avatar>
    );
};
