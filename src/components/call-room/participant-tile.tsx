import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { VideoTrack, type TrackReference } from "@livekit/components-react";
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
        t => t.participant.identity === participant.identity
    );

    const containerClasses =
        variant === "sidebar"
            ? "aspect-video min-h-[80px] max-h-[120px]"
            : "h-full min-h-0";

    return (
        <div
            className={`relative w-full bg-gray-200 dark:bg-gray-800 transition-colors rounded overflow-hidden flex items-center justify-center ${
                participant.isSpeaking ? "ring-2 ring-green-500" : ""
            } ${containerClasses}`}
        >
            {track ? (
                <VideoTrack
                    trackRef={track}
                    className="absolute inset-0 w-full h-full object-cover"
                />
            ) : (
                <Avatar className="h-24 w-24">
                    <AvatarImage src="https://github.com/evilrabbit.png" />
                    <AvatarFallback>ER</AvatarFallback>
                </Avatar>
            )}

            <ParticipantOverlay participant={participant} />
        </div>
    );
};