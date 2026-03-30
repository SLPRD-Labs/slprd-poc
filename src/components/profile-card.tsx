import type { FC } from "react";
import { Avatar, AvatarBadge, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Item, ItemContent, ItemMedia, ItemTitle } from "@/components/ui/item";
import { useMatrixClient } from "@/hooks/use-matrix-client";
import { useCurrentUserQuery } from "@/hooks/use-current-user-query";
interface Props {
    displayName: string;
    avatarUrl: string | undefined;
    presenceStatus: "online" | "offline" | "unavailable";
}

export const ProfileCard: FC<Props> = ({ displayName, avatarUrl, presenceStatus }) => {
    const { client } = useMatrixClient();
    const currentUserQuery = useCurrentUserQuery();
    const isCurrentUser =
        currentUserQuery.isSuccess && currentUserQuery.data?.displayName === displayName;
    const avatarMxc = isCurrentUser ? currentUserQuery.data?.avatarUrl : avatarUrl;
    const resolvedAvatarUrl = avatarMxc ? client.mxcUrlToHttp(avatarMxc) : null;
    const initial = displayName.trim().charAt(0).toUpperCase() || "?";

    return (
        <Item variant="muted" className="w-full">
            <ItemMedia variant="icon">
                <Avatar>
                    <AvatarImage src={resolvedAvatarUrl ?? undefined} alt={displayName} />
                    <AvatarFallback>{initial}</AvatarFallback>
                    {presenceStatus === "online" && <AvatarBadge className="bg-green-500" />}
                    {presenceStatus === "unavailable" && <AvatarBadge className="bg-red-500" />}
                    {presenceStatus === "offline" && <AvatarBadge className="bg-gray-500" />}
                </Avatar>
            </ItemMedia>
            <ItemContent>
                <ItemTitle className={presenceStatus === "offline" ? "text-gray-500" : ""}>
                    {displayName}
                </ItemTitle>
            </ItemContent>
        </Item>
    );
};
