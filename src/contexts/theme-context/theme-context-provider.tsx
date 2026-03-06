import { ThemeContext } from "@/contexts/theme-context/theme-context";
import { useTheme } from "@/hooks/use-theme";
import type { FC, PropsWithChildren } from "react";

export const ThemeContextProvider: FC<PropsWithChildren> = ({ children }) => {
    const themeContext = useTheme();

    return <ThemeContext value={themeContext}>{children}</ThemeContext>;
};
