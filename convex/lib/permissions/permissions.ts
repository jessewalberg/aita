import { ROLES, type Role } from "./roles";

// Define all permission constants
export const PERMISSIONS = {
  // Verdict permissions
  UNLIMITED_VERDICTS: "unlimited_verdicts",
  BYPASS_RATE_LIMIT: "bypass_rate_limit",

  // Future permissions (extensible)
  VIEW_ANALYTICS: "view_analytics",
  MANAGE_USERS: "manage_users",
  ACCESS_ADMIN_DASHBOARD: "access_admin_dashboard",
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

// Map roles to their permissions
export const ROLE_PERMISSIONS: Record<Role, readonly Permission[]> = {
  [ROLES.USER]: [],
  [ROLES.PRO]: [PERMISSIONS.UNLIMITED_VERDICTS, PERMISSIONS.BYPASS_RATE_LIMIT],
  [ROLES.ADMIN]: [
    PERMISSIONS.UNLIMITED_VERDICTS,
    PERMISSIONS.BYPASS_RATE_LIMIT,
    PERMISSIONS.VIEW_ANALYTICS,
    PERMISSIONS.MANAGE_USERS,
    PERMISSIONS.ACCESS_ADMIN_DASHBOARD,
  ],
};
