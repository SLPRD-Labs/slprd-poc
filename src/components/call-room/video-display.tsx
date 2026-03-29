import { useParticipants, VideoTrack } from "@livekit/components-react";
import { Track } from "livekit-client";
import { ParticipantOverlay } from "./participant-overlay";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

export const VideoDisplay = () => {

    const participants = useParticipants();

    const gridCols = getGridCols(participants.length);

    return (
        <div className={`flex-1 w-full h-full grid gap-2 p-2 ${gridCols}`}>            
            {participants.map(participant => {
                const videoPub = participant
                    .getTrackPublications()
                    .find(pub => pub.source === Track.Source.Camera);

                const hasVideo = !!videoPub?.track;

                return (
                    <div
                        key={participant.identity}
                        className={`relative bg-black rounded overflow-hidden flex items-center justify-center ${
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
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <>
                                {/* <div className="flex flex-col items-center justify-center">
                                    <div className="h-20 w-20 rounded-full bg-gray-600 flex items-center justify-center text-2xl">
                                        {participant.identity[0]?.toUpperCase()}
                                    </div>
                                </div> */}
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