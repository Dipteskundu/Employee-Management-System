"use client";

import { useQuery } from "@tanstack/react-query";
import { apiService } from "@/lib/api";

export function useTeamStats() {
  return useQuery({
    queryKey: ["reports", "team-stats"],
    queryFn: () => apiService.reports.teamStats(),
  });
}

export function useGenerateReport(params?: string) {
  return useQuery({
    queryKey: ["reports", "generate", params],
    queryFn: () => apiService.reports.generate(params),
    enabled: !!params,
  });
}

export function useOfficeStats(params?: string) {
  return useQuery({
    queryKey: ["reports", "office-stats", params],
    queryFn: () => apiService.reports.officeStats(params),
  });
}
