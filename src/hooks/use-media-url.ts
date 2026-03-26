import { useMatrixClient } from "@/hooks/use-matrix-client";
import { useEffect, useState } from "react";

export const useMediaUrl = (
    mxcUrl?: string | null,
    width?: number,
    height?: number,
    resizeMethod?: "crop" | "scale",
    enabled = true
): { url: string | null | undefined, loading: boolean } => {
    const { client } = useMatrixClient();

    const [avatarUrl, setAvatarUrl] = useState<string | null | undefined>();
    const [loading, setLoading] = useState(enabled && !!mxcUrl);

    useEffect(() => {
        if (!enabled) {
            return;
        }

        let objectUrl: string | null = null;
        const controller = new AbortController();

        void (async () => {
            const accessToken = client.getAccessToken();

            let httpUrl: string | null = null;
            if (mxcUrl !== undefined && mxcUrl !== null) {
                httpUrl = client.mxcUrlToHttp(
                    mxcUrl,
                    width,
                    height,
                    resizeMethod,
                    true,
                    true,
                    true
                );
            }

            if (accessToken === null || httpUrl === null) {
                if (!controller.signal.aborted) {
                    setAvatarUrl(null);
                    setLoading(false);
                }
                return;
            }

            setLoading(true);
            setAvatarUrl(undefined);

            try {
                const res = await fetch(httpUrl, {
                    signal: controller.signal,
                    headers: {
                        Authorization: `Bearer ${accessToken}`
                    }
                });

                if (!res.ok) {
                    if (!controller.signal.aborted) {
                        setAvatarUrl(null);
                        setLoading(false);
                    }
                }

                const blob = await res.blob();
                if (controller.signal.aborted) {
                    return;
                }
                objectUrl = URL.createObjectURL(blob);
                setAvatarUrl(objectUrl);
                setLoading(false);
            } catch {
                if (!controller.signal.aborted) {
                    setAvatarUrl(null);
                    setLoading(false);
                }
            }
        })();

        return () => {
            controller.abort();
            if (objectUrl !== null) {
                URL.revokeObjectURL(objectUrl);
            }
        };
    }, [client, mxcUrl, width, height, resizeMethod, enabled]);

    return { url: avatarUrl, loading };
};
