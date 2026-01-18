import { ROLES, ROLE_HIERARCHY, type Role } from "./roles";
import { PERMISSIONS, ROLE_PERMISSIONS, type Permission } from "./permissions";

// User type matching the schema
type UserRecord = {
  tier: "free" | "pro";
  role?: Role;
};

/**
 * Get effective role from user record.
 * Handles backwards compatibility: users without role field default to 'user'.
 * Also considers tier for legacy pro users who haven't been assigned a role.
 */
export function getEffectiveRole(user: UserRecord | null | undefined): Role {
  if (!user) return ROLES.USER;

  // If role is explicitly set, use it
  if (user.role) return user.role;

  // Backwards compatibility: tier=pro implies pro role if no role is set
  if (user.tier === "pro") return ROLES.PRO;

  return ROLES.USER;
}

/**
 * Check if a user has a specific permission.
 */
export function hasPermission(
  user: UserRecord | null | undefined,
  permission: Permission
): boolean {
  const role = getEffectiveRole(user);
  const permissions = ROLE_PERMISSIONS[role] ?? [];
  return permissions.includes(permission);
}

/**
 * Check if user can bypass rate limits (convenience function).
 */
export function canBypassRateLimit(
  user: UserRecord | null | undefined
): boolean {
  return hasPermission(user, PERMISSIONS.BYPASS_RATE_LIMIT);
}

/**
 * Check if user has unlimited verdicts.
 */
export function hasUnlimitedVerdicts(
  user: UserRecord | null | undefined
): boolean {
  return hasPermission(user, PERMISSIONS.UNLIMITED_VERDICTS);
}

/**
 * Check if role is at least the specified level.
 */
export function hasRoleAtLeast(
  user: UserRecord | null | undefined,
  requiredRole: Role
): boolean {
  const userRole = getEffectiveRole(user);
  const userIndex = ROLE_HIERARCHY.indexOf(userRole);
  const requiredIndex = ROLE_HIERARCHY.indexOf(requiredRole);
  return userIndex >= requiredIndex;
}

/**
 * Check if user is an admin.
 */
export function isAdmin(user: UserRecord | null | undefined): boolean {
  return getEffectiveRole(user) === ROLES.ADMIN;
}
