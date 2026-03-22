import type { FC } from "react";
import type { MatrixPublicUser } from "@/hooks/use-user-directory";
import { Button } from "@/components/ui/button";
import type { UserPresenceData } from "@/hooks/use-presence";
import { MessageSquare } from "lucide-react";

interface props {
    user: MatrixPublicUser;
    presence: UserPresenceData;
}

export const UserDirectoryItem: FC<props> = ({ user, presence }) => {
    const userStatus = presence.status;

    return (
        <div className="flex items-center justify-between p-3 hover:bg-slate-50">
            <div className="flex items-center gap-3">
                <div className="relative">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-200 font-bold">
                        {user.display_name?.charAt(0) ?? "?"}
                    </div>

                    <span
                        className="absolute right-0 bottom-0 h-3 w-3 rounded-full border-2 border-white bg-green-500"
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
                <Button size="sm" variant="outline">
                    Call
                </Button>
            </div>
        </div>
    );
};
