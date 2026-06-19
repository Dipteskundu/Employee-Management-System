"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Home, RefreshCw, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    console.error("Application error:", error);
  }, [error]);

  if (!mounted) {
    return null;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="w-full max-w-md text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200, damping: 15 }}
          className="mx-auto mb-6 w-20 h-20 gradient-primary rounded-2xl flex items-center justify-center"
        >
          <AlertTriangle className="h-10 w-10 text-white" />
        </motion.div>

        <Card className="shadow-premium">
          <CardHeader>
            <CardTitle className="text-2xl">Something went wrong</CardTitle>
            <CardDescription className="text-muted-foreground">
              We encountered an unexpected error. Our team has been notified.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-muted/50 rounded-lg text-left">
              <p className="font-mono text-sm text-muted-foreground">
                {error.message || "An unknown error occurred"}
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <Button
                onClick={reset}
                className="gradient-primary text-white"
                size="lg"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Try Again
              </Button>
              <Link href="/login">
                <Button variant="outline" className="w-full" size="lg">
                  <Home className="mr-2 h-4 w-4" />
                  Go to Login
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <p className="mt-6 text-sm text-muted-foreground">
          Error ID: {error.digest?.slice(0, 8) || "unknown"}
        </p>
      </motion.div>
    </div>
  );
}