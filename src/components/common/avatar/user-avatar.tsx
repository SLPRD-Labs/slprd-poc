import { MatrixAvatar } from "@/components/common/avatar/matrix-avatar";
import type { User } from "matrix-js-sdk";
import type { FC } from "react";

interface Props {
    user: User;
    className?: string;
}

export const UserAvatar: FC<Props> = ({ user, className }) => {
    let fallbackText = user.displayName?.charAt(0).toUpperCase();
    if (fallbackText === undefined || fallbackText === "") {
        fallbackText = "U";
    }

    return (
        <MatrixAvatar
            avatarUrl={user.avatarUrl}
            alt={user.displayName ?? user.userId}
            fallbackText={fallbackText}
            className={className}
        />
    );
};
