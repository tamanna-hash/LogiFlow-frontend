"use client";

import { useState, useEffect } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { ThemeProvider } from "next-themes";
import { Toaster } from "sonner";
import { createQueryClient } from "@/lib/api/query-client";
import { useAuthStore } from "@/lib/auth";
import { useRouter, usePathname } from "next/navigation";

// Syncs auth state into routing-hint cookies for middleware
function AuthSyncHandler() {
  const { user, accessToken } = useAuthStore();

  useEffect(() => {
    if (accessToken && user) {
      document.cookie = `logiflow_token=1; path=/; SameSite=Strict`;
      document.cookie = `logiflow_role=${user.role}; path=/; SameSite=Strict`;
    } else {
      document.cookie = `logiflow_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
      document.cookie = `logiflow_role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
    }
  }, [accessToken, user]);

  return null;
}

// Session expiry listener
function SessionExpiryHandler() {
  const { clearAuth } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    function handleSessionExpired() {
      clearAuth();
      const returnTo = encodeURIComponent(pathname);
      router.push(`/login?expired=1&returnTo=${returnTo}`);
    }

    window.addEventListener("logiflow:session-expired", handleSessionExpired);
    return () => {
      window.removeEventListener("logiflow:session-expired", handleSessionExpired);
    };
  }, [clearAuth, router, pathname]);

  return null;
}

// Add a smooth transition class after the first paint to avoid flash on load
function ThemeTransitionEnabler() {
  useEffect(() => {
    // Small delay so the initial paint is complete before transitions are enabled
    const timer = setTimeout(() => {
      document.documentElement.classList.add("theme-transition");
    }, 100);
    return () => clearTimeout(timer);
  }, []);
  return null;
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => createQueryClient());

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange={false}
      storageKey="logiflow-theme"
    >
      <QueryClientProvider client={queryClient}>
        <ThemeTransitionEnabler />
        <AuthSyncHandler />
        <SessionExpiryHandler />
        {children}
        <Toaster
          position="top-right"
          richColors
          closeButton
          toastOptions={{ duration: 4000 }}
        />
        {process.env.NODE_ENV === "development" && (
          <ReactQueryDevtools initialIsOpen={false} />
        )}
      </QueryClientProvider>
    </ThemeProvider>
  );
}
