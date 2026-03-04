import {
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuPortal,
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger
} from "@/components/ui/dropdown-menu";
import { useThemeContext } from "@/contexts/theme-context/theme-context";
import { useIsMobile } from "@/hooks/use-mobile";
import { Laptop, Moon, Sun } from "lucide-react";
import type { FC } from "react";

export const NavThemeSwitcher: FC = () => {
    const { theme, systemTheme, setLightTheme, setDarkTheme, setSystemTheme } = useThemeContext();

    const currentTheme = theme === "system" ? systemTheme : theme;

    const isMobile = useIsMobile();

    return (
        <DropdownMenuSub>
            <DropdownMenuSubTrigger>
                {currentTheme === "light" && <Sun />}
                {currentTheme === "dark" && <Moon />}
                <span className="truncate">Theme</span>
            </DropdownMenuSubTrigger>
            <DropdownMenuPortal>
                <DropdownMenuSubContent
                    side={isMobile ? "top" : "right"}
                    sideOffset={9}
                    align="center"
                >
                    <DropdownMenuGroup>
                        <DropdownMenuItem onClick={setLightTheme}>
                            <Sun />
                            <span>Light</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={setDarkTheme}>
                            <Moon />
                            <span>Dark</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={setSystemTheme}>
                            <Laptop />
                            <span>System</span>
                        </DropdownMenuItem>
                    </DropdownMenuGroup>
                </DropdownMenuSubContent>
            </DropdownMenuPortal>
        </DropdownMenuSub>
    );
};
