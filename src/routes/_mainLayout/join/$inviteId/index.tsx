import { JoinInvitePage } from "@/pages/join-invite";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_mainLayout/join/$inviteId/")({
    component: JoinInvitePage
});
