"use client";

import { useEffect } from "react";
import { RefreshCw } from "lucide-react";

/**
 * Global error boundary — catches errors in the root layout itself.
 * Must include its own <html> and <body> tags since the root layout is broken.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      console.error("[Global error boundary]", error);
    }
    // TODO: send to error monitoring (e.g. Sentry.captureException(error))
  }, [error]);

  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col items-center justify-center px-4 text-center bg-white text-gray-900 font-sans antialiased">
        <h1 className="text-2xl font-semibold">Something went wrong</h1>
        <p className="mt-2 text-gray-500 max-w-sm">
          A critical error occurred. Please refresh the page.
        </p>
        {error.digest && (
          <p className="mt-2 text-xs text-gray-400 font-mono">
            Error ID: {error.digest}
          </p>
        )}
        <button
          onClick={reset}
          className="mt-6 inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <RefreshCw className="size-4" aria-hidden="true" />
          Try again
        </button>
      </body>
    </html>
  );
}
