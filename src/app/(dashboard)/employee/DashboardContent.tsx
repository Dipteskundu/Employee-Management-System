"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Clock, MapPin, Wifi, CheckCircle2, ArrowRight, CalendarDays, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { getUser } from "@/lib/api";
import { useAttendanceHistory } from "@/hooks/useAttendance";
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth, format } from "date-fns";

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 0.4, 0.25, 1] as const } },
};

const verificationSteps = [
  { step: 1, title: "Network Check", description: "Verifying office IP address", icon: Wifi },
  { step: 2, title: "Location Check", description: "Verifying GPS coordinates", icon: MapPin },
];

export default function EmployeeDashboard() {
  const router = useRouter();
  const [username, setUsername] = useState("User");

  const today = format(new Date(), "yyyy-MM-dd");
  const weekStart = format(startOfWeek(new Date(), { weekStartsOn: 1 }), "yyyy-MM-dd");
  const weekEnd = format(endOfWeek(new Date(), { weekStartsOn: 1 }), "yyyy-MM-dd");
  const monthStart = format(startOfMonth(new Date()), "yyyy-MM-dd");
  const monthEnd = format(endOfMonth(new Date()), "yyyy-MM-dd");

  const { data: todayData } = useAttendanceHistory(`start_date=${today}&end_date=${today}`);
  const { data: weekData } = useAttendanceHistory(`start_date=${weekStart}&end_date=${weekEnd}`);
  const { data: monthData } = useAttendanceHistory(`start_date=${monthStart}&end_date=${monthEnd}`);

  useEffect(() => {
    const stored = getUser();
    if (stored) setUsername(stored.username);
  }, []);

  const todayRecords = todayData?.attendance || [];
  const weekRecords = weekData?.attendance || [];
  const monthRecords = monthData?.attendance || [];

  const clockInRecord = todayRecords.find((r: any) => r.type === "IN");
  const clockOutRecord = todayRecords.find((r: any) => r.type === "OUT");
  const isClockedIn = !!clockInRecord;

  const status = isClockedIn ? (clockInRecord.status === "late" ? "Late" : "Present") : "Not Clocked In";
  const statusColor = isClockedIn ? (clockInRecord.status === "late" ? "bg-amber-500" : "bg-emerald-500") : "bg-muted-foreground";

  let workHours = "-";
  if (isClockedIn) {
    const clockInTime = new Date(clockInRecord.timestamp);
    const endTime = clockOutRecord ? new Date(clockOutRecord.timestamp) : new Date();
    const diffMs = endTime.getTime() - clockInTime.getTime();
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    workHours = `${hours}h ${minutes}m`;
  }

  const uniqueDaysThisWeek = new Set(weekRecords.filter((r: any) => r.type === "IN").map((r: any) => format(new Date(r.timestamp), "yyyy-MM-dd"))).size;
  const uniqueDaysThisMonth = new Set(monthRecords.filter((r: any) => r.type === "IN").map((r: any) => format(new Date(r.timestamp), "yyyy-MM-dd"))).size;

  const recentActivity: { date: string; time: string; type: string; status: string }[] = todayRecords.slice(0, 4).map((r: any) => ({
    date: format(new Date(r.timestamp), "MMM dd"),
    time: format(new Date(r.timestamp), "h:mm a"),
    type: r.type === "IN" ? "Clock In" : "Clock Out",
    status: r.status,
  }));

  if (recentActivity.length === 0) {
    recentActivity.push({ date: "Today", time: "--", type: "No activity", status: "absent" });
  }

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6 lg:space-y-8">
      <motion.div variants={item} className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2 lg:p-2.5 rounded-xl lg:rounded-2xl bg-gradient-to-br from-primary/20 to-violet-500/10 shadow-sm">
              <Clock className="h-5 w-5 lg:h-6 lg:w-6 text-primary" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl lg:text-2xl font-bold tracking-tight">Welcome back, {username.split(" ")[0]}</h1>
                <Sparkles className="h-3 w-3 lg:h-4 lg:w-4 text-amber-500" />
              </div>
              <p className="text-xs lg:text-sm text-muted-foreground/70">Here&apos;s your attendance status for today</p>
            </div>
          </div>
        </div>
        <Button onClick={() => router.push("/employee/attendance")} className="gradient-primary text-white shadow-lg shadow-primary/25 h-9 lg:h-10 px-4 lg:px-5 text-xs lg:text-sm gap-2 rounded-xl w-full lg:w-auto">
          <Clock className="h-3.5 w-3.5 lg:h-4 lg:w-4" />
          {isClockedIn && !clockOutRecord ? "Clock Out" : "Clock In"}
        </Button>
      </motion.div>

      <motion.div variants={item} className="grid gap-3 lg:gap-5 grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Status", value: status, sub: isClockedIn ? `Clocked in at ${format(new Date(clockInRecord.timestamp), "h:mm a")}` : "Not on the clock", icon: Clock, gradient: "from-emerald-500/20 to-teal-500/10" },
          { label: "Work Hours", value: workHours, sub: clockOutRecord ? "Shift completed" : isClockedIn ? "Still on shift" : "No shift today", icon: Clock, gradient: "from-blue-500/20 to-sky-500/10" },
          { label: "This Week", value: `${uniqueDaysThisWeek}/5`, sub: "Days present", icon: CalendarDays, gradient: "from-violet-500/20 to-purple-500/10" },
          { label: "This Month", value: `${uniqueDaysThisMonth}/22`, sub: "Days present", icon: CheckCircle2, gradient: "from-amber-500/20 to-orange-500/10" },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="group relative rounded-xl lg:rounded-2xl bg-card border border-border/40 shadow-card hover:shadow-elevated transition-all duration-300 hover:-translate-y-0.5 overflow-hidden"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-40 group-hover:opacity-60 transition-opacity`} />
              <div className="relative p-4 lg:p-5">
                <div className="flex items-center justify-between mb-2 lg:mb-3">
                  <span className="text-[10px] lg:text-xs font-semibold uppercase tracking-wider text-muted-foreground/60">{stat.label}</span>
                  <div className={`p-1.5 lg:p-2 rounded-lg lg:rounded-xl bg-gradient-to-br ${stat.gradient} group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="h-3.5 w-3.5 lg:h-4 lg:w-4 text-primary" />
                  </div>
                </div>
                {stat.label === "Status" ? (
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 lg:w-2.5 lg:h-2.5 rounded-full ${statusColor} shadow-sm`} />
                    <span className="text-xl lg:text-2xl font-bold tracking-tight">{stat.value}</span>
                  </div>
                ) : (
                  <p className="text-xl lg:text-2xl font-bold tracking-tight">{stat.value}</p>
                )}
                <p className="text-[10px] lg:text-xs text-muted-foreground/60 mt-0.5 lg:mt-1">{stat.sub}</p>
              </div>
            </div>
          );
        })}
      </motion.div>

      <div className="grid gap-4 lg:gap-6 lg:grid-cols-2">
        <motion.div variants={item}>
          <div className="rounded-xl lg:rounded-2xl bg-card border border-border/40 shadow-card overflow-hidden">
            <div className="px-5 lg:px-6 pt-4 lg:pt-5 pb-3 lg:pb-4 border-b border-border/30">
              <h3 className="font-semibold text-xs lg:text-sm">Triple-Lock Verification</h3>
              <p className="text-[10px] lg:text-xs text-muted-foreground/70 mt-0.5">Complete all verification steps to clock in</p>
            </div>
            <div className="p-4 lg:p-5 space-y-3 lg:space-y-4">
              <div className="h-1.5 bg-muted/50 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: isClockedIn ? "100%" : "0%" }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className="h-full bg-gradient-to-r from-primary to-violet-500 rounded-full"
                />
              </div>
              <p className="text-[10px] lg:text-xs text-muted-foreground/60">{isClockedIn ? "3 of 3 steps completed" : "Ready to start"}</p>

              {verificationSteps.map((step, i) => (
                <motion.div
                  key={step.step}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + i * 0.1 }}
                  className={`flex items-center gap-3 lg:gap-4 p-3 lg:p-4 rounded-lg lg:rounded-xl ${isClockedIn ? "bg-emerald-500/10 border-emerald-500/20" : "bg-muted/30 border-border/50"} border`}
                >
                  <div className={`p-1.5 lg:p-2 rounded-lg ${isClockedIn ? "bg-emerald-500/10" : "bg-muted/30"} shrink-0`}>
                    <step.icon className={`h-4 w-4 lg:h-5 lg:w-5 ${isClockedIn ? "text-emerald-500" : "text-muted-foreground/40"}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs lg:text-sm font-medium ${isClockedIn ? "text-emerald-500" : "text-muted-foreground/40"}`}>
                      Step {step.step}: {step.title}
                    </p>
                    <p className="text-[10px] lg:text-xs text-muted-foreground/60">{step.description}</p>
                  </div>
                  {isClockedIn && <CheckCircle2 className="h-4 w-4 lg:h-5 lg:w-5 text-emerald-500 shrink-0" />}
                </motion.div>
              ))}

              <Button
                onClick={() => router.push("/employee/attendance")}
                className="w-full mt-1 h-10 lg:h-11 gradient-primary text-white shadow-lg shadow-primary/25 gap-2 rounded-xl text-xs lg:text-sm"
              >
                {isClockedIn && !clockOutRecord ? "Clock Out" : "Clock In"}
                <ArrowRight className="h-3.5 w-3.5 lg:h-4 lg:w-4" />
              </Button>
            </div>
          </div>
        </motion.div>

        <motion.div variants={item}>
          <div className="rounded-xl lg:rounded-2xl bg-card border border-border/40 shadow-card overflow-hidden">
            <div className="px-5 lg:px-6 pt-4 lg:pt-5 pb-3 lg:pb-4 border-b border-border/30">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-xs lg:text-sm">Today's Activity</h3>
                  <p className="text-[10px] lg:text-xs text-muted-foreground/70 mt-0.5">Your latest attendance records</p>
                </div>
                <Button variant="ghost" size="sm" onClick={() => router.push("/employee/history")} className="text-xs h-7 lg:h-8">View all</Button>
              </div>
            </div>
            <div className="p-1.5 lg:p-2">
              {recentActivity.map((a, i) => (
                <div key={i} className="flex items-center justify-between py-2 lg:py-3 px-3 lg:px-4 rounded-lg lg:rounded-xl hover:bg-muted/30 transition-all duration-200">
                  <div className="flex items-center gap-2 lg:gap-3 min-w-0">
                    <div className={`w-1.5 h-1.5 lg:w-2 lg:h-2 rounded-full shrink-0 shadow-sm ${
                      a.status === "present" ? "bg-emerald-500 shadow-emerald-500/40" :
                      a.status === "late" ? "bg-amber-500 shadow-amber-500/40" :
                      a.status === "overtime" ? "bg-blue-500 shadow-blue-500/40" :
                      "bg-muted-foreground/30"
                    }`} />
                    <div className="min-w-0">
                      <p className="text-xs lg:text-sm font-medium truncate">{a.type}</p>
                      <p className="text-[10px] lg:text-xs text-muted-foreground/60">{a.date} at {a.time}</p>
                    </div>
                  </div>
                  <Badge className={`shrink-0 ml-2 lg:ml-3 text-[10px] lg:text-xs ${
                    a.status === "present" ? "gradient-success text-white" :
                    a.status === "late" ? "gradient-warning text-white" :
                    a.status === "overtime" ? "bg-info text-info-foreground" :
                    "bg-muted text-muted-foreground"
                  }`}>
                    {a.status !== "absent" ? a.status : "--"}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      <motion.div variants={item}>
        <div className="grid gap-2 lg:gap-3 grid-cols-1 lg:grid-cols-3">
          {[
            { label: "Clock In / Out", desc: "Complete triple-lock verification", icon: Clock, href: "/employee/attendance" },
            { label: "My History", desc: "View your attendance records", icon: CalendarDays, href: "/employee/history" },
            { label: "Profile", desc: "Manage your account settings", icon: CheckCircle2, href: "/profile" },
          ].map((action) => {
            const Icon = action.icon;
            return (
              <button
                key={action.label}
                onClick={() => router.push(action.href)}
                className="group flex items-center gap-3 lg:gap-4 p-3 lg:p-4 rounded-lg lg:rounded-xl bg-card border border-border/40 shadow-card hover:shadow-elevated hover:-translate-y-0.5 transition-all duration-200 text-left"
              >
                <div className="p-2 lg:p-2.5 rounded-lg lg:rounded-xl bg-gradient-to-br from-primary/10 to-violet-500/10 group-hover:scale-110 transition-transform duration-200 shrink-0">
                  <Icon className="h-3.5 w-3.5 lg:h-4 lg:w-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs lg:text-sm font-semibold">{action.label}</p>
                  <p className="text-[10px] lg:text-xs text-muted-foreground/60 truncate">{action.desc}</p>
                </div>
                <ArrowRight className="h-3.5 w-3.5 lg:h-4 lg:w-4 text-muted-foreground/30 group-hover:text-primary group-hover:translate-x-0.5 transition-all shrink-0" />
              </button>
            );
          })}
        </div>
      </motion.div>
    </motion.div>
  );
}
