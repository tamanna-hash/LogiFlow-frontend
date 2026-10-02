"use client";

import { useEffect } from "react";
import { RefreshCw, Home } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

/**
 * Root error boundary — catches errors in any route segment below the root layout.
 * Does NOT include <html>/<body> — those are in global-error.tsx.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      console.error("[Error boundary]", error);
    }
    // TODO: send to error monitoring (e.g. Sentry.captureException(error))
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <h1 className="text-2xl font-semibold">Something went wrong</h1>
      <p className="mt-2 text-muted-foreground max-w-sm">
        An unexpected error occurred. Please try again or return home.
      </p>
      {error.digest && (
        <p className="mt-2 text-xs text-muted-foreground font-mono">
          Error ID: {error.digest}
        </p>
      )}
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Button onClick={reset}>
          <RefreshCw className="mr-2 size-4" aria-hidden="true" />
          Try again
        </Button>
        <Button variant="outline" asChild>
          <Link href="/">
            <Home className="mr-2 size-4" aria-hidden="true" />
            Go home
          </Link>
        </Button>
      </div>
    </div>
  );
}
