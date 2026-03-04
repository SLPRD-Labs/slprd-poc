import type { FC } from "react";
import { Avatar, AvatarBadge, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Item, ItemContent, ItemMedia, ItemTitle } from "@/components/ui/item";

interface Props {
    displayName: string;
    avatarUrl: string;
    presenceStatus: "online" | "offline" | "unavailable";
}

export const ProfileCard: FC<Props> = props => {
    return (
        <Item variant="muted" className="w-full">
            <ItemMedia variant="icon">
                <Avatar>
                    {props.avatarUrl ? (
                        <AvatarImage src={props.avatarUrl} alt="userAvatar" />
                    ) : (
                        <AvatarImage src="https://github.com/evilrabbit.png" alt="@evilrabbit" />
                    )}
                    <AvatarFallback>ER</AvatarFallback>
                    {props.presenceStatus === "online" && <AvatarBadge className="bg-green-500" />}
                    {props.presenceStatus === "unavailable" && (
                        <AvatarBadge className="bg-red-500" />
                    )}
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
