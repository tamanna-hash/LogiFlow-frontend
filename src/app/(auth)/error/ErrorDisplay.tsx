"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

// Map known backend error messages to user-friendly copy
function friendlyMessage(raw: string | null): string {
  if (!raw) return "An unexpected error occurred during Google sign-in.";

  const lower = raw.toLowerCase();

  if (lower.includes("already exists") || lower.includes("email and password")) {
    return "An account with this email already exists. Please sign in with your email and password instead.";
  }
  if (lower.includes("deactivated") || lower.includes("suspended")) {
    return "This account has been suspended. Please contact support.";
  }
  if (lower.includes("no email")) {
    return "Google did not share an email address. Please ensure your Google account has a verified email.";
  }
  if (lower.includes("failed") || lower.includes("cancelled")) {
    return "Google sign-in was cancelled or failed. Please try again.";
  }

  return raw;
}

export function ErrorDisplay() {
  const searchParams = useSearchParams();
  const rawMessage = searchParams.get("message");
  const message = friendlyMessage(rawMessage ? decodeURIComponent(rawMessage) : null);

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="space-y-3">
        <div className="flex justify-center">
          <div className="flex size-12 items-center justify-center rounded-full bg-destructive/10">
            <AlertCircle className="size-6 text-destructive" aria-hidden="true" />
          </div>
        </div>
        <CardTitle className="text-center text-xl">Sign-in failed</CardTitle>
      </CardHeader>

      <CardContent>
        <p className="text-center text-sm text-muted-foreground" role="alert">
          {message}
        </p>
      </CardContent>

      <CardFooter className="flex flex-col gap-3">
        <Button asChild className="w-full">
          <Link href="/login">Back to sign in</Link>
        </Button>
        <Button asChild variant="ghost" className="w-full text-sm">
          <Link href="/register">Create a new account</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
