"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  User as UserIcon, Mail, Phone, Building2, Shield, Save, ArrowLeft,
  Loader2, Calendar, Clock, Fingerprint, CheckCircle2, XCircle,
  AlertTriangle, LogOut, Hash
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getUser, getToken, logout, updateProfile } from "@/lib/api";
import { type User } from "@/types";

const fadeUp = (delay: number) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, delay, ease: "easeOut" as const },
});

const roleConfig: Record<string, { label: string; color: string; gradient: string; icon: string }> = {
  admin:    { label: "Administrator", color: "text-purple-600",  gradient: "from-purple-500/20 to-violet-500/10", icon: "🛡️" },
  manager:  { label: "Manager",       color: "text-blue-600",    gradient: "from-blue-500/20 to-sky-500/10",     icon: "📋" },
  employee: { label: "Employee",      color: "text-emerald-600", gradient: "from-emerald-500/20 to-teal-500/10", icon: "👤" },
};

export default function ProfilePageContent() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [username, setUsername] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [department, setDepartment] = useState("");

  useEffect(() => {
    const token = getToken();
    const storedUser = getUser();
    if (!token || !storedUser) {
      router.replace("/login");
      return;
    }
    setUser(storedUser);
    setUsername(storedUser.username);
    setPhoneNumber(storedUser.phone_number);
    setDepartment(storedUser.department);
    setLoading(false);
  }, [router]);

  const handleSave = async () => {
    setError("");
    setSuccess("");
    if (!username.trim()) { setError("Username is required"); return; }
    if (!phoneNumber.trim()) { setError("Phone number is required"); return; }
    if (!department.trim()) { setError("Department is required"); return; }

    setSaving(true);
    try {
      const res = await updateProfile({ username, phone_number: phoneNumber, department });
      const updatedUser = { ...user!, ...res.user };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setUser(updatedUser);
      setSuccess("Profile updated successfully");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      setError(err.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center">
              <Loader2 className="h-8 w-8 text-white animate-spin" />
            </div>
            <motion.div
              className="absolute -inset-2 rounded-2xl border-2 border-primary/30"
              animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </div>
          <p className="text-muted-foreground font-medium animate-pulse">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const config = roleConfig[user.role] || roleConfig.employee;
  const initials = user.username
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const memberSince = user.created_at
    ? new Date(user.created_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
    : "N/A";

  const daysSince = user.created_at
    ? Math.floor((Date.now() - new Date(user.created_at).getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      {/* Top Navigation */}
      <motion.div {...fadeUp(0)} className="flex items-center justify-between">
        <Button variant="ghost" className="gap-2 text-muted-foreground hover:text-foreground" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
      </motion.div>

      {/* ─── Hero Section ─── */}
      <motion.div {...fadeUp(0.05)} className="relative overflow-hidden rounded-2xl bg-card border border-border shadow-premium-lg">
        <div className="absolute inset-0 gradient-primary opacity-90" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.15)_0%,transparent_60%)]" />
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4" />

        <div className="relative z-10 p-6 sm:p-8 flex flex-col sm:flex-row items-center sm:items-end gap-6">
          <div className="relative">
            <div className="w-28 h-28 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-white text-4xl font-bold shadow-2xl ring-4 ring-white/30">
              {initials}
            </div>
            <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-emerald-400 border-2 border-white flex items-center justify-center">
              <CheckCircle2 className="h-4 w-4 text-white" />
            </div>
          </div>

          <div className="text-center sm:text-left sm:pb-1 flex-1">
            <h1 className="text-3xl font-bold text-white">{user.username}</h1>
            <p className="text-white/80 text-sm mt-0.5">{user.email}</p>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm text-white text-xs font-medium">
                <Shield className="h-3 w-3" />
                {config.label}
              </span>
              {user.is_active && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-400/30 backdrop-blur-sm text-white text-xs font-medium">
                  <CheckCircle2 className="h-3 w-3" />
                  Active
                </span>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* ─── Quick Stats ─── */}
      <motion.div {...fadeUp(0.1)} className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Member Since", value: memberSince, icon: Calendar, gradient: "from-violet-500/20 to-purple-500/10", iconColor: "text-violet-500" },
          { label: "Days Active", value: `${daysSince} days`, icon: Clock, gradient: "from-blue-500/20 to-sky-500/10", iconColor: "text-blue-500" },
          { label: "Department", value: user.department, icon: Building2, gradient: "from-emerald-500/20 to-teal-500/10", iconColor: "text-emerald-500" },
          { label: "Role", value: config.label, icon: Shield, gradient: "from-amber-500/20 to-orange-500/10", iconColor: "text-amber-500" },
        ].map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className={`rounded-xl bg-gradient-to-br ${stat.gradient} border border-border/60 p-4 shadow-premium`}>
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg bg-background/60 ${stat.iconColor}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground truncate">{stat.label}</p>
                  <p className="text-sm font-semibold truncate">{stat.value}</p>
                </div>
              </div>
            </div>
          );
        })}
      </motion.div>

      {/* ─── Main Content: Two Columns ─── */}
      <div className="grid lg:grid-cols-5 gap-8">
        {/* Left Column - Edit Form */}
        <motion.div {...fadeUp(0.15)} className="lg:col-span-3 space-y-6">
          <Card className="shadow-premium border-border/80 overflow-hidden">
            <div className="h-1.5 gradient-primary" />
            <CardHeader className="pb-0">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-primary/10">
                  <UserIcon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-lg">Personal Information</CardTitle>
                  <CardDescription>Update your profile details</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              {/* Username */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium flex items-center gap-2">
                  <UserIcon className="h-3.5 w-3.5 text-muted-foreground" />
                  Username
                </label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="pl-10 h-11 bg-background"
                    placeholder="Enter username"
                  />
                </div>
              </div>

              {/* Email (read-only) */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input value={user.email} disabled className="pl-10 h-11 bg-muted/40" />
                </div>
                <p className="text-xs text-muted-foreground/70">Email address cannot be changed</p>
              </div>

              {/* Phone */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="pl-10 h-11 bg-background"
                    placeholder="Enter phone number"
                  />
                </div>
              </div>

              {/* Department */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                  Department
                </label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="pl-10 h-11 bg-background"
                    placeholder="Enter department"
                  />
                </div>
              </div>

              {/* Messages */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="flex items-start gap-3 p-4 rounded-xl bg-destructive/10 border border-destructive/20"
                >
                  <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                  <p className="text-sm text-destructive">{error}</p>
                </motion.div>
              )}

              {success && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="flex items-start gap-3 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20"
                >
                  <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                  <p className="text-sm text-emerald-600">{success}</p>
                </motion.div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <Button
                  variant="outline"
                  className="flex-1 h-11"
                  onClick={() => router.back()}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1 h-11 gradient-primary text-white gap-2 shadow-lg shadow-primary/25"
                  onClick={handleSave}
                  disabled={saving}
                >
                  {saving ? (
                    <><Loader2 className="h-4 w-4 animate-spin" /> Saving...</>
                  ) : (
                    <><Save className="h-4 w-4" /> Save Changes</>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Right Column - Account Details & Actions */}
        <motion.div {...fadeUp(0.2)} className="lg:col-span-2 space-y-6">
          {/* Account Details */}
          <Card className="shadow-premium border-border/80 overflow-hidden">
            <div className="h-1.5 bg-gradient-to-r from-blue-500 to-cyan-500" />
            <CardHeader className="pb-0">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-blue-500/10">
                  <Fingerprint className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <CardTitle className="text-lg">Account</CardTitle>
                  <CardDescription>Details & identifiers</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              {[
                { label: "User ID", value: user._id, icon: Hash, color: "text-muted-foreground" },
                { label: "Role", value: config.label, icon: Shield, color: config.color },
                { label: "Status", value: user.is_active ? "Active" : "Inactive", icon: user.is_active ? CheckCircle2 : XCircle, color: user.is_active ? "text-emerald-500" : "text-muted-foreground" },
                { label: "Department", value: user.department, icon: Building2, color: "text-muted-foreground" },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.label} className="flex items-center justify-between p-3 rounded-xl bg-muted/40 border border-border/50">
                    <div className="flex items-center gap-3">
                      <div className="p-1.5 rounded-lg bg-background">
                        <Icon className={`h-4 w-4 ${item.color}`} />
                      </div>
                      <span className="text-sm text-muted-foreground">{item.label}</span>
                    </div>
                    <span className={`text-sm font-semibold ${item.label === "User ID" ? "font-mono text-xs" : ""}`}>
                      {item.value}
                    </span>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Sign Out */}
          <Card className="shadow-premium border-destructive/20 overflow-hidden">
            <div className="h-1.5 bg-gradient-to-r from-destructive to-rose-500" />
            <CardContent className="pt-6">
              <div className="flex flex-col gap-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-destructive/10">
                    <AlertTriangle className="h-5 w-5 text-destructive" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">Sign Out</p>
                    <p className="text-xs text-muted-foreground mt-0.5">End your current session and return to login</p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  className="w-full gap-2 text-destructive border-destructive/30 hover:bg-destructive/10 hover:text-destructive"
                  onClick={logout}
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}