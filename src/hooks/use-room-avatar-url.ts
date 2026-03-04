import { useMatrixClientContext } from "@/contexts/matrix-client-context/matrix-client-context";
import type { Room } from "matrix-js-sdk";
import { useEffect, useState } from "react";

export const useRoomAvatarUrl = (room: Room): string | null | undefined => {
    const { client } = useMatrixClientContext();

    const [avatarUrl, setAvatarUrl] = useState<string | null>();

    useEffect(() => {
        let objectUrl: string | null = null;

        const controller = new AbortController();

        void (async () => {
            const accessToken = client.getAccessToken();

            const mxcAvatarUrl = room.getMxcAvatarUrl();
            let avatarUrl: string | null;
            if (mxcAvatarUrl !== null) {
                avatarUrl = client.mxcUrlToHttp(mxcAvatarUrl, 32, 32, "crop", true, true, true);
            } else {
                avatarUrl = null;
            }

            if (accessToken === null || avatarUrl === null) {
                if (!controller.signal.aborted) {
                    setAvatarUrl(null);
                }
                return;
            }

            try {
                const res = await fetch(avatarUrl, {
                    signal: controller.signal,
                    headers: {
                        Authorization: `Bearer ${accessToken}`
                    }
                });
                const blob = await res.blob();
                if (controller.signal.aborted) {
                    return;
                }
                objectUrl = URL.createObjectURL(blob);
                setAvatarUrl(objectUrl);
            } catch {
                if (controller.signal.aborted) {
                    return;
                }
                setAvatarUrl(null);
            }
        })();

        return () => {
            controller.abort();
            if (objectUrl !== null) {
                URL.revokeObjectURL(objectUrl);
            }
        };
    }, [client, room]);

    return avatarUrl;
};
