import type { FC } from "react";
import { Avatar, AvatarBadge, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Item, ItemContent, ItemMedia, ItemTitle } from "@/components/ui/item";
import { useAvatarUrl } from "@/hooks/use-avatar-url";

interface Props {
    displayName: string;
    avatarUrl: string | undefined;
    presenceStatus: "online" | "offline" | "unavailable";
}

export const ProfileCard: FC<Props> = props => {
    const avatarUrl = useAvatarUrl(props.avatarUrl);
    
    return (
        <Item variant="muted" className="w-full">
            <ItemMedia variant="icon">
                <Avatar>
                    <AvatarImage src={avatarUrl ?? undefined} alt={props.displayName} />
                    <AvatarFallback>{props.displayName.charAt(0).toUpperCase()}</AvatarFallback>
                    {props.presenceStatus === "online" && <AvatarBadge className="bg-green-500" />}
                    {props.presenceStatus === "unavailable" && <AvatarBadge className="bg-red-500" />}
                    {props.presenceStatus === "offline" && <AvatarBadge className="bg-gray-500" />}
                </Avatar>
            </ItemMedia>
            <ItemContent>
                {props.presenceStatus === "online" && <ItemTitle>{props.displayName}</ItemTitle>}
                {props.presenceStatus === "offline" && (
                    <ItemTitle className="text-gray-500">{props.displayName}</ItemTitle>
                )}
            </ItemContent>
        </Item>
    );
};
