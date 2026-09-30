import * as React from "react";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ApiError } from "@/lib/api/client";

interface ErrorStateProps {
  error?: ApiError | Error | null;
  onRetry?: () => void;
  title?: string;
  className?: string;
}

export function ErrorState({
  error,
  onRetry,
  title = "Something went wrong",
  className,
}: ErrorStateProps) {
  const message =
    error?.message ??
    "An unexpected error occurred. Please try again.";

  const isNotFound = error instanceof Error && "status" in error && (error as ApiError).status === 404;

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-lg border border-destructive/20 bg-destructive/5 px-6 py-12 text-center",
        className
      )}
      role="alert"
    >
      <AlertCircle className="mb-4 size-10 text-destructive" aria-hidden="true" />
      <h3 className="text-base font-semibold">
        {isNotFound ? "Not found" : title}
      </h3>
      <p className="mt-1 text-sm text-muted-foreground max-w-sm">{message}</p>
      {onRetry && (
        <Button
          size="sm"
          variant="outline"
          className="mt-4"
          onClick={onRetry}
        >
          <RefreshCw className="mr-2 size-4" aria-hidden="true" />
          Try again
        </Button>
      )}
    </div>
  );
}
