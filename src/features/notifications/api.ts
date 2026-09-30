import { apiGet, apiPatch } from "@/lib/api/client";
import { NOTIFICATION_ENDPOINTS } from "@/lib/api/endpoints";
import type { Notification, PaginationMeta } from "@/types";

export interface NotificationListResponse {
  notifications: Notification[];
  meta: PaginationMeta & { unreadCount: number };
}

export async function getNotifications(params?: {
  page?: number;
  limit?: number;
  isRead?: boolean;
  type?: string;
}): Promise<NotificationListResponse> {
  const resp = await apiGet<Notification[]>(
    NOTIFICATION_ENDPOINTS.list,
    params as Record<string, unknown>
  );
  return {
    notifications: resp.data,
    meta: resp.meta as PaginationMeta & { unreadCount: number },
  };
}

export async function markNotificationRead(id: string): Promise<void> {
  await apiPatch(NOTIFICATION_ENDPOINTS.markRead(id));
}

export async function markAllNotificationsRead(): Promise<void> {
  await apiPatch(NOTIFICATION_ENDPOINTS.readAll);
}
