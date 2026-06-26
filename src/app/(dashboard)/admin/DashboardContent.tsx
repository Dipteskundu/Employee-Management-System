"use client";

import { motion } from "framer-motion";
import { ShieldCheck, Users, Building2, FileText, TrendingUp, Activity, ArrowRight, Sparkles, Edit2, Trash2, X, Loader2, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import { useTeamStats, useOfficeStats } from "@/hooks/useReports";
import { useEmployees, useUpdateEmployee, useDeleteEmployee } from "@/hooks/useEmployees";
import { useOffices } from "@/hooks/useOffices";
import { DEPARTMENTS } from "@/lib/constants";
import { toast } from "sonner";
import { useState } from "react";

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.07 } },
};

const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 0.4, 0.25, 1] as const } },
};

type EmployeeLike = {
  _id: string;
  username: string;
  department?: string;
  is_active?: boolean;
  role?: string;
};

export default function AdminDashboard() {
  const router = useRouter();
  const { data: teamStatsData } = useTeamStats();
  const { data: employeesData } = useEmployees();
  const { data: officesData } = useOffices();
  const { data: officeStatsData } = useOfficeStats();
  const updateMutation = useUpdateEmployee();
  const deleteMutation = useDeleteEmployee();

  const [editingEmployee, setEditingEmployee] = useState<any | null>(null);
  const [editForm, setEditForm] = useState({ username: "", email: "", department: "", role: "" });

  const openEdit = (emp: any) => {
    setEditForm({
      username: emp.username || "",
      email: emp.email || "",
      department: emp.department || "",
      role: emp.role || "employee",
    });
    setEditingEmployee(emp);
  };

  const handleEditSave = async () => {
    if (!editingEmployee) return;
    try {
      await updateMutation.mutateAsync({ id: editingEmployee._id, data: editForm });
      toast.success("Employee updated");
      setEditingEmployee(null);
    } catch (err: any) {
      toast.error(err.message || "Update failed");
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Delete "${name}"? This cannot be undone.`)) return;
    try {
      await deleteMutation.mutateAsync(id);
      toast.success("Employee deleted");
    } catch (err: any) {
      toast.error(err.message || "Delete failed");
    }
  };

  const stats = teamStatsData?.stats;
  const employees: EmployeeLike[] = employeesData?.employees || [];
  const offices = officesData?.offices || [];
  const officeStats = officeStatsData?.offices || [];

  const totalEmployees = employees.length;
  const activeEmployees = employees.filter((employee) => employee.is_active).length;
  const totalOffices = offices.length;
  const totalReports = 24;

  const attendanceRate = stats?.present_today && stats?.total_employees
    ? `${Math.round((stats.present_today / stats.total_employees) * 100)}%`
    : "N/A";

  const statsCards = [
    {
      label: "Total Employees",
      value: String(totalEmployees),
      trend: `${activeEmployees} active`,
      icon: Users,
      accent: "from-primary/30 to-violet-500/10",
      chip: "text-primary bg-primary/10",
    },
    {
      label: "Offices",
      value: String(totalOffices),
      trend: `${totalOffices} locations`,
      icon: Building2,
      accent: "from-blue-500/30 to-sky-500/10",
      chip: "text-sky-600 bg-sky-500/10",
    },
    {
      label: "Reports",
      value: String(totalReports),
      trend: "Generated this quarter",
      icon: FileText,
      accent: "from-emerald-500/30 to-teal-500/10",
      chip: "text-emerald-600 bg-emerald-500/10",
    },
    {
      label: "Attendance Rate",
      value: attendanceRate,
      trend: "Today",
      icon: Activity,
      accent: "from-amber-500/30 to-orange-500/10",
      chip: "text-amber-600 bg-amber-500/10",
    },
  ];

  const activities = employees.slice(0, 5).map((employee) => ({
    id: employee._id,
    user: employee.username,
    action: employee.is_active ? "Active" : "Inactive",
    target: employee.department || "General",
    time: employee.is_active ? "Registered" : "Paused",
    initials: employee.username
      .split(" ")
      .map((name) => name[0])
      .join("")
      .toUpperCase()
      .slice(0, 2),
    active: !!employee.is_active,
    _employee: employee,
  }));

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-5 lg:space-y-7">
      <motion.section
        variants={item}
        className="relative overflow-hidden rounded-3xl border border-border/40 bg-card/90 shadow-elevated"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(99,102,241,0.14),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(139,92,246,0.10),transparent_24%)]" />
        <div className="relative grid gap-5 p-5 sm:p-6 lg:grid-cols-[1.35fr_0.9fr] lg:gap-6 lg:p-7">
          <div className="flex flex-col gap-5">
            <div className="flex items-start gap-3 sm:gap-4">
              <div className="rounded-2xl bg-gradient-to-br from-primary/20 to-violet-500/10 p-3 shadow-sm">
                <ShieldCheck className="h-6 w-6 text-primary" />
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Admin Dashboard</h1>
                  <Sparkles className="h-4 w-4 text-amber-500" />
                </div>
                <p className="mt-1 max-w-2xl text-sm text-muted-foreground/75 sm:text-base">
                  Manage users, offices, and reporting from a cleaner workspace designed for quick decisions.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-primary/15 bg-primary/10 px-3 py-1 text-[11px] font-semibold text-primary">
                Live overview
              </span>
              <span className="rounded-full border border-border/60 bg-background/80 px-3 py-1 text-[11px] font-medium text-muted-foreground">
                {activeEmployees}/{totalEmployees} active employees
              </span>
              <span className="rounded-full border border-border/60 bg-background/80 px-3 py-1 text-[11px] font-medium text-muted-foreground">
                {totalOffices} office locations
              </span>
            </div>
          </div>

          <div className="flex flex-col justify-between gap-4 rounded-2xl border border-border/50 bg-background/70 p-4 shadow-card backdrop-blur">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground/70">
                Workspace actions
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                Jump straight into employee management, office setup, or analytics.
              </p>
            </div>
            <Button
              onClick={() => router.push("/admin/employees")}
              className="h-11 w-full gap-2 rounded-xl bg-gradient-to-r from-primary to-violet-500 text-white shadow-lg shadow-primary/20 sm:w-auto sm:self-start"
            >
              <Users className="h-4 w-4" />
              Employees
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </motion.section>

      <motion.section variants={item} className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4 sm:gap-4 lg:gap-5">
        {statsCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="group relative overflow-hidden rounded-2xl border border-border/40 bg-card shadow-card transition-all duration-300 hover:-translate-y-0.5 hover:shadow-elevated"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${stat.accent} opacity-55 transition-opacity duration-300 group-hover:opacity-75`} />
              <div className="relative flex h-full min-h-[150px] flex-col justify-between p-4 lg:p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground/70">
                      {stat.label}
                    </p>
                    <p className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">{stat.value}</p>
                  </div>
                  <div className={`rounded-xl p-2.5 ${stat.chip} transition-transform duration-300 group-hover:scale-110`}>
                    <Icon className="h-4 w-4" />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 text-[11px] font-medium text-emerald-700">
                    <TrendingUp className="h-3 w-3" />
                    {stat.trend}
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-background/70">
                    <div className="h-full w-3/4 rounded-full bg-gradient-to-r from-primary/35 to-violet-500/35 transition-all duration-700 group-hover:w-full" />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </motion.section>

      {officeStats.length > 0 && (
        <motion.section variants={item}>
          <div className="overflow-hidden rounded-2xl border border-border/40 bg-card shadow-card">
            <div className="border-b border-border/30 px-5 py-4 sm:px-6">
              <h3 className="text-sm font-semibold sm:text-base">Office Attendance Today</h3>
            </div>
            <div className="p-2 sm:p-3">
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {officeStats.map((stat: any) => (
                  <div key={stat.office_id} className="p-3 rounded-xl border border-border/40 bg-background/60">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold">{stat.office_name}</span>
                      <Badge className={stat.attendance_rate >= 80 ? "gradient-success text-white" : "bg-amber-100 text-amber-700"}>
                        {stat.attendance_rate}%
                      </Badge>
                    </div>
                    <div className="flex gap-3 text-xs text-muted-foreground">
                      <span>{stat.present}/{stat.total_employees} present</span>
                      <span>{stat.late} late</span>
                      <span>{stat.absent} absent</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.section>
      )}

      <div className="grid gap-4 xl:grid-cols-[1.35fr_0.9fr] lg:gap-6">
        <motion.section variants={item}>
          <div className="relative overflow-hidden rounded-2xl border border-border/40 bg-card shadow-card">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(99,102,241,0.08),transparent_40%),radial-gradient(circle_at_bottom_right,rgba(139,92,246,0.06),transparent_35%)]" />
            <div className="relative">
              <div className="flex items-center justify-between border-b border-border/30 px-5 py-4 sm:px-6">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-gradient-to-br from-primary/15 to-violet-500/10 p-2.5 shadow-sm">
                    <Users className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold tracking-tight sm:text-base">Registered Users</h3>
                    <p className="mt-0.5 text-[11px] text-muted-foreground/60 sm:text-xs">
                      Manage employee accounts and roles
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="group/gap gap-1.5 rounded-xl border border-primary/15 bg-primary/5 px-3 text-xs font-medium text-primary transition-all hover:border-primary/30 hover:bg-primary/10"
                  onClick={() => router.push("/admin/employees")}
                >
                  <Users className="h-3.5 w-3.5" />
                  View All
                  <ArrowRight className="h-3 w-3 transition-transform group-hover/gap:translate-x-0.5" />
                </Button>
              </div>

              <div className="p-3 sm:p-4">
                {activities.length > 0 ? (
                  <div className="space-y-2">
                    {activities.map((activity, index) => {
                      const roleColor = activity._employee?.role === "admin"
                        ? "from-violet-500 to-purple-600"
                        : activity._employee?.role === "manager"
                        ? "from-blue-500 to-indigo-600"
                        : "from-emerald-500 to-teal-600";
                      const roleBadge = activity._employee?.role === "admin"
                        ? "bg-violet-500/10 text-violet-700 border-violet-500/20"
                        : activity._employee?.role === "manager"
                        ? "bg-blue-500/10 text-blue-700 border-blue-500/20"
                        : "bg-emerald-500/10 text-emerald-700 border-emerald-500/20";
                      const roleLabel = activity._employee?.role === "admin"
                        ? "Admin"
                        : activity._employee?.role === "manager"
                        ? "Manager"
                        : "Employee";
                      const accentBar = activity._employee?.role === "admin"
                        ? "bg-gradient-to-b from-violet-500 to-purple-600"
                        : activity._employee?.role === "manager"
                        ? "bg-gradient-to-b from-blue-500 to-indigo-600"
                        : "bg-gradient-to-b from-emerald-500 to-teal-600";

                      return (
                        <motion.div
                          key={activity.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.06, duration: 0.4, ease: [0.25, 0.4, 0.25, 1] }}
                          className="group relative flex items-center gap-3 rounded-xl border border-border/40 bg-background/60 p-3 transition-all duration-200 hover:-translate-y-0.5 hover:border-border/60 hover:bg-background/80 hover:shadow-card sm:gap-4"
                        >
                          <div className={`absolute left-0 top-1/2 h-8 w-1 -translate-y-1/2 rounded-full ${accentBar}`} />

                          <div className="relative">
                            <div className={`flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br text-sm font-bold text-white shadow-md ${roleColor}`}>
                              {activity.initials}
                            </div>
                            <div className={`absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-background ${activity.active ? "bg-emerald-500" : "bg-slate-400"}`} />
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="truncate text-sm font-semibold sm:text-[15px]">{activity.user}</p>
                              <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold ${roleBadge}`}>
                                {roleLabel}
                              </span>
                            </div>
                            <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground/60">
                              <Building2 className="h-3 w-3" />
                              <span>{activity.target}</span>
                              <span className="text-border">·</span>
                              <span className={activity.active ? "text-emerald-600" : "text-muted-foreground/50"}>
                                {activity.action}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => openEdit(activity._employee)}
                              className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground/40 transition-all hover:bg-primary/10 hover:text-primary"
                            >
                              <Edit2 className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => handleDelete(activity.id, activity.user)}
                              className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground/40 transition-all hover:bg-destructive/10 hover:text-destructive"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-10 text-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-muted/50">
                      <Users className="h-5 w-5 text-muted-foreground/40" />
                    </div>
                    <p className="mt-3 text-sm font-medium text-muted-foreground/70">No users registered yet</p>
                    <p className="mt-1 text-xs text-muted-foreground/50">Employees will appear here once added</p>
                  </div>
                )}

                {editingEmployee && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-3 rounded-xl border border-primary/20 bg-primary/[0.02] p-4"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <div className="rounded-lg bg-primary/10 p-1.5">
                          <Edit2 className="h-3.5 w-3.5 text-primary" />
                        </div>
                        <h4 className="text-sm font-semibold">Edit Employee</h4>
                      </div>
                      <button onClick={() => setEditingEmployee(null)} className="rounded-lg p-1 text-muted-foreground/40 transition-colors hover:bg-muted/50 hover:text-foreground">
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div>
                        <label className="mb-1.5 block text-xs font-medium text-muted-foreground/70">Username</label>
                        <Input
                          value={editForm.username}
                          onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                          className="h-9 text-sm"
                        />
                      </div>
                      <div>
                        <label className="mb-1.5 block text-xs font-medium text-muted-foreground/70">Email</label>
                        <Input
                          value={editForm.email}
                          onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                          className="h-9 text-sm"
                        />
                      </div>
                      <div>
                        <label className="mb-1.5 block text-xs font-medium text-muted-foreground/70">Department</label>
                        <select
                          value={editForm.department}
                          onChange={(e) => setEditForm({ ...editForm, department: e.target.value })}
                          className="flex h-9 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                        >
                          <option value="">Select...</option>
                          {DEPARTMENTS.map((d: string) => <option key={d} value={d}>{d}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="mb-1.5 block text-xs font-medium text-muted-foreground/70">Role</label>
                        <select
                          value={editForm.role}
                          onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                          className="flex h-9 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                        >
                          <option value="employee">Employee</option>
                          <option value="manager">Manager</option>
                          <option value="admin">Admin</option>
                        </select>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-4">
                      <Button variant="outline" size="sm" onClick={() => setEditingEmployee(null)}>Cancel</Button>
                      <Button
                        size="sm"
                        className="gradient-primary text-white"
                        onClick={handleEditSave}
                        disabled={updateMutation.isPending}
                      >
                        {updateMutation.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Save Changes"}
                      </Button>
                    </div>
                  </motion.div>
                )}
              </div>
            </div>
          </div>
        </motion.section>

        <motion.section variants={item}>
          <div className="overflow-hidden rounded-2xl border border-border/40 bg-card shadow-card">
            <div className="border-b border-border/30 px-5 py-4 sm:px-6">
              <h3 className="text-sm font-semibold sm:text-base">Quick Actions</h3>
            </div>

            <div className="space-y-2 p-2 sm:p-3">
              {[
                { label: "Manage Employees", desc: "Add, edit, or deactivate users", icon: Users, href: "/admin/employees" },
                { label: "Manage Offices", desc: "Configure locations and IPs", icon: Building2, href: "/admin/offices" },
                { label: "View Reports", desc: "Analytics and summaries", icon: FileText, href: "/admin/reports" },
              ].map((action) => {
                const Icon = action.icon;
                return (
                  <button
                    key={action.label}
                    onClick={() => router.push(action.href)}
                    className="group flex w-full items-center gap-3 rounded-xl border border-border/40 bg-background/60 p-3 text-left transition-all duration-200 hover:-translate-y-0.5 hover:bg-accent/40 hover:shadow-card"
                  >
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary/10 to-violet-500/10 transition-transform duration-200 group-hover:scale-105">
                      <Icon className="h-4 w-4 text-primary" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold">{action.label}</p>
                      <p className="text-xs text-muted-foreground/65">{action.desc}</p>
                    </div>
                    <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground/30 transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
                  </button>
                );
              })}
            </div>
          </div>
        </motion.section>
      </div>
    </motion.div>
  );
}
