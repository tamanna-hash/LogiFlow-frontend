import type { Metadata } from "next";
import { Suspense } from "react";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = {
  title: "Log in",
  description: "Sign in to your LogiFlow account.",
};

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="w-full max-w-md h-96 animate-pulse rounded-xl bg-muted" />}>
      <LoginForm />
    </Suspense>
  );
}
