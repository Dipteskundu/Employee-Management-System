"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Calendar, Search, Download, ChevronDown, Loader2, LayoutGrid, List } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAttendanceHistory } from "@/hooks/useAttendance";
import { format, startOfMonth, endOfMonth } from "date-fns";
import CalendarView from "./CalendarView";

const statusColors: Record<string, string> = {
  present: "gradient-success text-white",
  late: "gradient-warning text-white",
  absent: "bg-destructive text-destructive-foreground",
  overtime: "bg-info text-info-foreground",
};

export default function HistoryPage() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [view, setView] = useState<"table" | "calendar">("table");

  const monthStart = format(startOfMonth(new Date()), "yyyy-MM-dd");
  const monthEnd = format(endOfMonth(new Date()), "yyyy-MM-dd");
  const params = `start_date=${monthStart}&end_date=${monthEnd}`;

  const { data, isLoading } = useAttendanceHistory(params);

  const records = data?.attendance || [];

  const groupedByDay: Record<string, any[]> = records.reduce((acc: any, record: any) => {
    const dateKey = format(new Date(record.timestamp), "yyyy-MM-dd");
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(record);
    return acc;
  }, {});

  const dailyRecords = Object.entries(groupedByDay).map(([date, entries]) => {
    const clockIn = (entries as any[]).find((e: any) => e.type === "IN");
    const clockOut = (entries as any[]).find((e: any) => e.type === "OUT");
    const dayName = format(new Date(date), "EEE");
    const clockInTime = clockIn ? format(new Date(clockIn.timestamp), "hh:mm a") : "-";
    const clockOutTime = clockOut ? format(new Date(clockOut.timestamp), "hh:mm a") : "-";

    let total = "-";
    if (clockIn && clockOut) {
      const diff = new Date(clockOut.timestamp).getTime() - new Date(clockIn.timestamp).getTime();
      const h = Math.floor(diff / (1000 * 60 * 60));
      const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      total = `${h}h ${m}m`;
    }

    const status = clockIn?.status || (entries.length > 0 ? entries[0].status : "absent");

    return {
      date,
      day: dayName,
      clockIn: clockInTime,
      clockOut: clockOutTime,
      total,
      status,
    };
  }).reverse();

  const filteredRecords = dailyRecords.filter((record: any) => {
    const matchesSearch = record.date.includes(search) || record.status.includes(search.toLowerCase());
    const matchesFilter = filter === "all" || record.status === filter;
    return matchesSearch && matchesFilter;
  });

  const presentCount = dailyRecords.filter((r: any) => r.status === "present").length;
  const lateCount = dailyRecords.filter((r: any) => r.status === "late").length;
  const overtimeCount = dailyRecords.filter((r: any) => r.status === "overtime").length;
  const absentCount = dailyRecords.filter((r: any) => r.status === "absent").length;

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
          <Calendar className="h-10 w-10 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">My History</h1>
            <p className="text-muted-foreground">Your attendance records</p>
          </div>
        </div>
        <Button variant="outline" className="gap-2">
          <Download className="h-4 w-4" />
          Export
        </Button>
      </motion.div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card className="shadow-premium">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Days</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dailyRecords.length}</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>
        <Card className="shadow-premium">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Present</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-500">{presentCount}</div>
            <p className="text-xs text-muted-foreground">On time</p>
          </CardContent>
        </Card>
        <Card className="shadow-premium">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Late</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-500">{lateCount}</div>
            <p className="text-xs text-muted-foreground">Arrived late</p>
          </CardContent>
        </Card>
        <Card className="shadow-premium">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Overtime</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-500">{overtimeCount}</div>
            <p className="text-xs text-muted-foreground">Extra hours</p>
          </CardContent>
        </Card>
      </div>

      {/* View Toggle */}
      <div className="flex items-center gap-2">
        <Button
          variant={view === "table" ? "default" : "outline"}
          size="sm"
          onClick={() => setView("table")}
          className="gap-2"
        >
          <List className="h-4 w-4" />
          Table
        </Button>
        <Button
          variant={view === "calendar" ? "default" : "outline"}
          size="sm"
          onClick={() => setView("calendar")}
          className="gap-2"
        >
          <LayoutGrid className="h-4 w-4" />
          Calendar
        </Button>
      </div>

      {view === "calendar" ? (
        <CalendarView dailyRecords={dailyRecords} />
      ) : (
      <Card className="shadow-premium">
        <CardHeader>
          <CardTitle>Attendance Records</CardTitle>
          <CardDescription>Your complete attendance history</CardDescription>
          <div className="flex flex-col sm:flex-row gap-3 mt-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by date or status..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="flex h-10 rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="all">All Status</option>
              <option value="present">Present</option>
              <option value="late">Late</option>
              <option value="overtime">Overtime</option>
              <option value="absent">Absent</option>
            </select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 text-sm font-medium text-muted-foreground">Date</th>
                  <th className="text-left py-3 text-sm font-medium text-muted-foreground">Day</th>
                  <th className="text-left py-3 text-sm font-medium text-muted-foreground">Clock In</th>
                  <th className="text-left py-3 text-sm font-medium text-muted-foreground">Clock Out</th>
                  <th className="text-left py-3 text-sm font-medium text-muted-foreground">Total</th>
                  <th className="text-left py-3 text-sm font-medium text-muted-foreground">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredRecords.length > 0 ? (
                  filteredRecords.map((record: any, i: number) => (
                    <motion.tr
                      key={record.date}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="border-b border-border/50 hover:bg-muted/30 transition-colors"
                    >
                      <td className="py-3 text-sm font-medium">{record.date}</td>
                      <td className="py-3 text-sm text-muted-foreground">{record.day}</td>
                      <td className="py-3 text-sm">{record.clockIn}</td>
                      <td className="py-3 text-sm">{record.clockOut}</td>
                      <td className="py-3 text-sm font-mono">{record.total}</td>
                      <td className="py-3">
                        <Badge className={statusColors[record.status]}>{record.status}</Badge>
                      </td>
                    </motion.tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-muted-foreground">No records found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
      )}
    </div>
  );
}
