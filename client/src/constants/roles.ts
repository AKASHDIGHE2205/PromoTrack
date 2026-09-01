export const ROLES = {
  ADMIN: "Admin",
  MANAGER: "Manager",
  MASTER: "Master",
  SP: "SP",
  USER: "User",
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

export const ADMIN_ROLES: Role[] = [ROLES.ADMIN, ROLES.MANAGER, ROLES.MASTER];
export const SALES_ROLES: Role[] = [ROLES.ADMIN, ROLES.SP, ROLES.USER, ROLES.MANAGER, ROLES.MASTER];
export const REPORT_ROLES: Role[] = [ROLES.ADMIN, ROLES.MANAGER, ROLES.MASTER];

export function hasRole(userRole: string | undefined | null, allowedRoles: readonly string[]): boolean {
  if (!userRole) return false;
  return allowedRoles.some((role) => role.toLowerCase() === userRole.toLowerCase());
}