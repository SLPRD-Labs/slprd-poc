import { Login } from "@/pages/login";
import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/login")({
    validateSearch: (search): { redirect?: string } => {
        const redirect = search.redirect;
        if (typeof redirect !== "string" || redirect === "") {
            return {};
        }
        return {
            redirect
        };
    },
    beforeLoad: ({ context, search }) => {
        if (context.authContext.session !== null) {
            // eslint-disable-next-line @typescript-eslint/only-throw-error
            throw redirect({ to: search.redirect });
        }
    },
    component: Login
});
