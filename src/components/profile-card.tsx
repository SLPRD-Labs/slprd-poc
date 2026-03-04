import type { FC } from "react";
import { Avatar, AvatarBadge, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    Item,
    ItemContent,
    ItemMedia,
    ItemTitle
} from "@/components/ui/item";

interface Props {
    displayName: string;
    avatarUrl: string;
    presenceStatus: "online" | "offline" | "unavailable";
}

export const ProfileCard : FC<Props> = props => {
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
                    <AvatarBadge className="bg-green-600 dark:bg-green-800" />
                </Avatar>
            </ItemMedia>
            <ItemContent>
                <ItemTitle>{props.displayName}</ItemTitle>
            </ItemContent>
        </Item>
    );
}
