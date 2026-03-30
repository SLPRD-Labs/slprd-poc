import type { Participant } from "livekit-client";
import { Mic, MicOff, Video, VideoOff } from "lucide-react";

export const ParticipantOverlay = ({ participant }: { participant: Participant }) => {
    const isMuted = !participant.isMicrophoneEnabled;
    const isCamOff = !participant.isCameraEnabled;

    const displayName = participant.identity.split(":")[0].replace("@", "");

    return (
        <div className="absolute right-1 bottom-1 left-1 flex items-center justify-between text-xs">
            <span className="truncate rounded bg-black/50 px-2 py-1">{displayName}</span>

            <div className="flex gap-1 rounded bg-black/50 px-2 py-1">
                {!isMuted && <Mic className="h-4 w-4 text-green-500" />}
                {isMuted && <MicOff className="h-4 w-4 text-gray-400" />}
                {!isCamOff && <Video className="h-4 w-4 text-green-500" />}
                {isCamOff && <VideoOff className="h-4 w-4 text-gray-400" />}
            </div>
        </div>
    );
};
