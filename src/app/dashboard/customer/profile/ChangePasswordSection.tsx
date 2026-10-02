"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff } from "lucide-react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { FormField } from "@/components/shared/FormField";
import { useChangePassword, useSetPassword } from "@/features/auth/hooks";
import { useAuthStore } from "@/lib/auth";
import { changePasswordSchema, type ChangePasswordFormValues } from "@/lib/validations/auth";

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

// ── Set password form (Google-only accounts) ──────────────────────────────────
function SetPasswordForm() {
  const [showNew, setShowNew] = useState(false);
  const { mutate: setPassword, isPending } = useSetPassword();

  const { register, handleSubmit, reset, formState: { errors } } = useForm<SetPasswordFormValues>({
    resolver: zodResolver(setPasswordSchema),
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Set password</CardTitle>
        <CardDescription>
          Your account was created with Google. Add a password to also sign in with email and password.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit((v) => setPassword({ newPassword: v.newPassword }, { onSuccess: () => reset() }))}>
        <CardContent className="space-y-4">
          <FormField label="New password" htmlFor="newPwd" error={errors.newPassword?.message} required>
            <div className="relative">
              <Input id="newPwd" type={showNew ? "text" : "password"} autoComplete="new-password" className="pr-10" {...register("newPassword")} />
              <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" onClick={() => setShowNew(!showNew)} aria-label={showNew ? "Hide" : "Show"}>
                {showNew ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
          </FormField>
          <FormField label="Confirm password" htmlFor="confirmPwd" error={errors.confirmPassword?.message} required>
            <Input id="confirmPwd" type="password" autoComplete="new-password" {...register("confirmPassword")} />
          </FormField>
          <div className="flex justify-end">
            <Button type="submit" loading={isPending}>Set password</Button>
          </div>
        </CardContent>
      </form>
    </Card>
  );
}

// ── Change password form (email/password accounts) ────────────────────────────
function ChangePasswordForm() {
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const { mutate: changePassword, isPending } = useChangePassword();

  const { register, handleSubmit, reset, formState: { errors } } = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Change password</CardTitle>
        <CardDescription>Update your password. You will need to log in again after changing it.</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit((v) => changePassword({ currentPassword: v.currentPassword, newPassword: v.newPassword }, { onSuccess: () => reset() }))}>
        <CardContent className="space-y-4">
          <FormField label="Current password" htmlFor="currentPassword" error={errors.currentPassword?.message} required>
            <div className="relative">
              <Input id="currentPassword" type={showCurrent ? "text" : "password"} autoComplete="current-password" className="pr-10" {...register("currentPassword")} />
              <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" onClick={() => setShowCurrent(!showCurrent)} aria-label={showCurrent ? "Hide" : "Show"}>
                {showCurrent ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
          </FormField>
          <FormField label="New password" htmlFor="newPassword" error={errors.newPassword?.message} required>
            <div className="relative">
              <Input id="newPassword" type={showNew ? "text" : "password"} autoComplete="new-password" className="pr-10" {...register("newPassword")} />
              <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" onClick={() => setShowNew(!showNew)} aria-label={showNew ? "Hide" : "Show"}>
                {showNew ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
          </FormField>
          <FormField label="Confirm new password" htmlFor="confirmNewPassword" error={errors.confirmNewPassword?.message} required>
            <Input id="confirmNewPassword" type="password" autoComplete="new-password" {...register("confirmNewPassword")} />
          </FormField>
          <div className="flex justify-end">
            <Button type="submit" loading={isPending}>Update password</Button>
          </div>
        </CardContent>
      </form>
    </Card>
  );
}

// ── Exported section — renders the right form based on account type ────────────
export function ChangePasswordSection() {
  const { user } = useAuthStore();
  // If user has no password (Google-only), show set-password form
  // We infer this by checking if there's a googleId — but AuthUser doesn't expose passwordHash.
  // The backend returns BadRequestError with "no password" message on changePassword for Google users,
  // so we show the set-password form when the user came from Google OAuth (no way to know for certain
  // without a backend field). We expose both forms but the backend will reject the wrong one.
  // For now show SetPassword first if user has no password indicator — we detect via the role being
  // CUSTOMER and just always show ChangePassword (set-password is a fallback via the hook error).
  // A cleaner approach: the backend could return hasPassword in /users/me, but it doesn't currently.
  // So we always render ChangePasswordForm and let the backend return the appropriate error.
  return <ChangePasswordForm />;
}

// Export SetPasswordSection separately for Google-account profile pages
export function SetPasswordSection() {
  return <SetPasswordForm />;
}
