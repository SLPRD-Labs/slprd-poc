import { useMatrixClientContext } from "@/contexts/matrix-client-context/matrix-client-context";
import { useQueryClient } from "@tanstack/react-query";
import { HistoryVisibility, Preset, RoomType } from "matrix-js-sdk";
import type { FC, SyntheticEvent } from "react";
import { useState } from "react";
import { Plus } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useNavigate } from "@tanstack/react-router";

export const CreateServerButton: FC = () => {
    const { client } = useMatrixClientContext();
    const queryClient = useQueryClient();
    const navigate = useNavigate();

    const [open, setOpen] = useState(false);
    const [name, setName] = useState("");
    const [topic, setTopic] = useState("");
    const [isPublic, setIsPublic] = useState(false);
    const [alias, setAlias] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: SyntheticEvent) => {
        e.preventDefault();
        if (!name.trim()) return;

        setLoading(true);

        try {
            const response = await client.createRoom({
                name,
                topic,
                preset: isPublic ? Preset.PublicChat : Preset.PrivateChat,
                room_alias_name: isPublic && alias ? alias : undefined,
                creation_content: { type: RoomType.Space },
                power_level_content_override: {
                    events_default: 100, // Only allow Admins to write to the timeline to prevent hidden sync spam
                    invite: isPublic ? 0 : 50
                },
                initial_state: [
                    {
                        type: "m.room.history_visibility",
                        state_key: "",
                        content: {
                            history_visibility: isPublic
                                ? HistoryVisibility.WorldReadable
                                : HistoryVisibility.Invited
                        }
                    }
                ]
            });

            await queryClient.invalidateQueries({ queryKey: ["spaces"] });
            setOpen(false);

            setName("");
            setTopic("");
            setIsPublic(false);
            setAlias("");

            await navigate({
                to: "/space/$spaceId",
                params: { spaceId: response.room_id }
            })
        } catch (error) {
            console.error("Failed to create space:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SidebarMenuItem>
                <Tooltip>
                    <TooltipTrigger
                        render={
                            <SheetTrigger
                                render={
                                    <SidebarMenuButton className="p-0 group-data-[collapsible=icon]:p-0!" />
                                }
                            >
                                <div className="border-sidebar-border bg-sidebar-accent/30 text-sidebar-foreground hover:bg-sidebar-accent flex size-8 items-center justify-center rounded-md border border-dashed transition-colors">
                                    <Plus className="size-4" />
                                </div>
                            </SheetTrigger>
                        }
                    />
                    <TooltipContent side="right" align="center">
                        Create Server
                    </TooltipContent>
                </Tooltip>
            </SidebarMenuItem>

            <SheetContent side="left" className="sm:max-w-md">
                <SheetHeader>
                    <SheetTitle>Create a Server</SheetTitle>
                </SheetHeader>

                <form onSubmit={(e) => void handleSubmit(e)} className="mt-6 flex flex-col gap-6">
                    <div className="grid gap-2">
                        <Label htmlFor="space-name">Name</Label>
                        <Input
                            id="space-name"
                            placeholder="e.g. My Server"
                            value={name}
                            onChange={e => { setName(e.target.value); }}
                            required
                        />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="space-topic">Description (optional)</Label>
                        <Input
                            id="space-topic"
                            placeholder="What is this server for?"
                            value={topic}
                            onChange={e => { setTopic(e.target.value); }}
                        />
                    </div>

                    <div className="border-border flex items-center gap-3 rounded-md border p-4">
                        <input
                            type="checkbox"
                            id="space-public"
                            checked={isPublic}
                            onChange={e =>  { setIsPublic(e.target.checked); }}
                            className="size-4 rounded border-gray-300"
                        />
                        <div className="grid gap-1.5 leading-none">
                            <Label htmlFor="space-public">Make this server public</Label>
                            <p className="text-muted-foreground text-xs">
                                Anyone will be able to find and join it.
                            </p>
                        </div>
                    </div>

                    {isPublic && (
                        <div className="grid gap-2">
                            <Label htmlFor="space-alias">Server Address (optional)</Label>
                            <Input
                                id="space-alias"
                                placeholder="e.g. my-server"
                                value={alias}
                                onChange={e => { setAlias(e.target.value); }}
                            />
                        </div>
                    )}

                    <Button type="submit" disabled={loading} className="mt-4">
                        {loading ? "Creating..." : "Create Server"}
                    </Button>
                </form>
            </SheetContent>
        </Sheet>
    );

}