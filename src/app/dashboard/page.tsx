"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore, getRoleDashboardPath } from "@/lib/auth";
import type { Role } from "@/types";

export default function DashboardRedirectPage() {
  const router = useRouter();
  const { user } = useAuthStore();

  useEffect(() => {
    if (user) {
      router.replace(getRoleDashboardPath(user.role as Role));
    }
  }, [user, router]);

  return null;
}
