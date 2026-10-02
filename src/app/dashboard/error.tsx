"use client";

import { useEffect } from "react";
import { RefreshCw, LayoutDashboard } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

/**
 * Dashboard error boundary — catches errors within any dashboard route segment.
 * Keeps the sidebar/header intact; only the main content area shows the error.
 */
export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      console.error("[Dashboard error boundary]", error);
    }
  }, [error]);

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center px-4 text-center">
      <h2 className="text-xl font-semibold">Something went wrong</h2>
      <p className="mt-2 text-sm text-muted-foreground max-w-sm">
        This section failed to load. Try again or navigate to another page.
      </p>
      {error.digest && (
        <p className="mt-1 text-xs text-muted-foreground font-mono">
          Error ID: {error.digest}
        </p>
      )}
      <div className="mt-5 flex flex-wrap justify-center gap-3">
        <Button size="sm" onClick={reset}>
          <RefreshCw className="mr-2 size-3.5" aria-hidden="true" />
          Try again
        </Button>
        <Button size="sm" variant="outline" asChild>
          <Link href="/dashboard">
            <LayoutDashboard className="mr-2 size-3.5" aria-hidden="true" />
            Dashboard
          </Link>
        </Button>
      </div>
    </div>
  );
}
