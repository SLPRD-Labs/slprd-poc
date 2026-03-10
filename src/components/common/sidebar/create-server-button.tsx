import type { FC } from "react";
import { useState } from "react";
import { Plus } from "lucide-react";
import { Sheet, SheetTrigger } from "@/components/ui/sheet";
import { SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { CreateServerSheetContent } from "./create-server-sheet-content";

export const CreateServerButton: FC = () => {
    const [open, setOpen] = useState(false);

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

            <CreateServerSheetContent
                onSuccess={() => {
                    setOpen(false);
                }}
            />
        </Sheet>
    );
};
