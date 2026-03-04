import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAvatarUrl } from "@/hooks/use-avatar-url";
import type { User } from "matrix-js-sdk";
import type { FC } from "react";

interface Props {
    user: User;
}

export const UserAvatar: FC<Props> = ({ user }) => {
    const avatarUrl = useAvatarUrl(user.avatarUrl);

    return (
        <Avatar className="h-8 w-8 rounded-md after:rounded-md">
            <AvatarImage
                src={avatarUrl ?? undefined}
                alt={user.displayName}
                className="rounded-md"
            />
            {avatarUrl !== undefined && (
                <AvatarFallback className="rounded-md">
                    {user.displayName?.charAt(0).toUpperCase() ?? "U"}
                </AvatarFallback>
            )}
        </Avatar>
    );
};
