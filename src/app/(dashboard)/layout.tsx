"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Clock } from "lucide-react";
import Sidebar from "@/components/shared/Sidebar";
import Header from "@/components/shared/Header";
import WrongOfficeModal from "@/components/shared/WrongOfficeModal";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { type User } from "@/types";
import { logout, apiService } from "@/lib/api";
import { useKeyboardShortcuts, defaultShortcuts } from "@/hooks/useKeyboardShortcuts";
import { getBrowserClientIp } from "@/lib/client-ip";
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
  const [wrongOffice, setWrongOffice] = useState<{
    assigned: string;
    detected?: string;
    message?: string;
    reason?: "ip" | "location" | "combined";
  } | null>(null);
  const [accessChecked, setAccessChecked] = useState(false);

  useKeyboardShortcuts(defaultShortcuts);

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

  useEffect(() => {
    if (!user) return;

    if (user.role === "admin") {
      setWrongOffice(null);
      setAccessChecked(true);
      return;
    }

    let cancelled = false;

    const checkAccess = async () => {
      try {
        const clientIp = await getBrowserClientIp();
        const location = await new Promise<{ latitude: number; longitude: number }>((resolve, reject) => {
          if (!navigator.geolocation) {
            reject(new Error("Geolocation is not supported"));
            return;
          }

          navigator.geolocation.getCurrentPosition(
            (position) =>
              resolve({
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
              }),
            () => reject(new Error("Location permission is required")),
            { enableHighAccuracy: true, timeout: 10000 }
          );
        });

        const accessResult = await apiService.auth.verifyAccess({
          client_ip: clientIp,
          latitude: location.latitude,
          longitude: location.longitude,
        });

        if (cancelled) {
          return;
        }

        if (!accessResult.allowed) {
          setWrongOffice({
            assigned: accessResult.assigned_office || "Your assigned office",
            detected: accessResult.detected_office || undefined,
            message: accessResult.reason || "Your IP address or location is not authorized.",
            reason: accessResult.ip_allowed ? "location" : accessResult.gps_allowed ? "ip" : "combined",
          });
        } else {
          setWrongOffice(null);
        }
      } catch {
        if (!cancelled) {
          setWrongOffice({
            assigned: "Unknown office",
            message: "We could not verify your IP address and location.",
            reason: "combined",
          });
        }
      } finally {
        if (!cancelled) {
          setAccessChecked(true);
        }
      }
    };

    void checkAccess();

    return () => {
      cancelled = true;
    };
  }, [user, router]);

  if (!isReady || !user || !accessChecked) {
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
          <ErrorBoundary>
            {children}
          </ErrorBoundary>
        </main>
      </div>

      {wrongOffice && (
        <WrongOfficeModal
          assignedOffice={wrongOffice.assigned}
          detectedOffice={wrongOffice.detected}
          message={wrongOffice.message}
          reason={wrongOffice.reason}
        />
      )}
    </div>
  );
}
