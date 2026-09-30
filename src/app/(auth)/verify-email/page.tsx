import type { Metadata } from "next";
import { Suspense } from "react";
import { VerifyEmailForm } from "./VerifyEmailForm";

export const metadata: Metadata = {
  title: "Verify email",
  description: "Enter the verification code sent to your email.",
};

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="w-full max-w-md h-96 animate-pulse rounded-xl bg-muted" />}>
      <VerifyEmailForm />
    </Suspense>
  );
}
