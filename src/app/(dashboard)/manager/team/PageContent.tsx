"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Users, Search, Clock, MapPin, TrendingUp, TrendingDown, Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useEmployees } from "@/hooks/useEmployees";
import { useAttendanceHistory } from "@/hooks/useAttendance";
import { useOffices } from "@/hooks/useOffices";
import { format } from "date-fns";

const statusColors: Record<string, string> = {
  present: "gradient-success text-white",
  late: "gradient-warning text-white",
  absent: "bg-destructive text-destructive-foreground",
};

export default function TeamAttendancePage() {
  const [search, setSearch] = useState("");
  const today = format(new Date(), "yyyy-MM-dd");

  const { data: employeesData, isLoading } = useEmployees();
  const { data: attendanceData } = useAttendanceHistory(`start_date=${today}&end_date=${today}`);
  const { data: officesData } = useOffices();

  const employees = employeesData?.employees || [];
  const todayAttendance = attendanceData?.attendance || [];
  const offices = officesData?.offices || [];

  const teamMembers = employees.map((emp: any) => {
    const empAttendance = todayAttendance.filter((a: any) => a.user_id === emp._id);
    const clockInRec = empAttendance.find((a: any) => a.type === "IN");
    const office = offices.find((o: any) => o._id === emp.assigned_office_id);
    return {
      _id: emp._id,
      name: emp.username,
      role: emp.department,
      status: clockInRec?.status || "absent",
      clockIn: clockInRec ? format(new Date(clockInRec.timestamp), "hh:mm a") : "-",
      location: office?.office_name || "-",
      avatar: emp.username.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2),
    };
  });

  const filtered = teamMembers.filter((m: any) =>
    m.name.toLowerCase().includes(search.toLowerCase()) ||
    m.role.toLowerCase().includes(search.toLowerCase())
  );

  const presentCount = teamMembers.filter((m: any) => m.status === "present").length;
  const lateCount = teamMembers.filter((m: any) => m.status === "late").length;
  const absentCount = teamMembers.filter((m: any) => m.status === "absent").length;
  const total = teamMembers.length;

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
        className="flex items-center gap-3"
      >
        <Users className="h-10 w-10 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">Team Attendance</h1>
          <p className="text-muted-foreground">Monitor your team's daily attendance</p>
        </div>
      </motion.div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card className="shadow-premium">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Team</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{total}</div>
            <div className="flex items-center gap-1 text-xs text-emerald-500">
              <TrendingUp className="h-3 w-3" /> Active members
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-premium">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Present</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-500">{presentCount}</div>
            <p className="text-xs text-muted-foreground">{total > 0 ? Math.round((presentCount / total) * 100) : 0}% of team</p>
          </CardContent>
        </Card>
        <Card className="shadow-premium">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Late</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-500">{lateCount}</div>
            <div className="flex items-center gap-1 text-xs text-amber-500">
              <TrendingUp className="h-3 w-3" /> Needs attention
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-premium">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Absent</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{absentCount}</div>
            <div className="flex items-center gap-1 text-xs text-destructive">
              <TrendingDown className="h-3 w-3" /> Unreported
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-premium">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Team Members</CardTitle>
              <CardDescription>Real-time attendance status</CardDescription>
            </div>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search team members..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 text-sm font-medium text-muted-foreground">Member</th>
                  <th className="text-left py-3 text-sm font-medium text-muted-foreground">Department</th>
                  <th className="text-left py-3 text-sm font-medium text-muted-foreground">Status</th>
                  <th className="text-left py-3 text-sm font-medium text-muted-foreground">Clock In</th>
                  <th className="text-left py-3 text-sm font-medium text-muted-foreground">Location</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((member: any, i: number) => (
                  <motion.tr
                    key={member._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="border-b border-border/50 hover:bg-muted/30 transition-colors"
                  >
                    <td className="py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center text-white text-xs font-bold">
                          {member.avatar}
                        </div>
                        <span className="font-medium">{member.name}</span>
                      </div>
                    </td>
                    <td className="py-3 text-sm text-muted-foreground">{member.role}</td>
                    <td className="py-3">
                      <Badge className={statusColors[member.status]}>{member.status}</Badge>
                    </td>
                    <td className="py-3 text-sm">{member.clockIn}</td>
                    <td className="py-3 text-sm text-muted-foreground">{member.location}</td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
