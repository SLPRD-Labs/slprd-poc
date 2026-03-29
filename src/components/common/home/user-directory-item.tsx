import type { FC } from "react";
import type { MatrixPublicUser } from "@/hooks/use-user-directory";
import { Button } from "@/components/ui/button";
import type { UserPresenceData } from "@/hooks/use-presence";
import { MessageSquare } from "lucide-react";
import { UserAvatar } from "@/components/common/avatar/user-avatar";

interface Props {
    user: MatrixPublicUser;
    presence: UserPresenceData;
}

export const UserDirectoryItem: FC<Props> = ({ user, presence }) => {
    const userStatus = presence.status;

    return (
        <div className="hover:bg-accent flex items-center justify-between rounded-md p-3 transition-colors">
            <div className="flex items-center gap-3">
                <div className="relative shrink-0">
                    <UserAvatar
                        userName={user.display_name ?? user.user_id}
                        userAvatarUrl={user.avatar_url ?? undefined}
                        className="size-8"
                        rounded
                    />
                    <span
                        className={`border-background absolute -right-0.5 -bottom-0.5 h-3 w-3 rounded-full border-2 bg-green-500`}
                        title={userStatus}
                    />
                </div>
                <div className="flex flex-col">
                    <span className="text-sm font-medium">{user.display_name ?? user.user_id}</span>
                </div>
            </div>
            <div className="flex gap-2">
                <Button size="sm" variant="outline">
                    <MessageSquare className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );
};
