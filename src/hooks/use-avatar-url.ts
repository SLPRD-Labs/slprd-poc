import { useMatrixClient } from "@/hooks/use-matrix-client";
import { useEffect, useState } from "react";

export const useAvatarUrl = (mxcAvatarUrl?: string | null): string | null | undefined => {
    const { client } = useMatrixClient();

    const [avatarUrl, setAvatarUrl] = useState<string | null>();

    useEffect(() => {
        let objectUrl: string | null = null;

        const controller = new AbortController();

        void (async () => {
            const accessToken = client.getAccessToken();

            let avatarUrl: string | null;
            if (mxcAvatarUrl !== undefined && mxcAvatarUrl !== null) {
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
    }, [client, mxcAvatarUrl]);

    return avatarUrl;
};
