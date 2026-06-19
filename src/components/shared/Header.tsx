"use client";

import { Bell, Search, UserIcon, SettingsIcon, LogOut, ChevronRight, Menu } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { type User } from "@/types";
import { logout } from "@/lib/api";

interface HeaderProps {
  user: User;
  onMenuToggle?: () => void;
  isMobile?: boolean;
}

const routeNames: Record<string, string> = {
  "/admin": "Admin Dashboard",
  "/admin/employees": "Employees",
  "/admin/offices": "Offices",
  "/admin/reports": "Reports",
  "/admin/settings": "Settings",
  "/manager": "Manager Dashboard",
  "/manager/team": "Team Attendance",
  "/manager/reports": "Reports",
  "/manager/history": "History",
  "/employee": "Employee Dashboard",
  "/employee/attendance": "Clock In / Out",
  "/employee/history": "History",
  "/profile": "Profile",
};

export default function Header({ user, onMenuToggle, isMobile }: HeaderProps) {
  const router = useRouter();
  const pathname = usePathname();

  const initials = user.username
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const currentPage = routeNames[pathname] || "Dashboard";

  const isDashboard = pathname.split("/").length <= 2;
  const breadcrumb = isDashboard
    ? []
    : ["Dashboard", currentPage];

  return (
    <header className="h-14 sm:h-16 border-b border-border/50 bg-card/90 backdrop-blur-md flex items-center justify-between px-3 sm:px-6 shrink-0 relative z-20 gap-2">
      {/* Left - Menu toggle + Breadcrumb */}
      <div className="flex items-center gap-2 min-w-0 flex-1">
        {isMobile && (
          <Button variant="ghost" size="icon" onClick={onMenuToggle} className="h-8 w-8 shrink-0 md:hidden">
            <Menu className="h-4 w-4" />
          </Button>
        )}
        {breadcrumb.length > 0 ? (
          <nav className="flex items-center gap-1.5 text-xs sm:text-sm text-muted-foreground/60 min-w-0">
            <span className="hover:text-foreground transition-colors cursor-default shrink-0">Dashboard</span>
            <ChevronRight className="h-3 w-3 shrink-0" />
            <span className="text-foreground font-medium truncate">{currentPage}</span>
          </nav>
        ) : (
          <h2 className="text-sm sm:text-base font-semibold text-foreground truncate">{currentPage}</h2>
        )}
      </div>

      {/* Right - Actions */}
      <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
        {!isMobile && (
          <div className="relative hidden sm:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/40" />
            <Input
              placeholder="Search..."
              className="pl-9 h-8 w-36 lg:w-48 bg-muted/40 border-transparent focus:bg-background focus:border-border/60 transition-all duration-200 text-xs rounded-lg"
            />
          </div>
        )}

        <Button variant="ghost" size="icon" className="relative h-8 w-8 text-muted-foreground/60 hover:text-foreground hover:bg-accent/50">
          <Bell className="h-[17px] w-[17px]" />
          <span className="absolute top-1.5 right-1.5 w-[7px] h-[7px] bg-destructive rounded-full ring-[2px] ring-card" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger className="h-8 w-8 rounded-full flex items-center justify-center hover:ring-2 hover:ring-primary/20 transition-all outline-none">
            <Avatar className="h-7 w-7 sm:h-8 sm:w-8">
              <AvatarImage src={user.username} alt={user.username} />
              <AvatarFallback className="gradient-primary text-white text-[10px] font-bold">
                {initials}
              </AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56 mt-1.5 shadow-elevated border-border/60 rounded-xl" align="end">
            <DropdownMenuGroup>
              <DropdownMenuLabel className="font-normal px-3 py-2.5">
                <div className="flex items-center gap-3">
                  <Avatar className="h-9 w-9">
                    <AvatarFallback className="gradient-primary text-white text-xs font-bold">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col min-w-0">
                    <p className="text-sm font-semibold truncate">{user.username}</p>
                    <p className="text-[11px] text-muted-foreground truncate">{user.email}</p>
                  </div>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => router.push("/profile")} className="gap-2.5 py-2">
                <UserIcon className="h-4 w-4 text-muted-foreground/60" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem className="gap-2.5 py-2">
                <SettingsIcon className="h-4 w-4 text-muted-foreground/60" />
                Settings
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={logout} className="gap-2.5 py-2 text-destructive focus:text-destructive">
              <LogOut className="h-4 w-4" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
