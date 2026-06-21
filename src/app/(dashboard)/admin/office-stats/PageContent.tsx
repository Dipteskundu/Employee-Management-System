"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Building2, Users, TrendingUp, TrendingDown, Loader2, BarChart3 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useOffices } from "@/hooks/useOffices";
import { useOfficeStats } from "@/hooks/useReports";
import { format, startOfMonth, endOfMonth } from "date-fns";

export default function OfficeStatsPage() {
  const [startDate, setStartDate] = useState(format(startOfMonth(new Date()), "yyyy-MM-dd"));
  const [endDate, setEndDate] = useState(format(endOfMonth(new Date()), "yyyy-MM-dd"));
  const [selectedOffice, setSelectedOffice] = useState("");

  const { data: officesData } = useOffices();
  const offices = officesData?.offices || [];

  const { data: officeStatsData, isLoading } = useOfficeStats(
    `start_date=${startDate}&end_date=${endDate}${selectedOffice ? `&office_id=${selectedOffice}` : ""}`
  );

  const officeStats = officeStatsData?.offices || [];

  const totalEmployees = officeStats.reduce((sum: number, s: any) => sum + s.total_employees, 0);
  const totalPresent = officeStats.reduce((sum: number, s: any) => sum + s.present, 0);
  const totalAbsent = officeStats.reduce((sum: number, s: any) => sum + s.absent, 0);
  const overallRate = totalEmployees > 0 ? Math.round((totalPresent / totalEmployees) * 100) : 0;

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
        className="flex items-center justify-between flex-wrap gap-4"
      >
        <div className="flex items-center gap-3">
          <BarChart3 className="h-10 w-10 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Office Statistics</h1>
            <p className="text-muted-foreground">Attendance statistics by office location</p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
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
      </motion.div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card className="shadow-premium">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalEmployees}</div>
            <p className="text-xs text-muted-foreground">Across all offices</p>
          </CardContent>
        </Card>
        <Card className="shadow-premium">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Overall Attendance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-500">{overallRate}%</div>
            <div className="flex items-center gap-1 text-xs text-emerald-500">
              <TrendingUp className="h-3 w-3" /> Today
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-premium">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Present Today</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPresent}</div>
            <p className="text-xs text-muted-foreground">Of {totalEmployees} total</p>
          </CardContent>
        </Card>
        <Card className="shadow-premium">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Absent Today</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{totalAbsent}</div>
            <div className="flex items-center gap-1 text-xs text-destructive">
              <TrendingDown className="h-3 w-3" /> Needs attention
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {officeStats.map((stat: any, i: number) => (
          <motion.div
            key={stat.office_id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
          >
            <Card className="shadow-premium hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 gradient-primary rounded-xl flex items-center justify-center">
                      <Building2 className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-base">{stat.office_name}</CardTitle>
                      <CardDescription>{stat.total_employees} employees</CardDescription>
                    </div>
                  </div>
                  <Badge className={stat.attendance_rate >= 80 ? "gradient-success text-white" : stat.attendance_rate >= 50 ? "bg-amber-100 text-amber-700" : "bg-destructive/10 text-destructive"}>
                    {stat.attendance_rate}%
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span className="text-muted-foreground">Present:</span>
                    <span className="font-medium">{stat.present}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-amber-500" />
                    <span className="text-muted-foreground">Late:</span>
                    <span className="font-medium">{stat.late}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-destructive" />
                    <span className="text-muted-foreground">Absent:</span>
                    <span className="font-medium">{stat.absent}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-500" />
                    <span className="text-muted-foreground">Overtime:</span>
                    <span className="font-medium">{stat.overtime}</span>
                  </div>
                </div>
                <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-500"
                    style={{ width: `${stat.attendance_rate}%` }}
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
        {officeStats.length === 0 && (
          <div className="col-span-full text-center py-12 text-muted-foreground">
            No office data available
          </div>
        )}
      </div>
    </div>
  );
}
