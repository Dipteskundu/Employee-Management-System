"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Loader2, Lock, Mail } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { loginSchema, type LoginInput } from "@/lib/validations";
import { ROLES } from "@/lib/constants";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
const DEMO_LOGINS = [
  {
    label: "Admin",
    role: ROLES.ADMIN,
    identifier: "admin@triplelock.local",
    password: "Admin@2026!",
  },
  {
    label: "Manager",
    role: ROLES.MANAGER,
    identifier: "manager@triplelock.local",
    password: "Manager@2026!",
  },
  {
    label: "Employee",
    role: ROLES.EMPLOYEE,
    identifier: "employee@triplelock.local",
    password: "Employee@2026!",
  },
] as const;

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginInput) => {
    setIsLoading(true);
    try {
      const payload = {
        identifier: data.identifier.trim(),
        password: data.password,
      };

      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Login failed");
      }

      // Store token in localStorage
      if (!result.token || !result.user) {
        throw new Error("Login succeeded but the server did not return a valid session");
      }

      localStorage.setItem("token", result.token);
      localStorage.setItem("user", JSON.stringify(result.user));

      toast.success("Login successful!", {
        description: "Welcome back to Triple-Lock Attendance",
      });

      // Redirect based on role
      const role = result.user.role;
      if (role === "admin") {
        router.push("/admin");
      } else if (role === "manager") {
        router.push("/manager");
      } else {
        router.push("/employee");
      }
    } catch (error) {
      toast.error("Login failed", {
        description: error instanceof Error ? error.message : "Please try again",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async (demoLogin: typeof DEMO_LOGINS[number]) => {
    const credentials = {
      identifier: demoLogin.identifier,
      password: demoLogin.password,
    };

    setValue("identifier", credentials.identifier, { shouldValidate: true });
    setValue("password", credentials.password, { shouldValidate: true });
    await onSubmit(credentials);
  };

  return (
    <div className="min-h-screen flex items-center justify-center gradient-primary p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="shadow-premium-lg border-0">
          <CardHeader className="space-y-1 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
              className="mx-auto w-16 h-16 gradient-primary rounded-2xl flex items-center justify-center mb-4"
            >
              <Lock className="w-8 h-8 text-white" />
            </motion.div>
            <CardTitle className="text-2xl font-bold">Welcome Back</CardTitle>
            <CardDescription className="text-muted-foreground">
              Sign in to access your attendance dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="identifier">Email or Username</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="identifier"
                    placeholder="name@company.com or username"
                    className="pl-10"
                    {...register("identifier")}
                  />
                </div>
                {errors.identifier && (
                  <p className="text-sm text-destructive">{errors.identifier.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    className="pl-10 pr-10"
                    {...register("password")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-sm text-destructive">{errors.password.message}</p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full gradient-primary text-white"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  "Sign In"
                )}
              </Button>
            </form>

            <div className="mt-5 rounded-xl border border-primary/20 bg-primary/5 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-foreground">Demo access</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Use these pre-created accounts for quick testing or product walkthroughs.
                  </p>
                </div>
              </div>

              <div className="mt-4 grid gap-3">
                {DEMO_LOGINS.map((demoLogin) => (
                  <button
                    key={demoLogin.role}
                    type="button"
                    onClick={() => void handleDemoLogin(demoLogin)}
                    disabled={isLoading}
                    className="rounded-xl border border-border bg-background/80 px-3 py-3 text-left transition-colors hover:border-primary/40 hover:bg-background disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-foreground">{demoLogin.label}</p>
                        <p className="text-xs text-muted-foreground capitalize">{demoLogin.role}</p>
                      </div>
                      <span className="rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-semibold text-primary">
                        Click to fill
                      </span>
                    </div>
                    <div className="mt-2 grid gap-1 text-xs font-mono text-muted-foreground">
                      <div className="flex items-center justify-between gap-2">
                        <span>Email</span>
                        <span className="break-all text-right text-foreground">{demoLogin.identifier}</span>
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <span>Password</span>
                        <span className="text-foreground">{demoLogin.password}</span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-6 text-center text-sm text-muted-foreground">
              Don&apos;t have an account?{" "}
              <Link
                href="/register"
                className="text-primary hover:text-primary-dark font-medium"
              >
                Sign up
              </Link>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
