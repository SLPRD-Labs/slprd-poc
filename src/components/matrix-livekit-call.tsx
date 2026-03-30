import "@livekit/components-styles";
import { RoomAudioRenderer, RoomContext } from "@livekit/components-react";
import type { Room as LiveKitRoom } from "livekit-client";
import type { FC } from "react";
import { CustomCallUI } from "@/components/call-room/custom-call-ui";

interface Props {
    liveKitRoom: LiveKitRoom;
}

export const MatrixLiveKitCall: FC<Props> = props => {
    return (
        <div data-lk-theme="default" className="h-full w-full">
            <RoomContext.Provider value={props.liveKitRoom}>
                <CustomCallUI />
                <RoomAudioRenderer />
            </RoomContext.Provider>
        </div>
    );
};