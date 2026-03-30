import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { CameraIcon, UploadIcon } from "lucide-react";

interface AvatarUploadProps {
    preview: string | null;
    onUpload: () => void;
}

export function AvatarUpload({ preview, onUpload }: AvatarUploadProps) {
    return (
        <div className="flex flex-col items-center gap-3">
            <div
                className="relative cursor-pointer select-none"
                onClick={onUpload}
                role="button"
                tabIndex={0}
                aria-label="Changer la photo de profil"
                onKeyDown={e => {
                    if (e.key === "Enter") onUpload();
                }}
            >
                <Avatar className="border-border relative h-28 w-28 border-2 transition-opacity hover:opacity-80">
                    <AvatarImage src={preview ?? undefined} alt="Photo de profil" />
                    <AvatarFallback className="bg-gray-200 text-2xl font-extrabold tracking-tight">
                        <CameraIcon className="h-10 w-10" />
                    </AvatarFallback>
                </Avatar>
            </div>

            <p className="text-muted-foreground text-center text-xs">
                Cliquez pour changer · <span>JPG, PNG ou GIF</span>
            </p>

            <Button variant="outline" size="sm" onClick={onUpload} className="rounded-full text-xs">
                <UploadIcon className="h-3.5 w-3.5" />
                Importer une photo
            </Button>
        </div>
    );
}
