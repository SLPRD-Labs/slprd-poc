import { MainLayout } from "@/layouts/main";
import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_mainLayout")({
    beforeLoad: ({ context, location }) => {
        if (context.auth.session === null) {
            // eslint-disable-next-line @typescript-eslint/only-throw-error
            throw redirect({
                to: "/login",
                search: {
                    redirect: location.href
                }
            });
        }
    },
    loader: ctx => {
        return {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            session: ctx.context.auth.session!
        };
    },
    component: MainLayout
});
