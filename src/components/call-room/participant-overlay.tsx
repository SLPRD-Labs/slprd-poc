import type { Participant } from "livekit-client";
import { Mic, MicOff, Video, VideoOff } from "lucide-react";

export const ParticipantOverlay = ({ participant }: { participant: Participant }) => {
    const isMuted = !participant.isMicrophoneEnabled;
    const isCamOff = !participant.isCameraEnabled;

    const displayName = participant.identity.split(":")[0].replace("@", "");

    return (
        <div className="absolute bottom-1 left-1 right-1 flex justify-between items-center text-xs">
            <span className="truncate bg-black/50 px-2 rounded py-1">{displayName}</span>

            <div className="flex gap-1 bg-black/50 px-2 rounded py-1">
                {!isMuted && <Mic className="text-green-500 w-4 h-4" />}
                {isMuted && <MicOff className="text-gray-400 w-4 h-4" />}
                {!isCamOff && <Video className="text-green-500 w-4 h-4" />}
                {isCamOff && <VideoOff className="text-gray-400 w-4 h-4" />}
            </div>
        </div>
    );
};