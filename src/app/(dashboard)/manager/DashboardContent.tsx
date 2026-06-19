"use client";

import { motion } from "framer-motion";
import { ChartNoAxesCombined, Users, CalendarDays, FileText, TrendingUp, Clock, UserCheck, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useTeamStats } from "@/hooks/useReports";
import { useEmployees } from "@/hooks/useEmployees";
import { useAttendanceHistory } from "@/hooks/useAttendance";
import { format } from "date-fns";

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.07 } },
};

const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 0.4, 0.25, 1] as const } },
};

const statusBadge: Record<string, string> = {
  present: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  late: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  absent: "bg-destructive/10 text-destructive border-destructive/20",
};

export default function ManagerDashboard() {
  const router = useRouter();
  const { data: teamStatsData } = useTeamStats();
  const { data: employeesData } = useEmployees();
  const today = format(new Date(), "yyyy-MM-dd");
  const { data: attendanceData } = useAttendanceHistory(`start_date=${today}&end_date=${today}`);

  const stats = teamStatsData?.stats;
  const employees = employeesData?.employees || [];
  const todayAttendance = attendanceData?.attendance || [];

  const teamPreview = employees.slice(0, 5).map((emp: any) => {
    const empAttendance = todayAttendance.filter((a: any) => a.user_id === emp._id);
    const clockInRec = empAttendance.find((a: any) => a.type === "IN");
    return {
      name: emp.username,
      role: emp.department,
      status: clockInRec?.status || "absent",
      time: clockInRec ? format(new Date(clockInRec.timestamp), "hh:mm a") : "-",
      initials: emp.username.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2),
    };
  });

  const total = stats?.total_employees || employees.length || 0;
  const present = stats?.present_today || 0;
  const late = stats?.late_today || 0;
  const absent = stats?.absent_today || 0;
  const presentPercent = total > 0 ? Math.round((present / total) * 100) : 0;
  const latePercent = total > 0 ? Math.round((late / total) * 100) : 0;
  const absentPercent = total > 0 ? Math.round((absent / total) * 100) : 0;

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6 lg:space-y-8">
      <motion.div variants={item} className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2 lg:p-2.5 rounded-xl lg:rounded-2xl bg-gradient-to-br from-primary/20 to-violet-500/10 shadow-sm">
              <ChartNoAxesCombined className="h-5 w-5 lg:h-6 lg:w-6 text-primary" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl lg:text-2xl font-bold tracking-tight">Manager Dashboard</h1>
                <Sparkles className="h-3 w-3 lg:h-4 lg:w-4 text-amber-500" />
              </div>
              <p className="text-xs lg:text-sm text-muted-foreground/70">Track your team and review attendance.</p>
            </div>
          </div>
        </div>
        <Button onClick={() => router.push("/manager/team")} className="gradient-primary text-white shadow-lg shadow-primary/25 h-9 lg:h-10 px-4 lg:px-5 text-xs lg:text-sm gap-2 rounded-xl w-full lg:w-auto">
          <Users className="h-3.5 w-3.5 lg:h-4 lg:w-4" />
          Team
        </Button>
      </motion.div>

      <motion.div variants={item} className="grid gap-3 lg:gap-5 grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Team Members", value: String(total), trend: `${employees.length} total`, icon: Users, color: "from-primary/30 to-violet-500/10" },
          { label: "Present Today", value: String(present), trend: `${presentPercent}% attendance`, icon: UserCheck, color: "from-emerald-500/30 to-teal-500/10" },
          { label: "Late Today", value: String(late), trend: `${latePercent}% late`, icon: Clock, color: "from-amber-500/30 to-orange-500/10" },
          { label: "Absent Today", value: String(absent), trend: `${absentPercent}% absent`, icon: FileText, color: "from-blue-500/30 to-sky-500/10" },
        ].map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className="group relative rounded-xl lg:rounded-2xl bg-card border border-border/40 shadow-card hover:shadow-elevated transition-all duration-300 hover:-translate-y-0.5 overflow-hidden"
            >
              <div className="p-4 lg:p-5">
                <div className="flex items-center justify-between mb-2 lg:mb-3">
                  <span className="text-[10px] lg:text-xs font-semibold uppercase tracking-wider text-muted-foreground/60">{card.label}</span>
                  <div className={`p-1.5 lg:p-2 rounded-lg lg:rounded-xl bg-gradient-to-br ${card.color} group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="h-3.5 w-3.5 lg:h-4 lg:w-4 text-primary" />
                  </div>
                </div>
                <p className="text-xl lg:text-3xl font-bold tracking-tight">{card.value}</p>
                <div className="flex items-center gap-1.5 mt-1 lg:mt-1.5">
                  <span className="flex items-center gap-0.5 text-[10px] lg:text-xs font-medium text-emerald-600 bg-emerald-500/10 px-1.5 lg:px-2 py-0.5 rounded-full">
                    <TrendingUp className="h-2.5 w-2.5 lg:h-3 lg:w-3" />
                    {card.trend}
                  </span>
                </div>
                <div className="mt-2 lg:mt-3 h-1 bg-muted/50 rounded-full overflow-hidden">
                  <div className="h-full w-3/4 bg-gradient-to-r from-primary/40 to-violet-500/40 rounded-full group-hover:w-full transition-all duration-700" />
                </div>
              </div>
            </div>
          );
        })}
      </motion.div>

      <div className="grid gap-4 lg:gap-6 lg:grid-cols-2">
        <motion.div variants={item}>
          <div className="rounded-xl lg:rounded-2xl bg-card border border-border/40 shadow-card overflow-hidden">
            <div className="px-5 lg:px-6 pt-4 lg:pt-5 pb-3 lg:pb-4 border-b border-border/30">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-xs lg:text-sm">Team Overview</h3>
                  <p className="text-[10px] lg:text-xs text-muted-foreground/70 mt-0.5">Today&apos;s attendance status</p>
                </div>
                <Button variant="ghost" size="sm" onClick={() => router.push("/manager/team")} className="text-xs h-7 lg:h-8">View all</Button>
              </div>
            </div>
            <div className="p-1.5 lg:p-2">
              {teamPreview.map((m: any, i: number) => (
                <div key={i} className="flex items-center justify-between py-2 lg:py-2.5 px-3 lg:px-4 rounded-lg lg:rounded-xl hover:bg-muted/30 transition-all duration-200">
                  <div className="flex items-center gap-2 lg:gap-3 min-w-0">
                    <div className="w-7 h-7 lg:w-8 lg:h-8 rounded-full gradient-primary flex items-center justify-center text-white text-[10px] lg:text-[11px] font-bold shrink-0 shadow-sm">
                      {m.initials}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs lg:text-sm font-medium truncate">{m.name}</p>
                      <p className="text-[10px] lg:text-xs text-muted-foreground/60 truncate">{m.role}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 lg:gap-3 shrink-0 ml-2 lg:ml-3">
                    {m.time !== "-" && <span className="text-[10px] lg:text-[11px] text-muted-foreground/60 hidden lg:inline">{m.time}</span>}
                    <span className={`px-1.5 lg:px-2.5 py-0.5 rounded-full text-[10px] lg:text-[11px] font-medium border ${statusBadge[m.status] || statusBadge.absent}`}>
                      {m.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        <motion.div variants={item}>
          <div className="rounded-xl lg:rounded-2xl bg-card border border-border/40 shadow-card overflow-hidden">
            <div className="px-5 lg:px-6 pt-4 lg:pt-5 pb-3 lg:pb-4 border-b border-border/30">
              <h3 className="font-semibold text-xs lg:text-sm">Attendance Distribution</h3>
              <p className="text-[10px] lg:text-xs text-muted-foreground/70 mt-0.5">Team breakdown for today</p>
            </div>
            <div className="p-4 lg:p-6 space-y-3 lg:space-y-5">
              {[
                { label: "Present", value: presentPercent, color: "from-emerald-500 to-emerald-400" },
                { label: "Late", value: latePercent, color: "from-amber-500 to-amber-400" },
                { label: "Absent", value: absentPercent, color: "from-destructive to-rose-400" },
              ].map((item) => (
                <div key={item.label}>
                  <div className="flex justify-between text-xs lg:text-sm mb-1 lg:mb-2">
                    <span className="font-medium">{item.label}</span>
                    <span className="font-semibold">{item.value}%</span>
                  </div>
                  <div className="h-2 lg:h-2.5 bg-muted/50 rounded-full overflow-hidden shadow-inner">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${item.value}%` }}
                      transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
                      className={`h-full bg-gradient-to-r ${item.color} rounded-full shadow-sm`}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      <motion.div variants={item}>
        <div className="grid gap-2 lg:gap-3 grid-cols-1 lg:grid-cols-3">
          {[
            { label: "Team Attendance", desc: "View detailed team status", icon: Users, href: "/manager/team" },
            { label: "Reports", desc: "Generate attendance reports", icon: FileText, href: "/manager/reports" },
            { label: "My History", desc: "Your personal records", icon: CalendarDays, href: "/manager/history" },
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
