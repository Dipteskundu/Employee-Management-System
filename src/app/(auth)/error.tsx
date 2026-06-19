"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { RefreshCw, AlertTriangle, Mail, Lock, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function AuthError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    console.error("Auth error:", error);
  }, [error]);

  if (!mounted) {
    return null;
  }

  const isAuthError = error.message.includes("401") || 
                      error.message.includes("403") || 
                      error.message.toLowerCase().includes("unauthorized") ||
                      error.message.toLowerCase().includes("invalid credentials") ||
                      error.message.toLowerCase().includes("token");

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="w-full max-w-md"
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
            <CardTitle className="text-2xl">
              {isAuthError ? "Authentication Error" : "Sign In Error"}
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              {isAuthError
                ? "Your session has expired or is invalid. Please sign in again."
                : "Something went wrong. Please try again or contact support."}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-muted/50 rounded-lg text-left">
              <p className="font-mono text-sm text-muted-foreground">
                {error.message || "An unknown error occurred"}
              </p>
            </div>

            <div className="space-y-3">
              {isAuthError ? (
                <>
                  <Button
                    onClick={() => router.push("/login")}
                    className="w-full gradient-primary text-white"
                    size="lg"
                  >
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Sign In Again
                  </Button>
                  <Link href="/register">
                    <Button variant="outline" className="w-full" size="lg">
                      <User className="mr-2 h-4 w-4" />
                      Create New Account
                    </Button>
                  </Link>
                </>
              ) : (
                <>
                  <Button
                    onClick={reset}
                    className="w-full gradient-primary text-white"
                    size="lg"
                  >
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Try Again
                  </Button>
                  <Link href="/login">
                    <Button variant="outline" className="w-full" size="lg">
                      <Lock className="mr-2 h-4 w-4" />
                      Back to Login
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Error ID: {error.digest?.slice(0, 8) || "unknown"}
        </p>
      </motion.div>
    </div>
  );
}