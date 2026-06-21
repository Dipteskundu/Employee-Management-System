"use client";

import { useQuery, useMutation } from "@tanstack/react-query";
import { apiService } from "@/lib/api";
import { queryClient } from "@/lib/query-client";

export function useNotifications() {
  return useQuery({
    queryKey: ["notifications"],
    queryFn: () => apiService.notifications.list(),
    refetchInterval: 30000,
  });
}

export function useMarkAsRead() {
  return useMutation({
    mutationFn: (id: string) => apiService.notifications.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}

export function useMarkAllAsRead() {
  return useMutation({
    mutationFn: () => apiService.notifications.markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}
