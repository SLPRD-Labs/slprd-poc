import { useLocalStorage } from "@/hooks/use-local-storage";
import { useMediaQuery } from "@/hooks/use-media-query";
import { useLayoutEffect } from "react";

type Theme = "light" | "dark" | "system";

interface UseThemeOutput {
    theme: Theme;
    systemTheme: Exclude<Theme, "system">;
    setDarkTheme: () => void;
    setLightTheme: () => void;
    setSystemTheme: () => void;
}

const COLOR_SCHEME_MEDIA_QUERY = "(prefers-color-scheme: dark)";

export const useTheme = (): UseThemeOutput => {
    const isSystemDarkTheme = useMediaQuery(COLOR_SCHEME_MEDIA_QUERY);

    const systemTheme = isSystemDarkTheme ? "dark" : "light";

    const [theme, setTheme] = useLocalStorage<Theme>("theme", "system");

    useLayoutEffect(() => {
        const root = document.documentElement;
        const currentTheme = theme === "system" ? systemTheme : theme;

        root.classList.remove("light", "dark");
        root.classList.add(currentTheme);
    }, [systemTheme, theme]);

    return {
        theme,
        systemTheme,
        setLightTheme: () => {
            setTheme("light");
        },
        setDarkTheme: () => {
            setTheme("dark");
        },
        setSystemTheme: () => {
            setTheme("system");
        }
    };
};
