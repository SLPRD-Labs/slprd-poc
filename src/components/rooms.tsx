import { Room } from "@/components/room";
import { useCallContext } from "@/contexts/call-context/call-context";
import type { FC } from "react";

export const Rooms: FC = () => {
    const call = useCallContext();

    return (
        <div>
            {call.state === "idle" && (
                <form
                    onSubmit={e => {
                        e.preventDefault();
                        const formData = new FormData(e.currentTarget);
                        const roomId = formData.get("roomId");
                        if (typeof roomId === "string") {
                            void call.join(roomId);
                        }
                    }}
                >
                    <input type="text" name="roomId" placeholder="Room ID" />
                    <button type="submit">Join</button>
                </form>
            )}
            {call.state === "joining" && <p>Joining...</p>}
            {call.state === "active" && (
                <>
                    <Room liveKitRoom={call.liveKitRoom} />
                    <button
                        onClick={() => {
                            void call.leave();
                        }}
                    >
                        Leave
                    </button>
                </>
            )}
        </div>
    );
};
