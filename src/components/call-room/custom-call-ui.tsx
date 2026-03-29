import { RoomAudioRenderer } from "@livekit/components-react";
import { VideoDisplay } from "./video-display";
import { CallToolbar } from "./call-toolbar";

export const CustomCallUI = () => {
    return (
        <div className="flex h-full flex-col text-white">
            <VideoDisplay />
            <CallToolbar />
            <RoomAudioRenderer />
        </div>
    );
};