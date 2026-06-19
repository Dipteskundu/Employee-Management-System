"use client";

import { useQuery, useMutation } from "@tanstack/react-query";
import { apiService } from "@/lib/api";
import { queryClient } from "@/lib/query-client";

export function useSettings() {
  return useQuery({
    queryKey: ["settings"],
    queryFn: () => apiService.settings.get(),
  });
}

export function useUpdateSettings() {
  return useMutation({
    mutationFn: (data: any) => apiService.settings.update(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settings"] });
    },
  });
}
