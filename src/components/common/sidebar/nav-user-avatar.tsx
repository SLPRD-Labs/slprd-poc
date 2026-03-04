import { UserAvatar } from "@/components/common/avatar/user-avatar";
import type { User } from "matrix-js-sdk";
import type { FC } from "react";

interface Props {
    currentUser: User;
}

export const NavUserAvatar: FC<Props> = ({ currentUser }) => {
    return (
        <>
            <UserAvatar user={currentUser} />
            <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">
                    {currentUser.displayName ?? currentUser.userId}
                </span>
                {currentUser.displayName !== undefined && (
                    <span className="truncate text-xs">{currentUser.userId}</span>
                )}
            </div>
        </>
    );
};
