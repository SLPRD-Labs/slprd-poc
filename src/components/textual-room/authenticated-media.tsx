import { Dialog, DialogContent, DialogTitle, DialogTrigger, DialogClose } from "../ui/dialog";
import { Button } from "../ui/button";
import { FileIcon, Loader2, Download, X, Film, Music } from "lucide-react";
import type { FC } from "react";
import { useState } from "react";
import { useMediaUrl } from "@/hooks/use-media-url";

const formatFileSize = (bytes?: number) => {
    if (bytes == null) return "Taille inconnue";
    const mb = bytes / (1024 * 1024);
    if (mb < 1) return `${(bytes / 1024).toFixed(1)} Ko`;
    return `${mb.toFixed(2)} Mo`;
};

export const AuthenticatedMedia: FC<{
    mxcUrl: string;
    msgtype: string;
    body: string;
    fileSize?: number;
    onDialogOpenChange?: (open: boolean) => void;
}> = ({ mxcUrl, msgtype, body, fileSize, onDialogOpenChange }) => {
    const isImage = msgtype === "m.image";
    const [hasRequested, setHasRequested] = useState(isImage);

    // On utilise directement notre Hook !
    const { url: objectUrl, loading } = useMediaUrl(
        mxcUrl,
        isImage ? 800 : undefined,
        isImage ? 800 : undefined,
        isImage ? "scale" : undefined,
        hasRequested
    );

    if (!hasRequested) {
        return (
            <div className="mt-2 flex w-fit items-center gap-3 rounded-md border bg-gray-50/50 p-3 shadow-sm transition-colors hover:bg-gray-100">
                <div className="flex items-center gap-2">
                    {msgtype === "m.video" ? (
                        <Film className="size-5 text-indigo-500" />
                    ) : msgtype === "m.audio" ? (
                        <Music className="size-5 text-indigo-500" />
                    ) : (
                        <FileIcon className="size-5 text-indigo-500" />
                    )}
                    <div className="flex flex-col">
                        <span
                            className="max-w-50 truncate text-sm font-medium text-slate-700 md:max-w-62.5"
                            title={body}
                        >
                            {body}
                        </span>
                        <span className="text-muted-foreground text-xs">
                            {formatFileSize(fileSize)}
                        </span>
                    </div>
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    className="ml-2 h-8 gap-1 bg-white"
                    onClick={() => {
                        setHasRequested(true);
                    }}
                >
                    <Download className="size-3.5" />
                    Charger
                </Button>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="mt-2 flex w-fit items-center gap-2 rounded-md border p-3 text-sm text-slate-500">
                <Loader2 className="size-4 animate-spin" /> Chargement...
            </div>
        );
    }

    if (objectUrl === null) {
        return <div className="mt-2 text-sm text-red-500">Erreur de chargement du média</div>;
    }

    if (msgtype === "m.image") {
        return (
            <Dialog onOpenChange={onDialogOpenChange}>
                <DialogTrigger
                    render={
                        <button className="focus-visible:ring-ring mt-2 max-w-sm cursor-pointer overflow-hidden rounded-md border bg-gray-50/50 transition-opacity outline-none hover:opacity-90 focus-visible:ring-2 focus-visible:ring-offset-2" />
                    }
                >
                    {objectUrl && (
                        <img
                            src={objectUrl}
                            alt={body}
                            className="max-h-96 w-full object-contain"
                        />
                    )}
                </DialogTrigger>

                <DialogContent
                    showCloseButton={false}
                    className="top-0! left-0! flex h-dvh w-dvw max-w-none! translate-x-0! translate-y-0! items-center justify-center border-none bg-transparent p-0! shadow-none ring-0"
                >
                    <DialogTitle className="sr-only">Aperçu de l&#39;image : {body}</DialogTitle>

                    <DialogClose
                        className="absolute inset-0 z-0 h-full w-full cursor-default outline-none"
                        aria-hidden="true"
                        tabIndex={-1}
                    />

                    {objectUrl && (
                        <img
                            src={objectUrl}
                            alt={body}
                            className="relative z-10 max-h-[90vh] max-w-[90vw] rounded-md object-contain"
                        />
                    )}

                    <DialogClose className="bg-background text-foreground hover:bg-muted focus:ring-ring absolute top-4 right-4 z-50 flex size-8 items-center justify-center rounded-md border shadow-sm transition-colors focus:ring-2 focus:outline-none">
                        <X className="size-4" />
                        <span className="sr-only">Fermer</span>
                    </DialogClose>
                </DialogContent>
            </Dialog>
        );
    }

    if (msgtype === "m.video") {
        return (
            <div className="group relative mt-2 w-fit overflow-hidden rounded-md border bg-transparent shadow-sm">
                {objectUrl && (
                    <video
                        src={objectUrl}
                        controls
                        preload="metadata"
                        className="max-h-96 w-auto max-w-sm object-contain"
                    />
                )}

                <a
                    href={objectUrl ?? "#"}
                    download={body}
                    title="Télécharger"
                    aria-label="Télécharger la vidéo"
                    className="bg-background text-foreground hover:bg-muted absolute top-2 right-2 flex size-8 items-center justify-center rounded-md border opacity-0 shadow-sm transition-all duration-200 group-hover:opacity-100 hover:scale-105"
                >
                    <Download className="size-4" />
                </a>
            </div>
        );
    }

    if (msgtype === "m.audio") {
        return (
            <div className="group relative mt-2 w-fit rounded-xl border bg-gray-50/50 p-2 shadow-sm">
                <div className="text-muted-foreground mb-1.5 flex items-center justify-between px-2 text-xs">
                    <span
                        className="max-w-40 truncate font-medium text-slate-700 md:max-w-50"
                        title={body}
                    >
                        {body}
                    </span>
                    <span className="shrink-0 text-[10px]">{formatFileSize(fileSize)}</span>
                </div>

                <div className="overflow-hidden rounded-full border bg-white shadow-sm">
                    {objectUrl && (
                        <audio
                            src={objectUrl}
                            controls
                            preload="metadata"
                            className="h-10 w-64 md:w-72"
                        />
                    )}
                </div>

                <a
                    href={objectUrl ?? "#"}
                    download={body}
                    title="Télécharger"
                    aria-label={`Télécharger ${body}`}
                    className="bg-background text-foreground hover:bg-muted absolute -top-2 -right-2 flex size-8 items-center justify-center rounded-md border opacity-0 shadow-sm transition-all duration-200 group-hover:opacity-100 hover:scale-105"
                >
                    <Download className="size-4" />
                </a>
            </div>
        );
    }

    return (
        <a
            href={objectUrl ?? "#"}
            download={body}
            className="mt-2 flex w-fit items-center gap-2 rounded-md border bg-gray-50 p-3 transition-colors hover:bg-gray-100"
        >
            <FileIcon className="size-5 text-indigo-500" />
            <span className="text-sm font-medium text-slate-700 underline-offset-4 hover:underline">
                {body}
            </span>
        </a>
    );
};
