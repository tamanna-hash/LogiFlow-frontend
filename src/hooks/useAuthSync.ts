"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/lib/auth";

/**
 * Syncs the auth state from Zustand/localStorage into cookies
 * so the middleware can perform lightweight routing checks.
 *
 * These cookies carry NO secrets — the access token cookie is
 * used only as a "session exists" signal in middleware.
 * The real token for API calls lives in localStorage.
 * The backend validates every request independently.
 */
export function useAuthSync() {
  const { user, accessToken } = useAuthStore();

  useEffect(() => {
    if (accessToken && user) {
      // Set a session-hint cookie for middleware routing
      document.cookie = `logiflow_token=1; path=/; SameSite=Strict`;
      document.cookie = `logiflow_role=${user.role}; path=/; SameSite=Strict`;
    } else {
      // Clear routing-hint cookies on logout
      document.cookie = `logiflow_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
      document.cookie = `logiflow_role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
    }
  }, [accessToken, user]);
}
