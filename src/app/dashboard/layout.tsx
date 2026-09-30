"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { DashboardSidebar } from "@/components/shared/nav/DashboardSidebar";
import { DashboardHeader } from "@/components/shared/nav/DashboardHeader";
import { useAuthStore, getRoleDashboardPath } from "@/lib/auth";
import { useCurrentUser } from "@/features/auth/hooks";
import { Skeleton } from "@/components/shared/Skeleton";

function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, accessToken, isLoading } = useAuthStore();
  const { isLoading: isLoadingUser } = useCurrentUser();

  useEffect(() => {
    if (!isLoading && !accessToken) {
      router.replace("/login");
    }
  }, [isLoading, accessToken, router]);

  if (isLoadingUser && !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="space-y-2 w-64">
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      </div>
    );
  }

  if (!accessToken && !isLoading) {
    return null;
  }

  return <>{children}</>;
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <AuthGuard>
      <div className="flex min-h-screen bg-muted/30">
        <DashboardSidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
        <div className="flex flex-1 flex-col lg:pl-0">
          <DashboardHeader onMenuToggle={() => setSidebarOpen(true)} />
          <main
            id="main-content"
            className="flex-1 overflow-auto p-4 md:p-6"
          >
            {children}
          </main>
        </div>
      </div>
    </AuthGuard>
  );
}
