import "@livekit/components-styles";
import { RoomAudioRenderer, RoomContext, VideoConference } from "@livekit/components-react";
import type { Room as LiveKitRoom } from "livekit-client";
import type { FC } from "react";

interface Props {
    liveKitRoom: LiveKitRoom;
}

export const MatrixLiveKitCall: FC<Props> = props => {
    return (
        <div data-lk-theme="default">
            <RoomContext.Provider value={props.liveKitRoom}>
                <VideoConference />
                <RoomAudioRenderer />
            </RoomContext.Provider>
        </div>
    );
};
