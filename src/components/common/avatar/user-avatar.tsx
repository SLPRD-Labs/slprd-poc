import { MatrixAvatar } from "@/components/common/avatar/matrix-avatar";
import type { FC } from "react";

interface Props {
    userName: string;
    userAvatarUrl: string | undefined;
    className?: string;
    rounded: boolean;
}

export const UserAvatar: FC<Props> = ({ className, userName, userAvatarUrl, rounded }) => {
    let fallbackText = userName.charAt(0).toUpperCase();
    if (fallbackText === "") {
        fallbackText = "U";
    }

    return (
        <MatrixAvatar
            avatarUrl={userAvatarUrl}
            alt={userName}
            fallbackText={fallbackText}
            className={className}
            isRounded={rounded}
        />
    );
};
