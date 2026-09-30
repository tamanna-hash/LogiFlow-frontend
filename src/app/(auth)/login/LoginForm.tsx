"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { FormField } from "@/components/shared/FormField";
import { useLogin } from "@/features/auth/hooks";
import { loginSchema, type LoginFormValues } from "@/lib/validations/auth";

// Demo credentials — these are placeholder values.
// Replace with actual demo account credentials once the backend has dedicated demo accounts.
const DEMO_ACCOUNTS = [
  { role: "Customer", email: "demo_customer@example.com", password: "Demo@12345" },
  { role: "Courier", email: "demo_courier@example.com", password: "Demo@12345" },
  { role: "Hub Manager", email: "demo_hub@example.com", password: "Demo@12345" },
  { role: "Operations", email: "demo_ops@example.com", password: "Demo@12345" },
  { role: "Admin", email: "demo_admin@example.com", password: "Demo@12345" },
];

export function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const searchParams = useSearchParams();
  const isExpired = searchParams.get("expired") === "1";
  const { mutate: login, isPending } = useLogin();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  function onSubmit(values: LoginFormValues) {
    login(values);
  }

  function fillDemo(email: string, password: string) {
    setValue("email", email);
    setValue("password", password);
  }

  return (
    <div className="w-full max-w-md space-y-4">
      {isExpired && (
        <div
          className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800"
          role="alert"
        >
          Your session has expired. Please log in again.
        </div>
      )}

      <Card>
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl">Welcome back</CardTitle>
          <CardDescription>
            Sign in to your LogiFlow account
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <CardContent className="space-y-4">
            <FormField
              label="Email"
              htmlFor="email"
              error={errors.email?.message}
              required
            >
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                autoComplete="email"
                aria-describedby={errors.email ? "email-error" : undefined}
                {...register("email")}
              />
            </FormField>

            <FormField
              label="Password"
              htmlFor="password"
              error={errors.password?.message}
              required
            >
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  aria-describedby={errors.password ? "password-error" : undefined}
                  className="pr-10"
                  {...register("password")}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="size-4" />
                  ) : (
                    <Eye className="size-4" />
                  )}
                </button>
              </div>
            </FormField>
          </CardContent>

          <CardFooter className="flex flex-col gap-3">
            <Button type="submit" className="w-full" loading={isPending}>
              Sign in
            </Button>
            <p className="text-sm text-center text-muted-foreground">
              Don&apos;t have an account?{" "}
              <Link href="/register" className="text-primary font-medium hover:underline">
                Create one
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>

      {/* Demo login section */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">Demo accounts</CardTitle>
          <CardDescription className="text-xs">
            Click to pre-fill credentials for a specific role. These require
            dedicated demo accounts on the backend — contact your administrator
            if login fails.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {DEMO_ACCOUNTS.map((acc) => (
              <Button
                key={acc.role}
                type="button"
                variant="outline"
                size="sm"
                className="text-xs"
                onClick={() => fillDemo(acc.email, acc.password)}
              >
                {acc.role}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
