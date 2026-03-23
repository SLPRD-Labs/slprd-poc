import { CreateServerDialogContent } from "@/components/common/sidebar/create-server-dialog-content";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Plus } from "lucide-react";
import type { FC } from "react";
import { useState } from "react";

export const CreateServerButton: FC = () => {
    const [open, setOpen] = useState(false);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <SidebarMenuItem>
                <Tooltip>
                    <TooltipTrigger
                        render={
                            <DialogTrigger
                                render={
                                    <SidebarMenuButton
                                        aria-label="Créer un serveur"
                                        className="aspect-square size-full rounded-xl p-0"
                                    />
                                }
                            >
                                <div className="border-sidebar-border bg-sidebar-accent/30 text-sidebar-foreground hover:bg-sidebar-accent flex size-full items-center justify-center rounded-xl border border-dashed transition-colors">
                                    <Plus className="size-4" />
                                </div>
                            </DialogTrigger>
                        }
                    />
                    <TooltipContent side="right" align="center">
                        Créer un serveur
                    </TooltipContent>
                </Tooltip>
            </SidebarMenuItem>

            <CreateServerDialogContent
                open={open}
                onSuccess={() => {
                    setOpen(false);
                }}
            />
        </Dialog>
    );
};
