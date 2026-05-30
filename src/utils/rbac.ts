/** Staff roles that may access /admin (not CUSTOMER). */
export const STAFF_ROLE_NAMES = ["ADMIN", "WAREHOUSE", "SALES"] as const;

export type StaffRoleName = (typeof STAFF_ROLE_NAMES)[number];

export interface RbacUser {
  roles?: { id?: number; name?: string }[];
  permissions?: string[] | Set<string>;
}

function permissionSet(user: RbacUser | null | undefined): Set<string> {
  const raw = user?.permissions;
  if (!raw) return new Set();
  if (raw instanceof Set) return raw;
  return new Set(raw);
}

export function hasPermission(
  user: RbacUser | null | undefined,
  code: string
): boolean {
  if (!user) return false;
  const upper = code.toUpperCase();
  if (permissionSet(user).has(upper)) return true;
  if (upper !== "ROLE_ADMIN" && permissionSet(user).has("ROLE_ADMIN")) return true;
  return user.roles?.some((r) => {
    const n = (r.name ?? "").toUpperCase();
    return n === "ADMIN" || n === "ROLE_ADMIN";
  }) ?? false;
}

export function hasAnyPermission(
  user: RbacUser | null | undefined,
  codes: string[]
): boolean {
  return codes.some((c) => hasPermission(user, c));
}

export function hasStaffRole(user: RbacUser | null | undefined): boolean {
  if (!user?.roles?.length) return false;
  return user.roles.some((r) =>
    STAFF_ROLE_NAMES.includes((r.name ?? "").toUpperCase() as StaffRoleName)
  );
}

/** Có quyền vào khu vực quản trị (admin / warehouse / sales). */
export function canAccessAdminPanel(user: RbacUser | null | undefined): boolean {
  if (!user) return false;
  if (hasStaffRole(user)) return true;
  const adminCodes = [
    "PRODUCT_MANAGE",
    "ORDER_MANAGE",
    "ORDER_VIEW_ALL",
    "USER_MANAGE",
    "STOCK_IMPORT",
    "REPORT_REVENUE",
    "REPORT_SALES",
    "WARRANTY_MANAGE",
    "SYSTEM_CONFIG_MANAGE",
    "ROLE_PERM_EDIT",
    "ROLE_ADMIN",
  ];
  return hasAnyPermission(user, adminCodes);
}

export function isAdminUser(user: RbacUser | null | undefined): boolean {
  if (!user?.roles?.length) return false;
  return user.roles.some((r) => {
    const n = (r.name ?? "").toUpperCase();
    return n === "ADMIN" || n === "ROLE_ADMIN";
  });
}
