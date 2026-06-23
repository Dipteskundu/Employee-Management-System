"use client";

import { Bell, BellRing, Search, UserIcon, SettingsIcon, LogOut, ChevronRight, Menu, Loader2 } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import ThemeToggle from "./ThemeToggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { type User } from "@/types";
import { logout } from "@/lib/api";
import { useNotifications, useMarkAsRead, useMarkAllAsRead } from "@/hooks/useNotifications";

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
  const { data: notificationsData, isLoading: notifLoading } = useNotifications();
  const markAsRead = useMarkAsRead();
  const markAllAsRead = useMarkAllAsRead();

  const notifications = notificationsData?.notifications || [];
  const unreadCount = notificationsData?.unread_count || 0;

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

        <ThemeToggle />

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="relative h-8 w-8 text-muted-foreground/60 hover:text-foreground hover:bg-accent/50">
              {unreadCount > 0 ? <BellRing className="h-[17px] w-[17px]" /> : <Bell className="h-[17px] w-[17px]" />}
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 flex items-center justify-center bg-destructive text-destructive-foreground text-[10px] font-bold rounded-full px-1 ring-[2px] ring-card">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-80 p-0 shadow-elevated border-border/60 rounded-xl">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border/50">
              <h4 className="text-sm font-semibold">Notifications</h4>
              {unreadCount > 0 && (
                <button
                  onClick={() => markAllAsRead.mutate()}
                  className="text-xs text-primary hover:underline"
                >
                  Mark all read
                </button>
              )}
            </div>
            {notifLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground/60" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="text-center py-8 text-xs text-muted-foreground/60">
                No notifications yet
              </div>
            ) : (
              <ScrollArea className="max-h-80">
                {notifications.slice(0, 20).map((notif: any) => (
                  <div
                    key={notif._id}
                    onClick={() => !notif.read && markAsRead.mutate(notif._id)}
                    className={`px-4 py-3 border-b border-border/30 cursor-pointer transition-colors hover:bg-muted/40 ${!notif.read ? "bg-primary/5" : ""}`}
                  >
                    <div className="flex items-start gap-2.5">
                      <div className={`mt-0.5 w-2 h-2 rounded-full shrink-0 ${!notif.read ? "bg-primary" : "bg-transparent"}`} />
                      <div className="min-w-0 flex-1">
                        <p className={`text-xs ${!notif.read ? "font-semibold" : "font-medium"} text-foreground truncate`}>
                          {notif.title}
                        </p>
                        <p className="text-xs text-muted-foreground/70 mt-0.5 line-clamp-2">
                          {notif.message}
                        </p>
                        <p className="text-[10px] text-muted-foreground/40 mt-1">
                          {format(new Date(notif.created_at), "MMM d, h:mm a")}
                        </p>
                      </div>
                      <Badge variant="outline" className="text-[9px] px-1.5 py-0 h-4 shrink-0 capitalize">
                        {notif.type.replace("_", " ")}
                      </Badge>
                    </div>
                  </div>
                ))}
              </ScrollArea>
            )}
          </PopoverContent>
        </Popover>

        <DropdownMenu>
          <DropdownMenuTrigger className="h-8 w-8 rounded-full flex items-center justify-center hover:ring-2 hover:ring-primary/20 transition-all outline-none">
            <Avatar className="h-7 w-7 sm:h-8 sm:w-8">
              <AvatarImage src={user.profile_picture} alt={user.username} />
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
                    <AvatarImage src={user.profile_picture} alt={user.username} />
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
