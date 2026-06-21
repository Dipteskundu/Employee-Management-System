"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  LayoutDashboard,
  Clock,
  Calendar,
  Users,
  Building2,
  FileText,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  X,
  BarChart3,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { type UserRole } from "@/types";
import { logout } from "@/lib/api";

interface SidebarProps {
  role: UserRole;
  collapsed: boolean;
  onToggle: () => void;
  mobile?: boolean;
}

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const navItemsByRole: Record<UserRole, NavItem[]> = {
  employee: [
    { label: "Dashboard", href: "/employee", icon: LayoutDashboard },
    { label: "Clock In/Out", href: "/employee/attendance", icon: Clock },
    { label: "My History", href: "/employee/history", icon: Calendar },
  ],
  manager: [
    { label: "Dashboard", href: "/manager", icon: LayoutDashboard },
    { label: "Team Attendance", href: "/manager/team", icon: Users },
    { label: "Reports", href: "/manager/reports", icon: FileText },
    { label: "My History", href: "/manager/history", icon: Calendar },
  ],
  admin: [
    { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { label: "Employees", href: "/admin/employees", icon: Users },
    { label: "Offices", href: "/admin/offices", icon: Building2 },
    { label: "Office Stats", href: "/admin/office-stats", icon: BarChart3 },
    { label: "Reports", href: "/admin/reports", icon: FileText },
    { label: "Settings", href: "/admin/settings", icon: Settings },
  ],
};

export default function Sidebar({ role, collapsed, onToggle, mobile = false }: SidebarProps) {
  const pathname = usePathname();
  const navItems = navItemsByRole[role];
  const isCollapsed = collapsed && !mobile;

  return (
    <motion.aside
      initial={false}
      animate={{ width: isCollapsed ? 72 : 280 }}
      transition={{ duration: 0.35, ease: [0.25, 0.4, 0.25, 1] }}
      className={cn(
        "relative z-30 flex h-full shrink-0 flex-col overflow-hidden border-r border-border/60 bg-card/95 backdrop-blur-xl",
        mobile ? "w-[min(20rem,85vw)] shadow-2xl shadow-black/20" : "shadow-none"
      )}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(99,102,241,0.10),transparent_42%)]" />

      <div className="relative overflow-hidden">
        <div className="flex h-14 items-center justify-between border-b border-border/40 px-4 sm:h-16">
          <AnimatePresence mode="wait">
            {(!isCollapsed || mobile) && (
              <motion.div
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.2 }}
                className="flex items-center gap-2.5"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl gradient-primary shadow-lg shadow-primary/25 sm:h-9 sm:w-9">
                  <Clock className="h-4 w-4 text-white sm:h-[18px] sm:w-[18px]" />
                </div>
                <div className="min-w-0">
                  <p className="font-bold leading-tight tracking-tight text-xs sm:text-sm">Triple-Lock</p>
                  <p className="text-[9px] font-medium uppercase leading-tight tracking-wide text-muted-foreground/70 sm:text-[10px]">
                    Attendance
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex items-center gap-1">
            {mobile ? (
              <Button
                variant="ghost"
                size="icon"
                onClick={onToggle}
                className="h-8 w-8 shrink-0 text-muted-foreground/60 hover:bg-accent/60 hover:text-foreground"
                aria-label="Close navigation"
              >
                <X className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                variant="ghost"
                size="icon"
                onClick={onToggle}
                className={cn(
                  "h-7 w-7 shrink-0 text-muted-foreground/50 transition-all duration-200 hover:bg-accent/60 hover:text-foreground",
                  isCollapsed && "mx-auto"
                )}
              >
                {isCollapsed ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronLeft className="h-3.5 w-3.5" />}
              </Button>
            )}
          </div>
        </div>
      </div>

      <nav className="flex-1 space-y-0.5 overflow-y-auto overflow-x-hidden px-2 py-2 sm:py-3">
        {(!isCollapsed || mobile) && (
          <p className="px-3 pb-1.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/40">
            Navigation
          </p>
        )}

        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={mobile ? onToggle : undefined}
              className={cn(
                "group relative flex items-center gap-3 overflow-hidden rounded-xl px-3 py-2 text-sm font-medium transition-all duration-200 sm:py-2.5",
                isActive ? "text-primary" : "text-muted-foreground/70 hover:bg-accent/40 hover:text-foreground"
              )}
              title={isCollapsed ? item.label : undefined}
            >
              {isActive && (
                <motion.div
                  layoutId="nav-bg"
                  className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary/10 to-primary/5"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
              {isActive && (
                <motion.div
                  layoutId="nav-indicator"
                  className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-gradient-to-b from-primary to-violet-500 shadow-sm shadow-primary/30"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}

              <div className={cn("relative z-10 flex items-center gap-3", isCollapsed && "w-full justify-center")}>
                <div className={cn("rounded-lg p-1.5 transition-all duration-200", isActive ? "bg-primary/10 shadow-sm" : "group-hover:bg-accent/60")}>
                  <Icon
                    className={cn(
                      "h-[18px] w-[18px] transition-colors",
                      isActive ? "text-primary" : "text-muted-foreground/60 group-hover:text-foreground"
                    )}
                  />
                </div>

                <AnimatePresence mode="wait">
                  {(!isCollapsed || mobile) && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.15 }}
                      className="relative z-10"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-border/40 p-2">
        <button
          type="button"
          onClick={() => {
            if (mobile) onToggle();
            logout();
          }}
          className={cn(
            "flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-all duration-200 sm:py-2.5",
            "text-muted-foreground/60 hover:bg-destructive/5 hover:text-destructive",
            isCollapsed && "justify-center"
          )}
          title={isCollapsed ? "Sign Out" : undefined}
        >
          <LogOut className="h-[18px] w-[18px] shrink-0" />
          <AnimatePresence mode="wait">
            {(!isCollapsed || mobile) && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
              >
                Sign Out
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>
    </motion.aside>
  );
}
