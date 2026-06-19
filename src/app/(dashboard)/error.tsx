"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { Home, RefreshCw, AlertTriangle, LogOut, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { logout } from "@/lib/api";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    setMounted(true);
    console.error("Dashboard error:", error);
  }, [error]);

  const handleLogout = () => {
    logout();
    router.replace("/login");
  };

  if (!mounted) {
    return null;
  }

  return (
    <div className="flex h-screen bg-background">
      <div className="flex-1 flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="w-full max-w-lg"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200, damping: 15 }}
            className="mx-auto mb-6 w-20 h-20 gradient-primary/20 rounded-2xl flex items-center justify-center"
          >
            <AlertTriangle className="h-10 w-10 text-primary" />
          </motion.div>

          <Card className="shadow-premium">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Dashboard Error</CardTitle>
              <CardDescription className="text-muted-foreground">
                Something went wrong while loading your dashboard.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-muted/50 rounded-lg text-left">
                <p className="font-mono text-sm text-muted-foreground">
                  {error.message || "An unexpected error occurred"}
                </p>
              </div>

              <Button
                onClick={() => setShowDetails(!showDetails)}
                variant="ghost"
                className="w-full justify-start gap-2"
              >
                <span>{showDetails ? "Hide" : "Show"} Error Details</span>
              </Button>

              {showDetails && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="p-3 bg-destructive/10 rounded-lg text-left text-sm text-destructive font-mono"
                >
                  <pre>{error.message}</pre>
                  {error.digest && (
                    <p className="mt-1">Digest: {error.digest}</p>
                  )}
                </motion.div>
              )}

              <div className="space-y-3 pt-2">
                <Button
                  onClick={reset}
                  className="w-full gradient-primary text-white"
                  size="lg"
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Retry Dashboard
                </Button>

                <Button
                  onClick={() => router.push("/")}
                  variant="outline"
                  className="w-full"
                  size="lg"
                >
                  <LayoutDashboard className="mr-2 h-4 w-4" />
                  Go to Dashboard
                </Button>

                <Button
                  onClick={handleLogout}
                  variant="outline"
                  className="w-full text-destructive border-destructive/50 hover:bg-destructive/10"
                  size="lg"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </Button>
              </div>
            </CardContent>
          </Card>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Error ID: {error.digest?.slice(0, 8) || "unknown"}
          </p>
        </motion.div>
      </div>
    </div>
  );
}