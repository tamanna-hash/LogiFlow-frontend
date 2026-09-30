"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryKeys } from "@/lib/api/query-client";
import type { ApiError } from "@/lib/api/client";
import { getNotifications, markNotificationRead, markAllNotificationsRead } from "./api";

export function useNotifications(params?: {
  page?: number;
  limit?: number;
  isRead?: boolean;
  type?: string;
}) {
  return useQuery({
    queryKey: queryKeys.notifications(params as Record<string, unknown>),
    queryFn: () => getNotifications(params),
  });
}

export function useUnreadCount() {
  return useQuery({
    queryKey: ["notifications", "unread-count"],
    queryFn: () => getNotifications({ isRead: false, limit: 1 }),
    select: (data) => data.meta.unreadCount ?? 0,
    refetchInterval: 60_000, // poll every minute
  });
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: markNotificationRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications() });
    },
    onError: (error: ApiError) => {
      toast.error(error.message ?? "Failed to mark notification as read");
    },
  });
}

export function useMarkAllRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: markAllNotificationsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications() });
      toast.success("All notifications marked as read.");
    },
    onError: (error: ApiError) => {
      toast.error(error.message ?? "Failed to mark all as read");
    },
  });
}
