"use client";

import { useQuery, useMutation } from "@tanstack/react-query";
import { apiService } from "@/lib/api";
import { queryClient } from "@/lib/query-client";

export function useAttendanceStats() {
  return useQuery({
    queryKey: ["attendance", "stats"],
    queryFn: () => apiService.attendance.getStats(),
  });
}

export function useAttendanceHistory(params?: string) {
  return useQuery({
    queryKey: ["attendance", "history", params],
    queryFn: () => apiService.attendance.getHistory(params),
  });
}

export function useClockIn() {
  return useMutation({
    mutationFn: (data: any) => apiService.attendance.clockIn(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attendance"] });
    },
  });
}

export function useClockOut() {
  return useMutation({
    mutationFn: (data: any) => apiService.attendance.clockOut(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attendance"] });
    },
  });
}
