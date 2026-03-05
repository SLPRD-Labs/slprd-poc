import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAvatarUrl } from "@/hooks/use-avatar-url";
import { cn } from "@/libs/utils/style";
import type { User } from "matrix-js-sdk";
import type { FC } from "react";

interface Props {
    user: User;
    className?: string;
}

export const UserAvatar: FC<Props> = ({ user, className }) => {
    const avatarUrl = useAvatarUrl(user.avatarUrl);

    return (
        <Avatar className={cn("rounded-xl after:rounded-xl", className)}>
            <AvatarImage
                src={avatarUrl ?? undefined}
                alt={user.displayName ?? user.userId}
                className="rounded-xl"
            />
            {avatarUrl === null && (
                <AvatarFallback className="rounded-xl">
                    {user.displayName?.charAt(0).toUpperCase() ?? "U"}
                </AvatarFallback>
            )}
        </Avatar>
    );
};
