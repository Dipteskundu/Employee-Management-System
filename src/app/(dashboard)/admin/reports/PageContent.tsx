"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { FileText, Download, TrendingUp, TrendingDown, BarChart3, PieChart, Calendar, Users, Building2, Clock, Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useGenerateReport, useTeamStats } from "@/hooks/useReports";
import { useEmployees } from "@/hooks/useEmployees";
import { format, startOfMonth, endOfMonth } from "date-fns";

const statusBadge: Record<string, string> = {
  ready: "gradient-success text-white",
  generating: "gradient-warning text-white",
  pending: "bg-muted text-muted-foreground",
};

const typeIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  attendance: Calendar,
  office: Building2,
  department: Users,
  late: Clock,
  overtime: TrendingUp,
};

export default function AdminReportsPage() {
  const { data: employeesData } = useEmployees();
  const { data: teamStatsData } = useTeamStats();

  const monthStart = format(startOfMonth(new Date()), "yyyy-MM-dd");
  const monthEnd = format(endOfMonth(new Date()), "yyyy-MM-dd");
  const { data: reportData, isLoading: reportLoading } = useGenerateReport(`start_date=${monthStart}&end_date=${monthEnd}`);

  const employees = employeesData?.employees || [];
  const stats = teamStatsData?.stats;
  const report = reportData?.summary;

  const totalEmployees = employees.length;
  const attendanceRate = stats?.present_today && stats?.total_employees
    ? Math.round((stats.present_today / stats.total_employees) * 100) + "%"
    : "N/A";

  const reportCategories = [
    { title: "Monthly Attendance Report", period: format(new Date(), "MMMM yyyy"), records: report?.total_records || 0, status: reportLoading ? "generating" as const : "ready" as const, type: "attendance" },
    { title: "Department Comparison", period: "This Month", records: new Set(employees.map((e: any) => e.department)).size, status: "ready" as const, type: "department" },
    { title: "Late Arrival Trends", period: format(new Date(), "MMMM yyyy"), records: report?.late || 0, status: "ready" as const, type: "late" },
    { title: "Overtime Analysis", period: format(new Date(), "MMMM yyyy"), records: report?.overtime || 0, status: "ready" as const, type: "overtime" },
  ];

  const departments = [...new Set(employees.map((e: any) => e.department))];

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <FileText className="h-10 w-10 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Reports & Analytics</h1>
            <p className="text-muted-foreground">System-wide reports and data analysis</p>
          </div>
        </div>
      </motion.div>

      <div className="grid gap-6 md:grid-cols-4">
        <Card className="shadow-premium">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalEmployees}</div>
            <div className="flex items-center gap-1 text-xs text-emerald-500">
              <TrendingUp className="h-3 w-3" /> Registered users
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-premium">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Attendance Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-500">{attendanceRate}</div>
            <div className="flex items-center gap-1 text-xs text-emerald-500">
              <TrendingUp className="h-3 w-3" /> Today
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-premium">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Late Today</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-500">{stats?.late_today || 0}</div>
            <div className="flex items-center gap-1 text-xs text-amber-500">
              <TrendingDown className="h-3 w-3" /> Needs attention
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-premium">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Monthly Records</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{report?.total_records || 0}</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="shadow-premium">
          <CardHeader>
            <CardTitle>Attendance by Department</CardTitle>
            <CardDescription>Employee distribution by department</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {departments.length > 0 ? departments.map((dept: any, i: number) => {
              const count = employees.filter((e: any) => e.department === dept).length;
              const percent = totalEmployees > 0 ? Math.round((count / totalEmployees) * 100) : 0;
              const colors = ["bg-emerald-500", "bg-blue-500", "bg-amber-500", "bg-purple-500", "bg-cyan-500", "bg-rose-500"];
              return (
                <div key={dept}>
                  <div className="flex justify-between text-sm mb-1">
                    <span>{dept}</span>
                    <span className="font-medium">{percent}% ({count})</span>
                  </div>
                  <div className="h-2.5 bg-muted rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${percent}%` }}
                      transition={{ duration: 1, delay: 0.2 + i * 0.1 }}
                      className={`h-full ${colors[i % colors.length]} rounded-full`}
                    />
                  </div>
                </div>
              );
            }) : (
              <p className="text-center text-muted-foreground py-6">No department data available</p>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-premium">
          <CardHeader>
            <CardTitle>Report Library</CardTitle>
            <CardDescription>All generated reports</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {reportCategories.map((report, i) => {
              const Icon = typeIcons[report.type];
              return (
                <motion.div
                  key={report.title}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.07 }}
                  className="flex items-center justify-between p-3 rounded-lg bg-background hover:bg-muted/30 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      {Icon && <Icon className="h-4 w-4 text-primary" />}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{report.title}</p>
                      <p className="text-xs text-muted-foreground">{report.period} &middot; {report.records.toLocaleString()} records</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={statusBadge[report.status]}>
                      {report.status}
                    </Badge>
                    {report.status === "ready" && (
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Download className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
