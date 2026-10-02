import { Suspense } from "react";
import { ErrorDisplay } from "./ErrorDisplay";

export default function AuthErrorPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full max-w-md h-48 animate-pulse rounded-xl bg-muted" />
      }
    >
      <ErrorDisplay />
    </Suspense>
  );
}
