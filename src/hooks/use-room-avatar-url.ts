import { useMatrixClientContext } from "@/contexts/matrix-client-context/matrix-client-context";
import type { Room } from "matrix-js-sdk";
import { useEffect, useState } from "react";

export const useRoomAvatarUrl = (room: Room): string | null | undefined => {
    const { client } = useMatrixClientContext();

    const [avatarUrl, setAvatarUrl] = useState<string | null>();

    useEffect(() => {
        let objectUrl: string | null = null;

        void (async () => {
            const accessToken = client.getAccessToken();
            if (accessToken === null) {
                setAvatarUrl(null);
                return;
            }

            const mxcAvatarUrl = room.getMxcAvatarUrl();
            if (mxcAvatarUrl === null) {
                setAvatarUrl(null);
                return;
            }

            const avatarUrl = client.mxcUrlToHttp(mxcAvatarUrl, 32, 32, "crop", true, true, true);
            if (avatarUrl === null) {
                setAvatarUrl(null);
                return;
            }

            try {
                const res = await fetch(avatarUrl, {
                    headers: {
                        Authorization: `Bearer ${accessToken}`
                    }
                });
                const blob = await res.blob();
                objectUrl = URL.createObjectURL(blob);
                setAvatarUrl(objectUrl);
            } catch {
                setAvatarUrl(null);
            }
        })();

        return () => {
            if (objectUrl !== null) {
                URL.revokeObjectURL(objectUrl);
            }
        };
    }, [client, room]);

    return avatarUrl;
};
