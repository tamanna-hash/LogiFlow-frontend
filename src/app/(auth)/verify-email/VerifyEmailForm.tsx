"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { FormField } from "@/components/shared/FormField";
import { useVerifyEmail } from "@/features/auth/hooks";
import { verifyEmailSchema, type VerifyEmailFormValues } from "@/lib/validations/auth";

export function VerifyEmailForm() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email") ?? "";

  const { mutate: verify, isPending } = useVerifyEmail();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<VerifyEmailFormValues>({
    resolver: zodResolver(verifyEmailSchema),
    defaultValues: { email },
  });

  function onSubmit(values: VerifyEmailFormValues) {
    verify(values);
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="space-y-1">
        <div className="flex items-center justify-center mb-2">
          <div className="flex size-12 items-center justify-center rounded-full bg-primary/10">
            <Mail className="size-6 text-primary" aria-hidden="true" />
          </div>
        </div>
        <CardTitle className="text-2xl text-center">Verify your email</CardTitle>
        <CardDescription className="text-center">
          We sent a 6-digit code to{" "}
          {email ? (
            <strong className="text-foreground">{email}</strong>
          ) : (
            "your email address"
          )}
          . It expires in 5 minutes.
        </CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <CardContent className="space-y-4">
          {!email && (
            <FormField label="Email" htmlFor="email" error={errors.email?.message} required>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                {...register("email")}
              />
            </FormField>
          )}

          <FormField
            label="Verification code"
            htmlFor="otp"
            error={errors.otp?.message}
            hint="Enter the 6-digit code from your email"
            required
          >
            <Input
              id="otp"
              type="text"
              inputMode="numeric"
              maxLength={6}
              placeholder="123456"
              autoComplete="one-time-code"
              className="text-center text-lg tracking-widest"
              {...register("otp")}
            />
          </FormField>
        </CardContent>

        <CardFooter className="flex flex-col gap-3">
          <Button type="submit" className="w-full" loading={isPending}>
            Verify email
          </Button>

          <p className="text-sm text-center text-muted-foreground">
            Didn&apos;t receive a code?{" "}
            <Link
              href={`/register`}
              className="text-primary font-medium hover:underline"
            >
              Register again
            </Link>{" "}
            to resend.
          </p>

          <p className="text-sm text-center text-muted-foreground">
            Already verified?{" "}
            <Link href="/login" className="text-primary font-medium hover:underline">
              Sign in
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
