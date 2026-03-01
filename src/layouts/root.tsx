import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeContextProvider } from "@/contexts/theme-context/theme-context-provider";
import { Outlet } from "@tanstack/react-router";
import type { FC } from "react";

export const RootLayout: FC = () => {
    return (
        <ThemeContextProvider>
            <TooltipProvider>
                <Outlet />
            </TooltipProvider>
        </ThemeContextProvider>
    );
};
