import type { FC } from "react";
import { useEffect, useState } from "react";
import { useMatrixClient } from "@/hooks/use-matrix-client";
import { useMediaUrl } from "@/hooks/use-media-url";
import { Compass } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "@tanstack/react-router";

export const InvitePreviewCard: FC<{ inviteId: string }> = ({ inviteId }) => {
    const { client } = useMatrixClient();
    const navigate = useNavigate();

    const decodedId = decodeURIComponent(inviteId);

    const [roomData, setRoomData] = useState<{
        roomId: string;
        name?: string;
        avatarUrl?: string;
        num_joined_members?: number;
    } | null>(null);
    useEffect(() => {
        client
            .getRoomHierarchy(decodedId, 1, 1)
            .then(res => {
                const room =
                    res.rooms.find(
                        r =>
                            r.room_id === decodedId ||
                            r.canonical_alias === decodedId ||
                            r.aliases?.includes(decodedId)
                    ) ?? res.rooms[0];

                setRoomData({
                    roomId: room.room_id,
                    name: room.name,
                    avatarUrl: room.avatar_url,
                    num_joined_members: room.num_joined_members
                });
            })
            .catch(() => {
                console.debug(
                    `Aperçu enrichi indisponible pour ${decodedId} (le serveur restreint l'accès aux non-membres).`
                );
            });
    }, [client, decodedId]);

    const { url: avatarUrl } = useMediaUrl(roomData?.avatarUrl);

    const roomObj = client
        .getRooms()
        .find(
            r =>
                r.roomId === decodedId ||
                r.roomId === roomData?.roomId ||
                r.getCanonicalAlias() === decodedId ||
                r.getAltAliases().includes(decodedId)
        );
    const isJoined = roomObj?.getMyMembership() === "join";

    const actualSpaceId = roomObj?.roomId ?? roomData?.roomId ?? decodedId;

    return (
        <div className="bg-card mt-2 flex w-full max-w-sm flex-col gap-3 rounded-xl border p-4 shadow-sm">
            <div className="flex items-center gap-3">
                {avatarUrl ? (
                    <img
                        src={avatarUrl}
                        alt="Server Icon"
                        className="size-12 shrink-0 rounded-xl object-cover"
                    />
                ) : (
                    <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-green-500 text-white shadow-sm">
                        <Compass className="size-6" />
                    </div>
                )}
                <div className="flex flex-col overflow-hidden">
                    <span className="text-muted-foreground text-[10px] font-bold tracking-wider uppercase">
                        {isJoined
                            ? "Vous êtes membre de ce serveur"
                            : "Vous avez été invité(e) à rejoindre un serveur"}
                    </span>
                    <span className="text-foreground truncate text-base font-bold">
                        {roomData?.name ?? decodedId}
                    </span>
                    {roomData?.num_joined_members !== undefined && (
                        <div className="text-muted-foreground mt-0.5 flex items-center gap-1.5 text-xs">
                            <div className="size-2 rounded-full bg-green-500"></div>
                            <span>
                                {roomData.num_joined_members} membre
                                {roomData.num_joined_members > 1 ? "s" : ""}
                            </span>
                        </div>
                    )}
                </div>
            </div>

            {isJoined ? (
                <Button
                    variant="secondary"
                    className="w-full font-semibold"
                    onClick={() =>
                        void navigate({ to: "/space/$spaceId", params: { spaceId: actualSpaceId } })
                    }
                >
                    Ouvrir le serveur
                </Button>
            ) : (
                <Button
                    className="w-full bg-green-600 font-semibold text-white hover:bg-green-700"
                    onClick={() => void navigate({ to: "/join/$inviteId", params: { inviteId } })}
                >
                    Rejoindre
                </Button>
            )}
        </div>
    );
};
