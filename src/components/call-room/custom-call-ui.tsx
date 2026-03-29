import { RoomAudioRenderer, useLocalParticipant } from "@livekit/components-react";
import {
    Mic, 
    MicOff,
    Video,
    VideoOff,
    ScreenShare,
    ScreenShareOff
} from "lucide-react";
import { VideoDisplay } from "./video-display";

export const CustomCallUI = () => {
    const { localParticipant } = useLocalParticipant();

    return (
        <div className="flex h-full flex-col bg-black text-white">
            <VideoDisplay />

            <div className="flex justify-center gap-4 border-t p-3 bg-gray-900">
                <button
                    onClick={() =>
                        localParticipant.setMicrophoneEnabled(
                            !localParticipant.isMicrophoneEnabled
                        )
                    }
                    className={`px-3 py-1 rounded ${
                        localParticipant.isMicrophoneEnabled
                            ? "bg-green-600"
                            : "bg-gray-700"
                    }`}
                >
                    {localParticipant.isMicrophoneEnabled
                        ? <Mic className="text-white"/>
                        : <MicOff className="text-red-500"/>
                    }
                </button>

                <button
                    onClick={() =>
                        localParticipant.setCameraEnabled(
                            !localParticipant.isCameraEnabled
                        )
                    }
                    className={`px-3 py-1 rounded ${
                        localParticipant.isCameraEnabled
                            ? "bg-green-600"
                            : "bg-gray-700"
                    }`}
                >
                    {localParticipant.isCameraEnabled
                        ? <Video /> 
                        : <VideoOff />
                    }
                </button>

                <button
                    onClick={() =>
                        localParticipant.setScreenShareEnabled(
                            !localParticipant.isScreenShareEnabled
                        )
                    }
                    className={`px-3 py-1 rounded ${
                        localParticipant.isScreenShareEnabled
                            ? "bg-green-600"
                            : "bg-gray-700"
                    }`}
                >
                    {localParticipant.isScreenShareEnabled 
                        ? <ScreenShare /> 
                        : <ScreenShareOff />
                    }
                </button>
            </div>

            <RoomAudioRenderer />
        </div>
    );
};