import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAvatarUrl } from "@/hooks/use-avatar-url";
import { cn } from "@/libs/utils/style";
import type { FC } from "react";

interface Props {
    avatarUrl: string | null | undefined;
    alt: string;
    fallbackText: string;
    className?: string;
    isRounded?: boolean;
}

export const MatrixAvatar: FC<Props> = ({ avatarUrl, alt, fallbackText, className, isRounded }) => {
    const imgUrl = useAvatarUrl(avatarUrl);
    const roundedClass = isRounded ? "rounded-full" : "rounded-xl";

    return (
        <Avatar className={cn(roundedClass, `after:${roundedClass}`, className)}>
            <AvatarImage src={imgUrl ?? undefined} alt={alt} className={roundedClass} />
            {imgUrl === null && (
                <AvatarFallback
                    className={cn(
                        roundedClass,
                        "text-[length:inherit] group-data-[size=sm]/avatar:text-[length:inherit]"
                    )}
                >
                    {fallbackText}
                </AvatarFallback>
            )}
        </Avatar>
    );
};
