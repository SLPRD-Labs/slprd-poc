import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import type { FC } from "react";

export const Header: FC = () => {
    return (
        <header className="sticky top-0 flex shrink-0 items-center gap-2 border-b p-3">
            <SidebarTrigger />
            <Separator
                orientation="vertical"
                className="mr-2 data-vertical:h-4 data-vertical:self-auto"
            />
        </header>
    );
};
