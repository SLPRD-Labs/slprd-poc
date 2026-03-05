import {
    DropdownMenuGroup,
    DropdownMenuPortal,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger
} from "@/components/ui/dropdown-menu";
import { useThemeContext } from "@/contexts/theme-context/theme-context";
import { useIsMobile } from "@/hooks/use-mobile";
import { Laptop, Moon, Sun } from "lucide-react";
import type { FC } from "react";

export const NavThemeSwitcher: FC = () => {
    const { theme, systemTheme, setTheme } = useThemeContext();

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
                        <DropdownMenuRadioGroup value={theme} onValueChange={setTheme}>
                            <DropdownMenuRadioItem value="light">
                                <Sun />
                                <span>Light</span>
                            </DropdownMenuRadioItem>
                            <DropdownMenuRadioItem value="dark">
                                <Moon />
                                <span>Dark</span>
                            </DropdownMenuRadioItem>
                            <DropdownMenuRadioItem value="system">
                                <Laptop />
                                <span>System</span>
                            </DropdownMenuRadioItem>
                        </DropdownMenuRadioGroup>
                    </DropdownMenuGroup>
                </DropdownMenuSubContent>
            </DropdownMenuPortal>
        </DropdownMenuSub>
    );
};
