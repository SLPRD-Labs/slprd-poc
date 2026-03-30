import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useCurrentUserQuery } from "@/hooks/use-current-user-query";
import { useMatrixClient } from "@/hooks/use-matrix-client";
import type { TrackReference } from "@livekit/components-react";
import { VideoTrack } from "@livekit/components-react";
import type { Participant } from "livekit-client";
import { ParticipantOverlay } from "./participant-overlay";

export const ParticipantTile = ({
    participant,
    cameraTracks,
    variant = "grid"
}: {
    participant: Participant;
    cameraTracks: TrackReference[];
    variant?: "grid" | "sidebar";
}) => {
    const track = cameraTracks.find(
        t =>
            t.participant.identity === participant.identity &&
            t.publication.track &&
            !t.publication.isMuted
    );

    const containerClasses =
        variant === "sidebar" ? "aspect-video min-h-[80px] max-h-[120px]" : "h-full min-h-0";

    const currentUserQuery = useCurrentUserQuery();
    const { client } = useMatrixClient();
    const isCurrentUser = currentUserQuery.isSuccess && currentUserQuery.data?.userId === participant.identity;
    const avatarMxc = isCurrentUser ? currentUserQuery.data?.avatarUrl : undefined;
    const avatarUrl = avatarMxc ? client.mxcUrlToHttp(avatarMxc) : undefined;

    return (
        <div
            className={`relative flex w-full items-center justify-center overflow-hidden rounded bg-gray-200 transition-colors dark:bg-gray-800 ${
                participant.isSpeaking ? "ring-2 ring-green-500" : ""
            } ${containerClasses}`}
        >
            {track ? (
                <VideoTrack
                    trackRef={track}
                    className="absolute inset-0 h-full w-full object-cover"
                />
            ) : (
                <Avatar className="h-24 w-24">
                    <AvatarImage src={avatarUrl ?? "https://github.com/evilrabbit.png"} />
                    <AvatarFallback>ER</AvatarFallback>
                </Avatar>
            )}

            <ParticipantOverlay participant={participant} />
        </div>
    );
};
