import { MatrixLiveKitCall } from "@/components/matrix-livekit-call";
import { useMatrixClientContext } from "@/contexts/matrix-client-context/matrix-client-context";
import type { Room as LiveKitRoom } from "livekit-client";
import type { FC } from "react";

interface Props {
    liveKitRoom: LiveKitRoom;
}

export const Room: FC<Props> = props => {
    const { client } = useMatrixClientContext();

    return (
        <div>
            <h3>Logged in as {client.getUserId()}</h3>
            <MatrixLiveKitCall liveKitRoom={props.liveKitRoom} />
        </div>
    );
};
