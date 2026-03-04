import { NavThemeSwitcher } from "@/components/common/sidebar/nav-theme-switcher";
import { NavUserAvatar } from "@/components/common/sidebar/nav-user-avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar
} from "@/components/ui/sidebar";
import { useAuthContext } from "@/contexts/auth-context/auth-context";
import { useCurrentUserQuery } from "@/hooks/use-current-user-query";
import { useNavigate } from "@tanstack/react-router";
import { ChevronsUpDown, LogOut } from "lucide-react";
import type { FC } from "react";

export const NavUser: FC = () => {
    const { logout } = useAuthContext();
    const navigate = useNavigate();

    const { isMobile } = useSidebar();

    const currentUserQuery = useCurrentUserQuery();

    if (!currentUserQuery.isSuccess || currentUserQuery.data === null) {
        return null;
    }

    const handleLogout = () => {
        logout();
        void navigate({ to: "/login", replace: true });
    };

    return (
        <SidebarMenu>
            <SidebarMenuItem>
                <DropdownMenu>
                    <DropdownMenuTrigger
                        render={
                            <SidebarMenuButton
                                size="lg"
                                className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground md:h-8 md:p-0"
                            >
                                <NavUserAvatar currentUser={currentUserQuery.data} />
                                <ChevronsUpDown className="ml-auto size-4" />
                            </SidebarMenuButton>
                        }
                    />
                    <DropdownMenuContent
                        className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
                        side={isMobile ? "bottom" : "right"}
                        align="end"
                        sideOffset={4}
                    >
                        <DropdownMenuGroup>
                            <DropdownMenuLabel className="p-0 font-normal">
                                <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                                    <NavUserAvatar currentUser={currentUserQuery.data} />
                                </div>
                            </DropdownMenuLabel>
                        </DropdownMenuGroup>
                        <DropdownMenuSeparator />
                        <NavThemeSwitcher />
                        <DropdownMenuSeparator />
                        <DropdownMenuItem variant="destructive" onClick={handleLogout}>
                            <LogOut />
                            Log out
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </SidebarMenuItem>
        </SidebarMenu>
    );
};
