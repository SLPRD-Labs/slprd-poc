import type { Room as LiveKitRoom } from "livekit-client";
import type { Room } from "matrix-js-sdk";
import type { MatrixRTCSession } from "matrix-js-sdk/lib/matrixrtc";
import { createContext, use } from "react";

interface IdleCallContext {
    state: "idle";
    join: (roomId: string) => Promise<void>;
}

interface JoiningCallContext {
    state: "joining";
}

export interface ActiveCallContext {
    state: "active";
    room: Room;
    rtcSession: MatrixRTCSession;
    liveKitRoom: LiveKitRoom;
    leave: () => Promise<void>;
}

export type ICallContext = IdleCallContext | JoiningCallContext | ActiveCallContext;

export const CallContext = createContext<ICallContext | null>(null);

export const useCallContext = (): ICallContext => {
    const callContext = use(CallContext);
    if (callContext === null) {
        throw new Error("useCallContext called without CallContextProvider");
    }
    return callContext;
};
