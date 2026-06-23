"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Settings, Shield, Bell, Globe, Lock, Clock, Save, Wifi, Loader2, Mail, Plus, X } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useSettings, useUpdateSettings } from "@/hooks/useSettings";
import { toast } from "sonner";

export default function AdminSettingsPage() {
  const { data, isLoading } = useSettings();
  const updateMutation = useUpdateSettings();

  const [settings, setSettings] = useState({
    system_name: "Triple-Lock Attendance System",
    timezone: "America/New_York",
    work_hours_start: "09:00",
    work_hours_end: "18:00",
    late_threshold_minutes: 15,
    gps_enabled: true,
    ip_verification_enabled: true,
    late_arrival_alerts: true,
    absence_reports: true,
    weekly_summary: true,
    email_notifications_enabled: false,
    smtp_host: "",
    smtp_port: 587,
    smtp_user: "",
    smtp_pass: "",
    smtp_from: "",
    notification_emails: [] as string[],
  });

  const [emailInput, setEmailInput] = useState("");

  useEffect(() => {
    if (data?.settings) {
      const s = data.settings;
      setSettings({
        system_name: s.system_name || "Triple-Lock Attendance System",
        timezone: s.timezone || "America/New_York",
        work_hours_start: s.work_hours_start || "09:00",
        work_hours_end: s.work_hours_end || "18:00",
        late_threshold_minutes: s.late_threshold_minutes ?? 15,
        gps_enabled: s.gps_enabled ?? true,
        ip_verification_enabled: s.ip_verification_enabled ?? true,
        late_arrival_alerts: s.late_arrival_alerts ?? true,
        absence_reports: s.absence_reports ?? true,
        weekly_summary: s.weekly_summary ?? true,
        email_notifications_enabled: s.email_notifications_enabled ?? false,
        smtp_host: s.smtp_host || "",
        smtp_port: s.smtp_port || 587,
        smtp_user: s.smtp_user || "",
        smtp_pass: s.smtp_pass || "",
        smtp_from: s.smtp_from || "",
        notification_emails: s.notification_emails || [],
      });
    }
  }, [data]);

  const updateSetting = (key: string, value: string | boolean | number | string[]) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    try {
      await updateMutation.mutateAsync(settings);
      toast.success("Settings saved successfully");
    } catch (err: any) {
      toast.error(err.message || "Failed to save settings");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <Settings className="h-10 w-10 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Settings</h1>
            <p className="text-muted-foreground">Configure system preferences and security</p>
          </div>
        </div>
        <Button onClick={handleSave} className="gradient-primary text-white gap-2" disabled={updateMutation.isPending}>
          {updateMutation.isPending ? <><Loader2 className="h-4 w-4 animate-spin" /> Saving...</> : <><Save className="h-4 w-4" /> Save Changes</>}
        </Button>
      </motion.div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="shadow-premium">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-primary" />
              <CardTitle>System Settings</CardTitle>
            </div>
            <CardDescription>General system configuration</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1 block">System Name</label>
              <Input
                value={settings.system_name}
                onChange={(e) => updateSetting("system_name", e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Timezone</label>
              <select
                value={settings.timezone}
                onChange={(e) => updateSetting("timezone", e.target.value)}
                className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="America/New_York">America/New_York (EST)</option>
                <option value="America/Chicago">America/Chicago (CST)</option>
                <option value="America/Denver">America/Denver (MST)</option>
                <option value="America/Los_Angeles">America/Los_Angeles (PST)</option>
                <option value="Europe/London">Europe/London (GMT)</option>
                <option value="Asia/Tokyo">Asia/Tokyo (JST)</option>
              </select>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-premium">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              <CardTitle>Work Hours</CardTitle>
            </div>
            <CardDescription>Define standard working hours</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Start Time</label>
                <Input
                  type="time"
                  value={settings.work_hours_start}
                  onChange={(e) => updateSetting("work_hours_start", e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">End Time</label>
                <Input
                  type="time"
                  value={settings.work_hours_end}
                  onChange={(e) => updateSetting("work_hours_end", e.target.value)}
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Late Threshold (minutes)</label>
              <Input
                type="number"
                value={settings.late_threshold_minutes}
                onChange={(e) => updateSetting("late_threshold_minutes", Number(e.target.value))}
                min={1}
                max={120}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Employees arriving after this threshold are marked as late
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-premium">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              <CardTitle>Triple-Lock Verification</CardTitle>
            </div>
            <CardDescription>Configure security verification methods</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Globe className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">GPS Location</p>
                  <p className="text-sm text-muted-foreground">Verify location coordinates</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.gps_enabled}
                  onChange={(e) => updateSetting("gps_enabled", e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary" />
              </label>
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Wifi className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">IP Verification</p>
                  <p className="text-sm text-muted-foreground">Verify office network IP</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.ip_verification_enabled}
                  onChange={(e) => updateSetting("ip_verification_enabled", e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary" />
              </label>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-premium">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-primary" />
              <CardTitle>Notifications</CardTitle>
            </div>
            <CardDescription>Configure alert preferences</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Late Arrival Alerts</p>
                <p className="text-sm text-muted-foreground">Notify HR when employees arrive late</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.late_arrival_alerts}
                  onChange={(e) => updateSetting("late_arrival_alerts", e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary" />
              </label>
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Absence Reports</p>
                <p className="text-sm text-muted-foreground">Daily summary of absent employees</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.absence_reports}
                  onChange={(e) => updateSetting("absence_reports", e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary" />
              </label>
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Weekly Summary</p>
                <p className="text-sm text-muted-foreground">Weekly attendance digest for managers</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.weekly_summary}
                  onChange={(e) => updateSetting("weekly_summary", e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary" />
              </label>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-premium md:col-span-2">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-primary" />
              <CardTitle>Email Notifications</CardTitle>
            </div>
            <CardDescription>Configure SMTP and notification email recipients</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Enable Email Notifications</p>
                <p className="text-sm text-muted-foreground">Send alerts via email in addition to in-app notifications</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.email_notifications_enabled}
                  onChange={(e) => updateSetting("email_notifications_enabled", e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary" />
              </label>
            </div>

            {settings.email_notifications_enabled && (
              <>
                <Separator />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-1 block">SMTP Host</label>
                    <Input
                      placeholder="smtp.gmail.com"
                      value={settings.smtp_host}
                      onChange={(e) => updateSetting("smtp_host", e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">SMTP Port</label>
                    <Input
                      type="number"
                      value={settings.smtp_port}
                      onChange={(e) => updateSetting("smtp_port", Number(e.target.value))}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">SMTP User</label>
                    <Input
                      placeholder="user@gmail.com"
                      value={settings.smtp_user}
                      onChange={(e) => updateSetting("smtp_user", e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">SMTP Password</label>
                    <Input
                      type="password"
                      placeholder="App password"
                      value={settings.smtp_pass}
                      onChange={(e) => updateSetting("smtp_pass", e.target.value)}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-sm font-medium mb-1 block">From Address</label>
                    <Input
                      placeholder="noreply@company.com"
                      value={settings.smtp_from}
                      onChange={(e) => updateSetting("smtp_from", e.target.value)}
                    />
                  </div>
                </div>

                <Separator />

                <div>
                  <label className="text-sm font-medium mb-2 block">Notification Recipients</label>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {settings.notification_emails.map((email, i) => (
                      <span key={i} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
                        {email}
                        <button
                          onClick={() => {
                            const updated = settings.notification_emails.filter((_: string, idx: number) => idx !== i);
                            updateSetting("notification_emails", updated);
                          }}
                          className="hover:text-destructive"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      placeholder="manager@company.com"
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && emailInput.trim()) {
                          e.preventDefault();
                          updateSetting("notification_emails", [...settings.notification_emails, emailInput.trim()]);
                          setEmailInput("");
                        }
                      }}
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => {
                        if (emailInput.trim()) {
                          updateSetting("notification_emails", [...settings.notification_emails, emailInput.trim()]);
                          setEmailInput("");
                        }
                      }}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Press Enter or click + to add an email</p>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
