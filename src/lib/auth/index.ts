export { useAuthStore } from "./store";

import type { Role } from "@/types";

/** Dashboard route for a given role */
export function getRoleDashboardPath(role: Role): string {
  switch (role) {
    case "CUSTOMER":
      return "/dashboard/customer";
    case "COURIER":
      return "/dashboard/courier";
    case "HUB_MANAGER":
      return "/dashboard/hub";
    case "OPERATIONS_MANAGER":
      return "/dashboard/operations";
    case "ADMIN":
      return "/dashboard/admin";
    default:
      return "/dashboard";
  }
}

/** Returns true if the given role is authorized to access any of the allowed roles */
export function isAuthorized(userRole: Role | undefined, allowedRoles: Role[]): boolean {
  if (!userRole) return false;
  return allowedRoles.includes(userRole);
}
