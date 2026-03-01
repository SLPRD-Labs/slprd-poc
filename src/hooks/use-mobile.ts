import { useMediaQuery } from "@/hooks/use-media-query";

const MOBILE_BREAKPOINT = 768;

export const useIsMobile = () => {
    return useMediaQuery(`(max-width: ${(MOBILE_BREAKPOINT - 1).toString()}px)`);
};
