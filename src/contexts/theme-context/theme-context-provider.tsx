import type { IThemeContext } from "@/contexts/theme-context/theme-context";
import { ThemeContext } from "@/contexts/theme-context/theme-context";
import { useTheme } from "@/hooks/use-theme";
import type { FC, PropsWithChildren } from "react";
import { useMemo } from "react";

export const ThemeContextProvider: FC<PropsWithChildren> = ({ children }) => {
    const { theme, systemTheme, setLightTheme, setDarkTheme, setSystemTheme } = useTheme();

    const themeContextValue = useMemo<IThemeContext>(
        () => ({
            theme,
            systemTheme,
            setLightTheme,
            setDarkTheme,
            setSystemTheme
        }),
        [theme, systemTheme, setLightTheme, setDarkTheme, setSystemTheme]
    );

    return <ThemeContext value={themeContextValue}>{children}</ThemeContext>;
};
