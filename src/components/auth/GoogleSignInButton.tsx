"use client";

/**
 * GoogleSignInButton
 *
 * Initiates the Passport.js redirect-based Google OAuth flow by navigating
 * the browser to the backend's GET /api/v1/auth/google endpoint.
 *
 * Architecture: the backend handles the full PKCE / code-exchange flow with
 * Google. After Google redirects back to the backend callback, the backend
 * issues LogiFlow JWT + refresh token and redirects to /auth/callback on the
 * frontend. No Google tokens ever reach the browser.
 *
 * Props:
 *  - label      Custom button label (default: "Continue with Google")
 *  - disabled   Disable the button externally (e.g. while a form submits)
 *  - returnTo   Optional path to redirect after successful OAuth
 */

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { API_URL } from "@/config";
import { AUTH_ENDPOINTS } from "@/lib/api/endpoints";

interface GoogleSignInButtonProps {
  label?: string;
  disabled?: boolean;
  returnTo?: string;
}

export function GoogleSignInButton({
  label = "Continue with Google",
  disabled = false,
  returnTo,
}: GoogleSignInButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  function handleClick() {
    if (isLoading || disabled) return;
    setIsLoading(true);

    // Build the backend Google OAuth initiation URL.
    // The backend's Passport strategy will redirect to Google's consent screen.
    const url = new URL(`${API_URL}${AUTH_ENDPOINTS.googleAuth}`);

    // Pass returnTo so the callback page can redirect there after success
    if (returnTo) {
      url.searchParams.set("returnTo", returnTo);
    }

    // Full page navigation — required for redirect-based OAuth
    window.location.href = url.toString();
  }

  return (
    <Button
      type="button"
      variant="outline"
      className="w-full gap-2 font-medium"
      onClick={handleClick}
      disabled={disabled || isLoading}
      aria-label={isLoading ? "Redirecting to Google…" : label}
    >
      {isLoading ? (
        <Loader2 className="size-4 animate-spin" aria-hidden="true" />
      ) : (
        // Official Google "G" logo SVG — safe to use per Google brand guidelines
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          className="size-4 shrink-0"
          aria-hidden="true"
          focusable="false"
        >
          <path
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            fill="#4285F4"
          />
          <path
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            fill="#34A853"
          />
          <path
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
            fill="#FBBC05"
          />
          <path
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            fill="#EA4335"
          />
        </svg>
      )}
      {isLoading ? "Redirecting to Google…" : label}
    </Button>
  );
}
