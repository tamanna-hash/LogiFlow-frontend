"use client";

import { useEffect } from "react";
import { RefreshCw, Home } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error in development
    if (process.env.NODE_ENV === "development") {
      console.error("Global error boundary:", error);
    }
  }, [error]);

  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col items-center justify-center px-4 text-center bg-background text-foreground font-sans antialiased">
        <h1 className="text-2xl font-semibold">Something went wrong</h1>
        <p className="mt-2 text-muted-foreground max-w-sm">
          An unexpected error occurred. Please try refreshing the page.
        </p>
        {error.digest && (
          <p className="mt-2 text-xs text-muted-foreground font-mono">
            Error ID: {error.digest}
          </p>
        )}
        <div className="mt-6 flex gap-3">
          <Button onClick={reset}>
            <RefreshCw className="mr-2 size-4" />
            Try again
          </Button>
          <Button variant="outline" asChild>
            <Link href="/">
              <Home className="mr-2 size-4" />
              Go home
            </Link>
          </Button>
        </div>
      </body>
    </html>
  );
}
