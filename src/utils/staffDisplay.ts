import type { RbacUser } from "@/utils/rbac";
import { isAdminUser } from "@/utils/rbac";

type AuthProfile = RbacUser & {
  name?: string | null;
  username?: string | null;
};

export function getUserDisplayName(user: AuthProfile | null | undefined): string {
  return user?.name?.trim() || user?.username?.trim() || "Nhân viên";
}

/** Chữ cái đại diện — ưu tiên họ + tên (vd: Nguyễn Văn A → NA). */
export function getUserInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0][0] ?? ""}${parts[parts.length - 1][0] ?? ""}`.toUpperCase();
  }
  return name.slice(0, 2).toUpperCase() || "NV";
}

export function getStaffRoleLabel(user: RbacUser | null | undefined): string {
  if (isAdminUser(user)) return "Quản trị viên";
  const role = user?.roles?.[0]?.name?.replace(/^ROLE_/, "").toUpperCase();
  switch (role) {
    case "WAREHOUSE":
      return "Nhân viên kho";
    case "SALES":
      return "Nhân viên bán hàng";
    case "ADMIN":
      return "Quản trị viên";
    case "CUSTOMER":
      return "Khách hàng";
    default:
      return role ? role.charAt(0) + role.slice(1).toLowerCase() : "Nhân viên";
  }
}

const AVATAR_GRADIENTS: Record<string, string> = {
  ADMIN: "from-[#1C274C] to-[#3C50E0]",
  WAREHOUSE: "from-[#0EA5E9] to-[#3C50E0]",
  SALES: "from-[#8B5CF6] to-[#3C50E0]",
  DEFAULT: "from-[#3C50E0] to-[#5475E5]",
};

export function getStaffAvatarGradient(user: RbacUser | null | undefined): string {
  if (isAdminUser(user)) return AVATAR_GRADIENTS.ADMIN;
  const role = user?.roles?.[0]?.name?.replace(/^ROLE_/, "").toUpperCase();
  if (role && AVATAR_GRADIENTS[role]) return AVATAR_GRADIENTS[role];
  return AVATAR_GRADIENTS.DEFAULT;
}
