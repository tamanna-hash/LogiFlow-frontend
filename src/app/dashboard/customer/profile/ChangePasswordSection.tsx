"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { FormField } from "@/components/shared/FormField";
import { useChangePassword, useSetPassword } from "@/features/auth/hooks";
import { changePasswordSchema, type ChangePasswordFormValues } from "@/lib/validations/auth";
import { useAuthStore } from "@/lib/auth";

// ── Set-password Zod schema (confirm field is local-only, not sent to API) ───
const setPasswordSchema = z
  .object({
    newPassword:     z.string().min(8, "Must be at least 8 characters").max(64),
    confirmPassword: z.string(),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });
type SetPasswordFormValues = z.infer<typeof setPasswordSchema>;

// ── Set Password Form — shown to Google-only accounts ────────────────────────
function SetPasswordForm() {
  const [showNew, setShowNew] = useState(false);
  const { mutate: setPassword, isPending } = useSetPassword();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SetPasswordFormValues>({ resolver: zodResolver(setPasswordSchema) });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Set password</CardTitle>
        <CardDescription>
          Your account was created with Google. Add a password to also sign in with your email
          and password.
        </CardDescription>
      </CardHeader>
      <form
        onSubmit={handleSubmit((v) =>
          setPassword(
            { newPassword: v.newPassword },
            { onSuccess: () => reset() },
          )
        )}
      >
        <CardContent className="space-y-4">
          <FormField
            label="New password"
            htmlFor="sp-newPwd"
            error={errors.newPassword?.message}
            required
          >
            <div className="relative">
              <Input
                id="sp-newPwd"
                type={showNew ? "text" : "password"}
                autoComplete="new-password"
                className="pr-10"
                {...register("newPassword")}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                onClick={() => setShowNew((p) => !p)}
                aria-label={showNew ? "Hide password" : "Show password"}
              >
                {showNew ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
          </FormField>

          <FormField
            label="Confirm password"
            htmlFor="sp-confirmPwd"
            error={errors.confirmPassword?.message}
            required
          >
            <Input
              id="sp-confirmPwd"
              type="password"
              autoComplete="new-password"
              {...register("confirmPassword")}
            />
          </FormField>

          <div className="flex justify-end">
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
              Set password
            </Button>
          </div>
        </CardContent>
      </form>
    </Card>
  );
}

// ── Change Password Form — shown to accounts that already have a password ─────
function ChangePasswordForm() {
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const { mutate: changePassword, isPending } = useChangePassword();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ChangePasswordFormValues>({ resolver: zodResolver(changePasswordSchema) });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Change password</CardTitle>
        <CardDescription>
          Update your password. All other devices will be signed out after the change.
        </CardDescription>
      </CardHeader>
      <form
        onSubmit={handleSubmit((v) =>
          changePassword(
            { currentPassword: v.currentPassword, newPassword: v.newPassword },
            { onSuccess: () => reset() },
          )
        )}
      >
        <CardContent className="space-y-4">
          <FormField
            label="Current password"
            htmlFor="cp-currentPassword"
            error={errors.currentPassword?.message}
            required
          >
            <div className="relative">
              <Input
                id="cp-currentPassword"
                type={showCurrent ? "text" : "password"}
                autoComplete="current-password"
                className="pr-10"
                {...register("currentPassword")}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                onClick={() => setShowCurrent((p) => !p)}
                aria-label={showCurrent ? "Hide password" : "Show password"}
              >
                {showCurrent ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
          </FormField>

          <FormField
            label="New password"
            htmlFor="cp-newPassword"
            error={errors.newPassword?.message}
            required
          >
            <div className="relative">
              <Input
                id="cp-newPassword"
                type={showNew ? "text" : "password"}
                autoComplete="new-password"
                className="pr-10"
                {...register("newPassword")}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                onClick={() => setShowNew((p) => !p)}
                aria-label={showNew ? "Hide password" : "Show password"}
              >
                {showNew ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
          </FormField>

          <FormField
            label="Confirm new password"
            htmlFor="cp-confirmNewPassword"
            error={errors.confirmNewPassword?.message}
            required
          >
            <Input
              id="cp-confirmNewPassword"
              type="password"
              autoComplete="new-password"
              {...register("confirmNewPassword")}
            />
          </FormField>

          <div className="flex justify-end">
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
              Update password
            </Button>
          </div>
        </CardContent>
      </form>
    </Card>
  );
}

// ── Loading skeleton — shown while user data is being fetched ─────────────────
function PasswordSectionSkeleton() {
  return (
    <Card>
      <CardHeader>
        <div className="h-5 w-32 animate-pulse rounded bg-muted" />
        <div className="h-4 w-64 mt-1 animate-pulse rounded bg-muted" />
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="h-10 w-full animate-pulse rounded bg-muted" />
        <div className="h-10 w-full animate-pulse rounded bg-muted" />
        <div className="flex justify-end">
          <div className="h-10 w-28 animate-pulse rounded bg-muted" />
        </div>
      </CardContent>
    </Card>
  );
}

// ── Exported section — renders the correct form based on account type ─────────
//
// hasPassword is derived server-side in getMe() and returned as a boolean.
// The frontend never computes it from a client-controlled value.
// After useSetPassword succeeds it re-fetches /users/me and updates the store,
// so the section automatically switches from SetPasswordForm → ChangePasswordForm.
//
// Backwards-compatibility: persisted Zustand state from before this change may
// have hasPassword === undefined. We treat that as "true" (show ChangePasswordForm)
// since that is the safe default — a Google-only user will simply get a backend
// error if they call change-password without a current password, whereas an
// email/password user incorrectly shown SetPasswordForm would get a ConflictError.
// In practice this resolves on the next /users/me call (login or page refresh).
export function ChangePasswordSection() {
  const { user } = useAuthStore();

  // User not loaded yet — show skeleton to avoid layout shift
  if (!user) return <PasswordSectionSkeleton />;

  // hasPassword strictly false → Google-only account, show Set Password
  // hasPassword true or undefined (legacy session) → show Change Password
  return user.hasPassword === false ? <SetPasswordForm /> : <ChangePasswordForm />;
}
