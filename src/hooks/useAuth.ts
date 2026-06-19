"use client";

import { useQuery, useMutation } from "@tanstack/react-query";
import { apiService } from "@/lib/api";
import { queryClient } from "@/lib/query-client";

export function useMe() {
  return useQuery({
    queryKey: ["me"],
    queryFn: () => apiService.auth.getMe(),
    enabled: false,
  });
}

export function useUpdateProfile() {
  return useMutation({
    mutationFn: (data: any) => apiService.auth.updateProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["me"] });
    },
  });
}
