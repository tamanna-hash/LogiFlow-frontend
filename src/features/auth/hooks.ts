"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAuthStore } from "@/lib/auth";
import { queryKeys } from "@/lib/api/query-client";
import {
  loginUser,
  logoutUser,
  registerUser,
  verifyEmail,
  changePassword,
  setPassword,
  getCurrentUser,
} from "./api";
import { getRoleDashboardPath } from "@/lib/auth";
import type { ApiError } from "@/lib/api/client";

// ── Current user ─────────────────────────────────────────────────────────────

export function useCurrentUser() {
  const { accessToken, setUser } = useAuthStore();
  return useQuery({
    queryKey: queryKeys.currentUser,
    queryFn: async () => {
      const user = await getCurrentUser();
      setUser(user);
      return user;
    },
    enabled: !!accessToken,
    staleTime: 5 * 60 * 1000,
  });
}

// ── Register ──────────────────────────────────────────────────────────────────

export function useRegister() {
  return useMutation({
    mutationFn: registerUser,
    onError: (error: ApiError) => {
      toast.error(error.message ?? "Registration failed");
    },
  });
}

// ── Verify email ─────────────────────────────────────────────────────────────

export function useVerifyEmail() {
  const { setAuth } = useAuthStore();
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: verifyEmail,
    onSuccess: (data) => {
      const tokens = { accessToken: data.accessToken, refreshToken: data.refreshToken };
      setAuth(data.user, tokens);
      queryClient.setQueryData(queryKeys.currentUser, data.user);
      toast.success("Email verified! Welcome to LogiFlow.");
      router.push(getRoleDashboardPath(data.user.role));
    },
    onError: (error: ApiError) => {
      toast.error(error.message ?? "Verification failed");
    },
  });
}

// ── Login ─────────────────────────────────────────────────────────────────────

export function useLogin() {
  const { setAuth } = useAuthStore();
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: loginUser,
    onSuccess: (data) => {
      const tokens = { accessToken: data.accessToken, refreshToken: data.refreshToken };
      setAuth(data.user, tokens);
      queryClient.setQueryData(queryKeys.currentUser, data.user);
      toast.success(`Welcome back, ${data.user.firstName}!`);
      router.push(getRoleDashboardPath(data.user.role));
    },
    onError: (error: ApiError) => {
      toast.error(error.message ?? "Login failed");
    },
  });
}

// ── Logout ────────────────────────────────────────────────────────────────────

export function useLogout() {
  const { refreshToken, clearAuth } = useAuthStore();
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: () => {
      if (!refreshToken) return Promise.resolve();
      return logoutUser(refreshToken);
    },
    onSettled: () => {
      // Always clear auth even if the API call fails
      clearAuth();
      queryClient.clear();
      router.push("/login");
      toast.success("You have been logged out.");
    },
  });
}

// ── Change password ───────────────────────────────────────────────────────────

export function useChangePassword() {
  return useMutation({
    mutationFn: changePassword,
    onSuccess: () => {
      toast.success("Password changed successfully.");
    },
    onError: (error: ApiError) => {
      toast.error(error.message ?? "Failed to change password");
    },
  });
}

// ── Set password (Google-only users) ─────────────────────────────────────────

export function useSetPassword() {
  return useMutation({
    mutationFn: setPassword,
    onSuccess: () => {
      toast.success("Password set. You can now sign in with email and password.");
    },
    onError: (error: ApiError) => {
      toast.error(error.message ?? "Failed to set password");
    },
  });
}
