import { apiPost, apiPatch, apiGet } from "@/lib/api/client";
import { AUTH_ENDPOINTS, USER_ENDPOINTS } from "@/lib/api/endpoints";
import type { AuthUser } from "@/types";

// Backend returns tokens flat: { user, accessToken, refreshToken }
// NOT nested as { user, tokens: { accessToken, refreshToken } }

export interface LoginResponse {
  user: AuthUser;
  accessToken: string;
  refreshToken: string;
}

export interface RegisterResponse {
  message: string;
}

export interface VerifyEmailResponse {
  user: AuthUser;
  accessToken: string;
  refreshToken: string;
}

export async function registerUser(data: {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone?: string;
}): Promise<RegisterResponse> {
  const resp = await apiPost<RegisterResponse>(AUTH_ENDPOINTS.register, data);
  return resp.data;
}

export async function verifyEmail(data: {
  email: string;
  otp: string;
}): Promise<VerifyEmailResponse> {
  const resp = await apiPost<VerifyEmailResponse>(AUTH_ENDPOINTS.verifyEmail, data);
  return resp.data;
}

export async function loginUser(data: {
  email: string;
  password: string;
}): Promise<LoginResponse> {
  const resp = await apiPost<LoginResponse>(AUTH_ENDPOINTS.login, data);
  return resp.data;
}

export async function logoutUser(refreshToken: string): Promise<void> {
  await apiPost<void>(AUTH_ENDPOINTS.logout, { refreshToken });
}

export async function changePassword(data: {
  currentPassword: string;
  newPassword: string;
}): Promise<void> {
  await apiPatch<void>(AUTH_ENDPOINTS.changePassword, data);
}

export async function setPassword(data: { newPassword: string }): Promise<void> {
  await apiPost<void>(AUTH_ENDPOINTS.setPassword, data);
}

export async function getCurrentUser(): Promise<AuthUser> {
  const resp = await apiGet<AuthUser>(USER_ENDPOINTS.me);
  return resp.data;
}
