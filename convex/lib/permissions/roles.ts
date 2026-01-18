export const ROLES = {
  USER: "user",
  PRO: "pro",
  ADMIN: "admin",
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

// Role hierarchy (higher index = more permissions)
export const ROLE_HIERARCHY: Role[] = [ROLES.USER, ROLES.PRO, ROLES.ADMIN];
