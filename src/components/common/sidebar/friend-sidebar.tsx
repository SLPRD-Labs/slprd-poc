
import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarHeader,
    SidebarMenu
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";

export const FriendSidebar = () => {

    return (
        <Sidebar collapsible="none" className="flex-1">
            <SidebarHeader className="border-b p-4 flex flex-row items-center justify-between">
                <p>Messages privés</p>
                <Button variant={"outline"}>+</Button>
            </SidebarHeader>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupContent>
                        <SidebarMenu className="gap-1">

                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
        </Sidebar>
    );
}
