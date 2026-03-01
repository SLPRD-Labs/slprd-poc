import type { useTheme } from "@/hooks/use-theme";
import { createContext, use } from "react";

export type IThemeContext = ReturnType<typeof useTheme>;

export const ThemeContext = createContext<IThemeContext | null>(null);

export const useThemeContext = (): IThemeContext => {
    const themeContext = use(ThemeContext);
    if (themeContext === null) {
        throw new Error("useThemeContext called without ThemeContextProvider");
    }
    return themeContext;
};
