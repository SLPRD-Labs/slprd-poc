import { useParticipants, VideoTrack } from "@livekit/components-react";
import { Track } from "livekit-client";
import { ParticipantOverlay } from "./participant-overlay";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

export const VideoDisplay = () => {

    const participants = useParticipants();

    const gridCols = getGridCols(participants.length);

    return (
        <div className={`flex-1 w-full h-full min-h-0 grid auto-rows-fr gap-2 p-2 ${gridCols}`}>            
            {participants.map(participant => {
                const videoPub = participant
                    .getTrackPublications()
                    .find(pub => pub.source === Track.Source.Camera);

                const hasVideo = !!videoPub?.track;

                return (
                    <div
                        key={participant.identity}
                        className={`relative w-full h-full min-h-0 max-h-full bg-gray-200 dark:bg-gray-800 transition-colors rounded overflow-hidden flex items-center justify-center ${
                            participant.isSpeaking ? "ring-2 ring-green-500" : ""
                        }`}
                    >
                        {hasVideo ? (
                            <VideoTrack
                                trackRef={{
                                    participant,
                                    publication: videoPub,
                                    source: videoPub.source
                                }}
                                className="absolute inset-0 w-full h-full object-cover"
                            />
                        ) : (
                            <>
                                <Avatar className="h-24 w-24">
                                    <AvatarImage src="https://github.com/evilrabbit.png" alt="@evilrabbit" />
                                    <AvatarFallback>ER</AvatarFallback>
                                </Avatar>
                            </>
                        )}

                        <ParticipantOverlay participant={participant} />
                    </div>
                );
            })}
        </div>
    );
};

const getGridCols = (count: number) => {
    if (count <= 1) return "grid-cols-1";
    if (count === 2) return "grid-cols-2";
    if (count <= 4) return "grid-cols-2";
    if (count <= 6) return "grid-cols-3";
    return "grid-cols-4";
};