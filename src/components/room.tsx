import { MatrixLiveKitCall } from "@/components/matrix-livekit-call";
import type { Room as LiveKitRoom } from "livekit-client";
import type { FC } from "react";

interface Props {
    liveKitRoom: LiveKitRoom;
}

export const Room: FC<Props> = props => {

    return (
        <div className="flex h-full w-full">
            <div className="flex-1 flex items-center justify-center border-b">
                <MatrixLiveKitCall liveKitRoom={props.liveKitRoom} />
            </div>
        </div>
    );
};
