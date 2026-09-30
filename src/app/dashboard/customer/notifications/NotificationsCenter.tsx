"use client";

import { Bell, CheckCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import { ErrorState } from "@/components/shared/ErrorState";
import { useNotifications, useMarkNotificationRead, useMarkAllRead } from "@/features/notifications/hooks";
import { formatRelativeTime } from "@/lib/utils";
import { cn } from "@/lib/utils";

export function NotificationsCenter() {
  const { data, isLoading, isError, refetch } = useNotifications({ limit: 50 });
  const { mutate: markRead } = useMarkNotificationRead();
  const { mutate: markAll, isPending: isMarkingAll } = useMarkAllRead();

  const notifications = data?.notifications ?? [];
  const unreadCount = data?.meta?.unreadCount ?? 0;

  return (
    <div className="space-y-6 max-w-2xl">
      <PageHeader
        title="Notifications"
        description={unreadCount > 0 ? `${unreadCount} unread` : "All caught up"}
      >
        {unreadCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => markAll()}
            loading={isMarkingAll}
          >
            <CheckCheck className="mr-2 size-4" />
            Mark all read
          </Button>
        )}
      </PageHeader>

      <Card>
        <CardContent className="p-0">
          {isError ? (
            <div className="p-6">
              <ErrorState title="Could not load notifications" onRetry={() => refetch()} />
            </div>
          ) : isLoading ? (
            <div className="divide-y">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex gap-3 p-4">
                  <div className="size-9 animate-pulse rounded-full bg-muted" />
                  <div className="flex-1 space-y-1">
                    <div className="h-4 w-2/3 animate-pulse rounded bg-muted" />
                    <div className="h-3 w-full animate-pulse rounded bg-muted" />
                  </div>
                </div>
              ))}
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-6">
              <EmptyState
                icon={<Bell className="size-6" />}
                title="No notifications"
                description="You're all caught up! Notifications about your shipments will appear here."
              />
            </div>
          ) : (
            <ul className="divide-y" role="list">
              {notifications.map((n) => (
                <li
                  key={n.id}
                  className={cn(
                    "flex gap-3 p-4 transition-colors",
                    !n.isRead && "bg-primary/5 hover:bg-primary/10",
                    n.isRead && "hover:bg-muted/30"
                  )}
                >
                  <div
                    className={cn(
                      "mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full text-sm",
                      !n.isRead ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                    )}
                    aria-hidden="true"
                  >
                    <Bell className="size-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className={cn("text-sm", !n.isRead && "font-semibold")}>{n.title}</p>
                      <time className="shrink-0 text-xs text-muted-foreground" dateTime={n.createdAt}>
                        {formatRelativeTime(n.createdAt)}
                      </time>
                    </div>
                    <p className="text-sm text-muted-foreground">{n.message}</p>
                    {!n.isRead && (
                      <button
                        onClick={() => markRead(n.id)}
                        className="mt-1 text-xs text-primary hover:underline"
                      >
                        Mark as read
                      </button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
