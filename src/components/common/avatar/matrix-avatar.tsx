import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAvatarUrl } from "@/hooks/use-avatar-url";
import { cn } from "@/libs/utils/style";
import type { FC } from "react";

interface Props {
    avatarUrl: string | null | undefined;
    alt: string;
    fallbackText: string;
    className?: string;
}

export const MatrixAvatar: FC<Props> = ({ avatarUrl, alt, fallbackText, className }) => {
    const imgUrl = useAvatarUrl(avatarUrl);

    return (
        <Avatar className={cn("rounded-xl after:rounded-xl", className)}>
            <AvatarImage src={imgUrl ?? undefined} alt={alt} className="rounded-xl" />
            {imgUrl === null && (
                <AvatarFallback className="rounded-xl text-[length:inherit] group-data-[size=sm]/avatar:text-[length:inherit]">
                    {fallbackText}
                </AvatarFallback>
            )}
        </Avatar>
    );
};
