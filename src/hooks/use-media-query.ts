import { useEffect, useState } from "react";

export const useMediaQuery = (
    mediaQuery: string,
    handleMatchChange?: (matches: boolean) => void
): boolean => {
    const [matches, setMatches] = useState(window.matchMedia(mediaQuery).matches);

    useEffect(() => {
        const matchMedia = window.matchMedia(mediaQuery);

        const handleChange = (e?: MediaQueryListEvent) => {
            setMatches(matchMedia.matches);
            if (e) {
                handleMatchChange?.(matchMedia.matches);
            }
        };

        handleChange();
        matchMedia.addEventListener("change", handleChange);

        return () => {
            matchMedia.removeEventListener("change", handleChange);
        };
    }, [mediaQuery, handleMatchChange]);

    return matches;
};
