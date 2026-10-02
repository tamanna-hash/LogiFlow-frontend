"use client";

/**
 * CallbackHandler — processes the OAuth redirect from the backend.
 *
 * The backend's googleCallback controller redirects here with:
 *   /auth/callback?accessToken=<jwt>&refreshToken=<hex>
 *
 * This component:
 *  1. Reads the tokens from the URL search params (never stores them in the URL)
 *  2. Immediately replaces the URL to strip tokens from browser history
 *  3. Hydrates the Zustand auth store via setTokens + calls /users/me
 *  4. Sets the routing-hint cookies so middleware works correctly
 *  5. Redirects to the role-specific dashboard (or returnTo path)
 *
 * Security notes:
 *  - Tokens arrive via query param only because passport-google-oauth20 is a
 *    server-side redirect flow — there is no alternative without a full BFF/PKCE
 *    rearchitecture. We strip them from the URL immediately.
 *  - The accessToken is a short-lived (15m) HS256 JWT. The refreshToken is an
 *    opaque 128-char hex stored hashed in DB — not a secret that enables Google
 *    account access.
 *  - Never log these values.
 */

import { useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { useAuthStore } from "@/lib/auth";
import { setTokens } from "@/lib/api/client";
import { getRoleDashboardPath } from "@/lib/auth";
import { getCurrentUser } from "@/features/auth/api";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/api/query-client";

export function CallbackHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setAuth } = useAuthStore();
  const queryClient = useQueryClient();
  const ran = useRef(false); // prevent double-execution in React StrictMode

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    async function handleCallback() {
      const accessToken = searchParams.get("accessToken");
      const refreshToken = searchParams.get("refreshToken");
      const returnTo = searchParams.get("returnTo");

      // ── Immediately strip tokens from the URL ──────────────────────────────
      // Replace history entry so the tokens are never visible in browser
      // history or logged by analytics tools.
      if (typeof window !== "undefined") {
        window.history.replaceState(null, "", "/auth/callback");
      }

      if (!accessToken || !refreshToken) {
        toast.error("Sign-in failed: missing authentication data.");
        router.replace("/login?error=missing_tokens");
        return;
      }

      try {
        // ── Hydrate token storage (localStorage + in-memory) ──────────────────
        setTokens({ accessToken, refreshToken });

        // ── Fetch full user object from /users/me ──────────────────────────────
        // getCurrentUser() uses the apiGet wrapper which reads the token from
        // localStorage via the Axios request interceptor — already set above.
        const user = await getCurrentUser();

        // ── Update Zustand store ───────────────────────────────────────────────
        setAuth(user, { accessToken, refreshToken });

        // ── Seed React Query cache ─────────────────────────────────────────────
        queryClient.setQueryData(queryKeys.currentUser, user);

        toast.success(`Welcome, ${user.firstName}!`);

        // ── Redirect to role dashboard or explicit returnTo ────────────────────
        const destination =
          returnTo && returnTo.startsWith("/") && !returnTo.startsWith("//")
            ? decodeURIComponent(returnTo)
            : getRoleDashboardPath(user.role);

        router.replace(destination);
      } catch (err) {
        // setAuth/setTokens writes may have partially succeeded — clean up
        const { clearAuth } = useAuthStore.getState();
        clearAuth();

        const message =
          err instanceof Error ? err.message : "Authentication failed";
        console.error("[OAuth Callback] Error:", message);
        toast.error("Sign-in failed. Please try again.");
        router.replace(`/login?error=callback_failed`);
      }
    }

    handleCallback();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="flex flex-col items-center gap-4 text-center" role="status" aria-live="polite">
      <div
        className="size-10 rounded-full border-4 border-primary border-t-transparent animate-spin"
        aria-hidden="true"
      />
      <p className="text-sm text-muted-foreground">Completing sign-in…</p>
    </div>
  );
}
