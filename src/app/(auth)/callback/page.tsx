import { Suspense } from "react";
import { CallbackHandler } from "./CallbackHandler";

export default function CallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="size-10 rounded-full border-4 border-primary border-t-transparent animate-spin" />
          <p className="text-sm text-muted-foreground">Completing sign-in…</p>
        </div>
      }
    >
      <CallbackHandler />
    </Suspense>
  );
}
