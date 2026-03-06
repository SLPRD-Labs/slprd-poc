import type { ParsedLocation } from "@tanstack/react-router";
import { linkOptions } from "@tanstack/react-router";

export const loginLinkOptions = (location: ParsedLocation) => {
    let redirectTo: string | undefined = location.href;
    if (redirectTo === "" || redirectTo === "/") {
        redirectTo = undefined;
    }

    return linkOptions({
        to: "/login",
        search: {
            redirect: redirectTo
        },
        replace: true
    });
};
