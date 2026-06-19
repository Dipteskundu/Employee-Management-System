"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  addMonths,
  subMonths,
  isSameMonth,
  isSameDay,
  isToday,
} from "date-fns";

interface DayRecord {
  date: string;
  day: string;
  clockIn: string;
  clockOut: string;
  total: string;
  status: string;
}

interface CalendarViewProps {
  dailyRecords: DayRecord[];
}

const statusColors: Record<string, string> = {
  present: "bg-emerald-500 text-white hover:bg-emerald-600",
  late: "bg-amber-500 text-white hover:bg-amber-600",
  absent: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
  overtime: "bg-blue-500 text-white hover:bg-blue-600",
};

const statusBadge: Record<string, string> = {
  present: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  late: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  absent: "bg-destructive/10 text-destructive border-destructive/20",
  overtime: "bg-blue-500/10 text-blue-600 border-blue-500/20",
};

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function CalendarView({ dailyRecords }: CalendarViewProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<DayRecord | null>(null);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);

  const allDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const getRecordForDay = (day: Date): DayRecord | undefined => {
    const dateKey = format(day, "yyyy-MM-dd");
    return dailyRecords.find((r) => r.date === dateKey);
  };

  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));

  const presentCount = dailyRecords.filter((r) => r.status === "present").length;
  const lateCount = dailyRecords.filter((r) => r.status === "late").length;
  const absentCount = dailyRecords.filter((r) => r.status === "absent").length;
  const overtimeCount = dailyRecords.filter((r) => r.status === "overtime").length;

  return (
    <div className="space-y-4">
      {/* Legend */}
      <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded bg-emerald-500" /> Present ({presentCount})
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded bg-amber-500" /> Late ({lateCount})
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded bg-destructive" /> Absent ({absentCount})
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded bg-blue-500" /> Overtime ({overtimeCount})
        </span>
      </div>

      {/* Month Navigation */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="icon" onClick={prevMonth}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <h3 className="text-lg font-semibold">
          {format(currentMonth, "MMMM yyyy")}
        </h3>
        <Button variant="ghost" size="icon" onClick={nextMonth}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Calendar Grid */}
      <div className="rounded-xl border border-border/60 bg-card shadow-premium overflow-hidden">
        {/* Day Headers */}
        <div className="grid grid-cols-7 border-b border-border/60">
          {DAY_LABELS.map((label) => (
            <div
              key={label}
              className="py-2 text-center text-xs font-medium text-muted-foreground bg-muted/30"
            >
              {label}
            </div>
          ))}
        </div>

        {/* Day Cells */}
        <div className="grid grid-cols-7">
          {allDays.map((day, i) => {
            const record = getRecordForDay(day);
            const inMonth = isSameMonth(day, currentMonth);
            const today = isToday(day);
            const selected = selectedDay && isSameDay(day, new Date(selectedDay.date));

            return (
              <motion.button
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.005 }}
                onClick={() => setSelectedDay(record || null)}
                className={`
                  relative flex flex-col items-center justify-center p-1.5 h-14 sm:h-16
                  border-b border-r border-border/30 text-sm transition-all
                  ${!inMonth ? "opacity-30" : ""}
                  ${today ? "ring-2 ring-primary ring-inset rounded-none" : ""}
                  ${record ? statusColors[record.status] || "" : "hover:bg-muted/30"}
                  ${!record && inMonth ? "text-muted-foreground" : ""}
                `}
              >
                <span className="text-xs sm:text-sm font-medium">
                  {format(day, "d")}
                </span>
                {record && (
                  <span className="text-[9px] sm:text-[10px] leading-none mt-0.5 opacity-80">
                    {record.clockIn !== "-" ? record.clockIn : "-"}
                  </span>
                )}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Selected Day Detail */}
      {selectedDay && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-border/60 bg-card p-4 shadow-premium"
        >
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="font-semibold">{selectedDay.date}</p>
              <p className="text-xs text-muted-foreground">{selectedDay.day}</p>
            </div>
            <Badge className={statusBadge[selectedDay.status]}>{selectedDay.status}</Badge>
          </div>
          <div className="grid grid-cols-3 gap-3 text-sm">
            <div>
              <p className="text-xs text-muted-foreground">Clock In</p>
              <p className="font-medium">{selectedDay.clockIn}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Clock Out</p>
              <p className="font-medium">{selectedDay.clockOut}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total</p>
              <p className="font-medium">{selectedDay.total}</p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
