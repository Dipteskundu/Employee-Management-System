"use client";

import { useQuery, useMutation } from "@tanstack/react-query";
import { apiService } from "@/lib/api";
import { queryClient } from "@/lib/query-client";

export function useOffices() {
  return useQuery({
    queryKey: ["offices"],
    queryFn: () => apiService.offices.list(),
  });
}

export function useCreateOffice() {
  return useMutation({
    mutationFn: (data: any) => apiService.offices.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["offices"] });
    },
  });
}

export function useUpdateOffice() {
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => apiService.offices.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["offices"] });
    },
  });
}

export function useDeleteOffice() {
  return useMutation({
    mutationFn: (id: string) => apiService.offices.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["offices"] });
    },
  });
}
