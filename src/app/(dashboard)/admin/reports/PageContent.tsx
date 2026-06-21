"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { FileText, Download, TrendingUp, TrendingDown, BarChart3, PieChart, Calendar, Users, Building2, Clock, Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useGenerateReport, useTeamStats, useOfficeStats } from "@/hooks/useReports";
import { useEmployees } from "@/hooks/useEmployees";
import { useOffices } from "@/hooks/useOffices";
import { format, startOfMonth, endOfMonth } from "date-fns";
import DepartmentChart from "@/components/shared/DepartmentChart";
import { apiService } from "@/lib/api";

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

  const [startDate, setStartDate] = useState(format(startOfMonth(new Date()), "yyyy-MM-dd"));
  const [endDate, setEndDate] = useState(format(endOfMonth(new Date()), "yyyy-MM-dd"));
  const [selectedOffice, setSelectedOffice] = useState("");
  const { data: reportData, isLoading: reportLoading } = useGenerateReport(`start_date=${startDate}&end_date=${endDate}${selectedOffice ? `&office_id=${selectedOffice}` : ""}`);
  const { data: officesData } = useOffices();
  const offices = officesData?.offices || [];

  const employees = employeesData?.employees || [];
  const stats = teamStatsData?.stats;
  const report = reportData?.summary;
  const { data: officeStatsData } = useOfficeStats(`start_date=${startDate}&end_date=${endDate}`);
  const officeStats = officeStatsData?.offices || [];

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

  const departments = [...new Set(employees.map((e: any) => e.department))] as string[];

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
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 text-sm">
            <select
              value={selectedOffice}
              onChange={(e) => setSelectedOffice(e.target.value)}
              className="flex h-9 rounded-lg border border-input bg-background px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">All Offices</option>
              {offices.map((o: any) => (
                <option key={o._id} value={o._id}>{o.office_name}</option>
              ))}
            </select>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="flex h-9 rounded-lg border border-input bg-background px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <span className="text-muted-foreground">to</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="flex h-9 rounded-lg border border-input bg-background px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
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
          <CardContent>
            <DepartmentChart departments={departments} employees={employees} />
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
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => {
                        const params = `start_date=${startDate}&end_date=${endDate}`;
                        apiService.reports.download(params);
                      }}>
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

      {officeStats.length > 0 && (
        <Card className="shadow-premium">
          <CardHeader>
            <CardTitle>Office Attendance Overview</CardTitle>
            <CardDescription>Attendance statistics by office</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {officeStats.map((stat: any) => (
                <div key={stat.office_id} className="p-4 rounded-lg border border-border/40 bg-background/60 space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold">{stat.office_name}</h4>
                    <Badge className={stat.attendance_rate >= 80 ? "gradient-success text-white" : stat.attendance_rate >= 50 ? "bg-amber-100 text-amber-700" : "bg-destructive/10 text-destructive"}>
                      {stat.attendance_rate}%
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div><span className="text-muted-foreground">Employees:</span> <span className="font-medium">{stat.total_employees}</span></div>
                    <div><span className="text-muted-foreground">Present:</span> <span className="font-medium text-emerald-600">{stat.present}</span></div>
                    <div><span className="text-muted-foreground">Late:</span> <span className="font-medium text-amber-600">{stat.late}</span></div>
                    <div><span className="text-muted-foreground">Absent:</span> <span className="font-medium text-destructive">{stat.absent}</span></div>
                  </div>
                  <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
                    <div className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all" style={{ width: `${stat.attendance_rate}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
