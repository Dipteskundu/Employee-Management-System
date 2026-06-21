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
      queryClient.invalidateQueries({ queryKey: ["employees"] });
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

export function useOfficeMembers(officeId: string | null) {
  return useQuery({
    queryKey: ["offices", "members", officeId],
    queryFn: () => apiService.offices.getMembers(officeId!),
    enabled: !!officeId,
  });
}

export function useOfficeStats(officeId: string | null, params?: string) {
  return useQuery({
    queryKey: ["offices", "stats", officeId, params],
    queryFn: () => apiService.offices.getStats(officeId!, params),
    enabled: !!officeId,
  });
}

export function useAddToOffice() {
  return useMutation({
    mutationFn: (data: { office_id: string; email: string }) => apiService.employees.addToOffice(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["offices"] });
      queryClient.invalidateQueries({ queryKey: ["employees"] });
    },
  });
}

export function useRemoveFromOffice() {
  return useMutation({
    mutationFn: (data: { office_id: string; employee_id: string }) => apiService.employees.removeFromOffice(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["offices"] });
      queryClient.invalidateQueries({ queryKey: ["employees"] });
    },
  });
}

export function useTransferEmployee() {
  return useMutation({
    mutationFn: (data: { employee_id: string; from_office_id: string; to_office_id: string }) => apiService.employees.transfer(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["offices"] });
      queryClient.invalidateQueries({ queryKey: ["employees"] });
    },
  });
}
