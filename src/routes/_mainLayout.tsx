import { MainLayout } from "@/layouts/main";
import { loginLinkOptions } from "@/libs/utils/router";
import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_mainLayout")({
    beforeLoad: ({ context, location }) => {
        if (context.authContext.session === null) {
            // eslint-disable-next-line @typescript-eslint/only-throw-error
            throw redirect(loginLinkOptions(location));
        }
    },
    component: MainLayout
});
