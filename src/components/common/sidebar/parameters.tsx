import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    DropdownMenuSub,
    DropdownMenuSubTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { Button } from "@base-ui/react";
import { Settings } from "lucide-react";
import {
    useEffect,
    useRef,
    useState,
    type ChangeEvent,
    type FC,
} from "react";
import { useQueryClient } from "@tanstack/react-query";
import { UserEvent, type User } from "matrix-js-sdk";
import { AvatarUpload } from "../avatar/avatar-upload";
import { useMatrixClient } from "@/hooks/use-matrix-client";
import { useCurrentUserQuery } from "@/hooks/use-current-user-query";
import { Input } from "@/components/ui/input";
import { Field, FieldLabel } from "@/components/ui/field";
import { useAvatarUrl } from "@/hooks/use-avatar-url";

interface Props {
    onSave?: () => void;
}
export const Parameters: FC<Props> = () => {    const currentUserQuery = useCurrentUserQuery();
    const currentUser = currentUserQuery.data;
    const queryClient = useQueryClient();
    const { client } = useMatrixClient();
    const [settingsOpen, setSettingsOpen] = useState(false);
    const [displayName, setDisplayName] = useState("");
    const [preview, setPreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const pendingFileRef = useRef<File | null>(null);
    const avatarHttpUrl = useAvatarUrl(currentUser?.avatarUrl);

    useEffect(() => {
        if (settingsOpen) {
            setDisplayName(currentUser?.displayName ?? "");
            if (!pendingFileRef.current) {
                setPreview(avatarHttpUrl ?? null);
            }
        }
    }, [settingsOpen, avatarHttpUrl]);

    if (!currentUser) return null;

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (ev) => setPreview(ev.target?.result as string);
        reader.readAsDataURL(file);

        pendingFileRef.current = file;
    }

    const uploadAvatar = async (file: File): Promise<string> => {
        const { content_uri } = await client.uploadContent(file, {
            type: file.type,
        });
        await client.setAvatarUrl(content_uri);
        return content_uri;
    }
    
    const handleSave = async () => {
        const newName = displayName.trim();
        let newAvatarUrl: string | undefined;
        const user = client.getUser(client.getSafeUserId());

        if (newName && newName !== currentUser.displayName) {
            await client.setDisplayName(newName);
        }

        if (pendingFileRef.current) {
            newAvatarUrl = await uploadAvatar(pendingFileRef.current);
        }

        if (user) {
            if (newName) {
                user.displayName = newName;
                user.emit(UserEvent.DisplayName, undefined, user);
            }
            if (newAvatarUrl) {
                user.avatarUrl = newAvatarUrl;
                user.emit(UserEvent.AvatarUrl, undefined, user);
            }
        }

        queryClient.setQueryData(["currentUser"], (old: User) => {
            const cloned = Object.create(Object.getPrototypeOf(old)) as User;
            Object.assign(cloned, old);
            if (newName) cloned.displayName = newName;
            if (newAvatarUrl) cloned.avatarUrl = newAvatarUrl;
            return cloned;
        });

        pendingFileRef.current = null;
        setSettingsOpen(false);
    };

    const handleCancel = () => {
        if (currentUser.avatarUrl) {
            const httpUrl = client.mxcUrlToHttp(currentUser.avatarUrl);
            setPreview(httpUrl);
        } else {
            setPreview(null);
        }
        pendingFileRef.current = null;
        setDisplayName(currentUser.displayName ?? "");
        setSettingsOpen(false);
    }

    const handleKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>) => {
            if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                e.stopPropagation()
                await handleSave();
            }
    
            if (e.key === "Escape") {
                e.preventDefault();
                e.stopPropagation()
                handleCancel();
            }
        };

    return (
        <>
            <DropdownMenuSub>
                <DropdownMenuSubTrigger
                    onClick={(e) => {
                        e.preventDefault();
                        setTimeout(() => setSettingsOpen(true), 0);
                    }}
                >
                    <Settings />
                    <span className="truncate">Paramètres</span>
                </DropdownMenuSubTrigger>
            </DropdownMenuSub>

            <Dialog 
                open={settingsOpen} 
                onOpenChange={(open) => {
                    if (!open) handleCancel();
                    else setSettingsOpen(true);
                }}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Modifier le profil</DialogTitle>
                    </DialogHeader>

                    <AvatarUpload
                        preview={preview}
                        onUpload={() => fileInputRef.current?.click()}
                        
                    />
                    <Input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleFileChange}
                    />

                    <Separator className="bg-border" />

                    <div className="flex flex-col gap-4">
                        <Field>
                            <FieldLabel htmlFor="display-name">
                                Nom d'affichage
                            </FieldLabel>
                            <Input
                                id="display-name"
                                value={displayName}
                                onChange={(e) => setDisplayName(e.target.value)}
                                placeholder="Votre nom d'affichage"
                                onKeyDown={(e) => {
                                    e.stopPropagation();
                                    handleKeyDown(e);
                                    }}
                                    
                            />
                        </Field>
                    </div>

                    <DialogFooter className="gap-2">
                        
                        <Button
                            onClick={handleSave}
                            className="cursor-pointer"
                        >
                            Sauvegarder
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
};