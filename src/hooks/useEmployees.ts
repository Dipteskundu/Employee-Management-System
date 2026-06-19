"use client";

import { useQuery, useMutation } from "@tanstack/react-query";
import { apiService } from "@/lib/api";
import { queryClient } from "@/lib/query-client";

export function useEmployees(params?: string) {
  return useQuery({
    queryKey: ["employees", params],
    queryFn: () => apiService.employees.list(params),
  });
}

export function useCreateEmployee() {
  return useMutation({
    mutationFn: (data: any) => apiService.employees.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
    },
  });
}

export function useUpdateEmployee() {
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => apiService.employees.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
    },
  });
}

export function useDeleteEmployee() {
  return useMutation({
    mutationFn: (id: string) => apiService.employees.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
    },
  });
}
