import { Room } from "@/components/room";
import { useCallContext } from "@/contexts/call-context/call-context";
import { useMatrixClientContext } from "@/contexts/matrix-client-context/matrix-client-context";
import { Visibility, Preset } from "matrix-js-sdk";
import { useState } from "react";
import type { FC, SyntheticEvent } from "react";

export const Rooms: FC = () => {
    const call = useCallContext();
    const { client } = useMatrixClientContext();
    const [creating, setCreating] = useState(false);
    const [createdRoomId, setCreatedRoomId] = useState<string | null>(null);

    const handleCreatePrivateRoom = async (e: SyntheticEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const name = formData.get("roomName") as string;
        const inviteRaw = formData.get("invite") as string;
        const invite = inviteRaw
            ? inviteRaw.split(",").map(s => s.trim()).filter(Boolean)
            : [];

        setCreating(true);
        try {
            const { room_id } = await client.createRoom({
                name,
                visibility: Visibility.Private,
                preset: Preset.PrivateChat,
                invite,
                power_level_content_override: { events_default: 0 },
            });
            setCreatedRoomId(room_id);
        } finally {
            setCreating(false);
        }
    };

    const handleCreatePublicRoom = async (e: SyntheticEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const name = formData.get("roomName") as string;
        const room_alias_name = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

        setCreating(true);
        try {
            const { room_id } = await client.createRoom({
                name,
                visibility: Visibility.Public,
                preset: Preset.PublicChat,
                room_alias_name,
                power_level_content_override: { events_default: 0 },
            });
            setCreatedRoomId(room_id);
        } finally {
            setCreating(false);
        }
    };

    return (
        <div>
            {call.state === "idle" && (
                <>
                    {/* Private room */}
                    <section className="mb-4">
                        <h3>Create private room</h3>
                        <p>Accessible only by invitation or via the room ID.</p>
                        <form onSubmit={e => void handleCreatePrivateRoom(e)}>
                            <input type="text" name="roomName" placeholder="Room name" required />
                            <input
                                type="text"
                                name="invite"
                                placeholder="Invite (e.g. @alice:server, @bob:server)"
                                className="w-96"
                            />
                            <button type="submit" disabled={creating}>
                                {creating ? "Creating..." : "Create (private)"}
                            </button>
                        </form>
                    </section>

                    {/* Public room */}
                    <section className="mb-4">
                        <h3>Create public room</h3>
                        <p>Visible in the homeserver directory, joinable without invitation.</p>
                        <form onSubmit={e => void handleCreatePublicRoom(e)}>
                            <input type="text" name="roomName" placeholder="Room name" required />
                            <button type="submit" disabled={creating}>
                                {creating ? "Creating..." : "Create (public)"}
                            </button>
                        </form>
                    </section>

                    {createdRoomId && (
                        <p>
                            Room created: <code>{createdRoomId}</code>
                        </p>
                    )}

                    {/* Join */}
                    <section className="mb-4">
                        <h3>Join a room</h3>
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
                            <input type="text" name="roomId" placeholder="Room ID or alias" />
                            <button type="submit">Join</button>
                        </form>
                    </section>
                </>
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