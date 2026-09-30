"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryKeys } from "@/lib/api/query-client";
import type { ApiError } from "@/lib/api/client";
import {
  getSystemStats,
  getAuditLogs,
  getOperationalLogs,
  listUsers,
  getUserById,
  updateUserRole,
  deleteUser,
} from "./api";

export function useSystemStats() {
  return useQuery({
    queryKey: queryKeys.adminStats(),
    queryFn: getSystemStats,
    staleTime: 2 * 60 * 1000,
  });
}

export function useAuditLogs(params?: {
  page?: number;
  limit?: number;
  action?: string;
  actorId?: string;
  resourceType?: string;
  resourceId?: string;
  fromDate?: string;
  toDate?: string;
}) {
  return useQuery({
    queryKey: queryKeys.auditLogs(params as Record<string, unknown>),
    queryFn: () => getAuditLogs(params),
  });
}

export function useOperationalLogs(params?: {
  page?: number;
  limit?: number;
  action?: string;
  fromDate?: string;
  toDate?: string;
}) {
  return useQuery({
    queryKey: ["admin", "operational-logs", params],
    queryFn: () => getOperationalLogs(params),
  });
}

export function useUsers(params?: {
  page?: number;
  limit?: number;
  role?: string;
  isActive?: boolean;
  search?: string;
  sortBy?: string;
  sortOrder?: string;
  includeDeleted?: boolean;
}) {
  return useQuery({
    queryKey: queryKeys.users(params as Record<string, unknown>),
    queryFn: () => listUsers(params),
  });
}

export function useUser(id: string) {
  return useQuery({
    queryKey: queryKeys.user(id),
    queryFn: () => getUserById(id),
    enabled: !!id,
  });
}

export function useUpdateUserRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, role }: { id: string; role: string }) =>
      updateUserRole(id, role),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.user(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.users() });
      toast.success("User role updated.");
    },
    onError: (error: ApiError) => {
      toast.error(error.message ?? "Failed to update user role");
    },
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users() });
      toast.success("User deleted.");
    },
    onError: (error: ApiError) => {
      toast.error(error.message ?? "Failed to delete user");
    },
  });
}
