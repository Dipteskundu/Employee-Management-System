"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { FileText, Download, BarChart3, PieChart, TrendingUp, Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useTeamStats, useGenerateReport } from "@/hooks/useReports";
import { format, startOfMonth, endOfMonth } from "date-fns";

const statusBadge: Record<string, string> = {
  ready: "gradient-success text-white",
  generating: "gradient-warning text-white",
  pending: "bg-muted text-muted-foreground",
};

export default function ManagerReportsPage() {
  const monthStart = format(startOfMonth(new Date()), "yyyy-MM-dd");
  const monthEnd = format(endOfMonth(new Date()), "yyyy-MM-dd");
  const reportParams = `start_date=${monthStart}&end_date=${monthEnd}`;

  const { data: teamStatsData, isLoading: statsLoading } = useTeamStats();
  const { data: reportData, isLoading: reportLoading } = useGenerateReport(reportParams);

  const stats = teamStatsData?.stats;
  const report = reportData?.summary;

  const total = stats?.total_employees || 0;
  const present = stats?.present_today || 0;
  const presentPercent = total > 0 ? Math.round((present / total) * 100) : 0;
  const latePercent = report && report.total_records > 0 ? Math.round((report.late / report.total_records) * 100) : 0;
  const overtimeHours = report?.overtime || 0;

  const reportTypes = [
    { title: "Monthly Attendance Summary", period: `${monthStart} to ${monthEnd}`, records: report?.total_records || 0, status: reportLoading ? "generating" as const : "ready" as const },
    { title: "Late Arrivals Analysis", period: "This Month", records: report?.late || 0, status: "ready" as const },
    { title: "Overtime Report", period: "This Month", records: report?.overtime || 0, status: "ready" as const },
  ];

  if (statsLoading) {
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
          <FileText className="h-10 w-10 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Reports</h1>
            <p className="text-muted-foreground">Generate and view attendance reports</p>
          </div>
        </div>
      </motion.div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="shadow-premium">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Team Attendance Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-emerald-500">{presentPercent}%</div>
            <div className="flex items-center gap-1 mt-1 text-xs text-emerald-500">
              <TrendingUp className="h-3 w-3" /> Today
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-premium">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Late Arrivals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-amber-500">{stats?.late_today || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">{latePercent}% late rate</p>
          </CardContent>
        </Card>
        <Card className="shadow-premium">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Overtime Records</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-500">{overtimeHours}</div>
            <p className="text-xs text-muted-foreground mt-1">This month total</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="shadow-premium">
          <CardHeader>
            <CardTitle>Attendance Distribution</CardTitle>
            <CardDescription>Today's team breakdown</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { label: "Present", value: presentPercent, color: "bg-emerald-500" },
              { label: "Late", value: stats?.late_today && total ? Math.round((stats.late_today / total) * 100) : 0, color: "bg-amber-500" },
              { label: "Absent", value: stats?.absent_today && total ? Math.round((stats.absent_today / total) * 100) : 0, color: "bg-destructive" },
            ].map((item) => (
              <div key={item.label}>
                <div className="flex justify-between text-sm mb-1">
                  <span>{item.label}</span>
                  <span className="font-medium">{item.value}%</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${item.value}%` }}
                    transition={{ duration: 1, delay: 0.3 }}
                    className={`h-full ${item.color} rounded-full`}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="shadow-premium">
          <CardHeader>
            <CardTitle>Available Reports</CardTitle>
            <CardDescription>Download or view generated reports</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {reportTypes.map((report, i) => (
              <motion.div
                key={report.title}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.08 }}
                className="flex items-center justify-between p-3 rounded-lg bg-background hover:bg-muted/30 transition-colors"
              >
                <div>
                  <p className="font-medium text-sm">{report.title}</p>
                  <p className="text-xs text-muted-foreground">{report.period} &middot; {report.records} records</p>
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
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
