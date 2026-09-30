import { apiGet, apiPatch, apiDelete } from "@/lib/api/client";
import { ADMIN_ENDPOINTS, USER_ENDPOINTS } from "@/lib/api/endpoints";
import type { SystemStats, AuditLog, AuthUser, PaginationMeta } from "@/types";

export async function getSystemStats(): Promise<SystemStats> {
  const resp = await apiGet<SystemStats>(ADMIN_ENDPOINTS.stats);
  return resp.data;
}

export interface AuditLogListResponse {
  logs: AuditLog[];
  meta: PaginationMeta;
}

export async function getAuditLogs(params?: {
  page?: number;
  limit?: number;
  action?: string;
  actorId?: string;
  resourceType?: string;
  resourceId?: string;
  fromDate?: string;
  toDate?: string;
}): Promise<AuditLogListResponse> {
  const resp = await apiGet<AuditLog[]>(
    ADMIN_ENDPOINTS.auditLogs,
    params as Record<string, unknown>
  );
  return { logs: resp.data, meta: resp.meta! };
}

export async function getOperationalLogs(params?: {
  page?: number;
  limit?: number;
  action?: string;
  fromDate?: string;
  toDate?: string;
}): Promise<AuditLogListResponse> {
  const resp = await apiGet<AuditLog[]>(
    ADMIN_ENDPOINTS.operationalLogs,
    params as Record<string, unknown>
  );
  return { logs: resp.data, meta: resp.meta! };
}

export interface UserListResponse {
  users: AuthUser[];
  meta: PaginationMeta;
}

export async function listUsers(params?: {
  page?: number;
  limit?: number;
  role?: string;
  isActive?: boolean;
  search?: string;
  sortBy?: string;
  sortOrder?: string;
  includeDeleted?: boolean;
}): Promise<UserListResponse> {
  const resp = await apiGet<AuthUser[]>(
    USER_ENDPOINTS.list,
    params as Record<string, unknown>
  );
  return { users: resp.data, meta: resp.meta! };
}

export async function getUserById(id: string): Promise<AuthUser> {
  const resp = await apiGet<AuthUser>(USER_ENDPOINTS.byId(id));
  return resp.data;
}

export async function updateUserRole(
  id: string,
  role: string
): Promise<AuthUser> {
  const resp = await apiPatch<AuthUser>(USER_ENDPOINTS.role(id), { role });
  return resp.data;
}

export async function deleteUser(id: string): Promise<void> {
  await apiDelete(USER_ENDPOINTS.delete(id));
}
