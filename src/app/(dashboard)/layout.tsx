"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Clock } from "lucide-react";
import Sidebar from "@/components/shared/Sidebar";
import Header from "@/components/shared/Header";
import { type User } from "@/types";
import { logout } from "@/lib/api";
import { cn } from "@/lib/utils";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    if (!isMobile) {
      setMobileSidebarOpen(false);
      return;
    }

    document.body.style.overflow = mobileSidebarOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobile, mobileSidebarOpen]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (!token || !storedUser) {
      router.replace("/login");
      return;
    }

    try {
      const parsedUser = JSON.parse(storedUser) as User;
      setUser(parsedUser);
    } catch {
      logout();
      router.replace("/login");
      return;
    } finally {
      setIsReady(true);
    }
  }, [router]);

  if (!isReady || !user) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-5">
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center shadow-glow">
              <Clock className="h-8 w-8 text-white animate-pulse" />
            </div>
            <div className="absolute -inset-3 rounded-2xl border border-primary/10 animate-pulse" />
            <div className="absolute -inset-1 rounded-2xl shimmer" />
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-foreground">Loading your workspace</p>
            <p className="text-xs text-muted-foreground mt-0.5">Preparing your dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-dvh bg-background">
      {isMobile && (
        <div
          className={cn(
            "fixed inset-0 z-40 bg-slate-950/45 backdrop-blur-sm transition-opacity duration-300 md:hidden",
            mobileSidebarOpen ? "opacity-100" : "pointer-events-none opacity-0"
          )}
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-out md:hidden",
          mobileSidebarOpen ? "translate-x-0" : "-translate-x-full pointer-events-none"
        )}
      >
        <Sidebar
          role={user.role}
          collapsed={false}
          onToggle={() => setMobileSidebarOpen(false)}
          mobile
        />
      </div>

      {!isMobile && (
        <div className="sticky top-0 h-dvh shrink-0">
          <Sidebar
            role={user.role}
            collapsed={sidebarCollapsed}
            onToggle={() => setSidebarCollapsed((current) => !current)}
          />
        </div>
      )}

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header user={user} onMenuToggle={() => setMobileSidebarOpen(!mobileSidebarOpen)} isMobile={isMobile} />
        <main className="flex-1 overflow-y-auto px-4 py-4 sm:px-6 sm:py-6 lg:px-8 lg:py-8 bg-[radial-gradient(circle_at_top_right,rgba(99,102,241,0.08),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(139,92,246,0.06),transparent_24%),linear-gradient(180deg,rgba(255,255,255,0.35),transparent_20%)] bg-dot-subtle">
          {children}
        </main>
      </div>
    </div>
  );
}
