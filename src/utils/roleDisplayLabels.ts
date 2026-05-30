/** Nhãn tiếng Việt cho mã nhóm quyền RBAC. */
export const PERMISSION_GROUP_LABELS: Record<string, string> = {
  ORDER: "Đơn hàng",
  PRODUCT: "Sản phẩm",
  STOCK: "Kho hàng",
  IMEI: "IMEI / Thiết bị",
  INVENTORY: "Tồn kho",
  REPORT: "Báo cáo",
  USER: "Người dùng",
  ROLE: "Vai trò & quyền",
  WARRANTY: "Bảo hành",
  SYSTEM: "Hệ thống",
  QR: "Mã QR",
  AI: "Trí tuệ nhân tạo",
  OTHER: "Khác",
};

export function permissionGroupLabel(codePrefix: string): string {
  return PERMISSION_GROUP_LABELS[codePrefix.toUpperCase()] ?? codePrefix;
}

export function staffRoleDisplayName(name?: string): string {
  const n = (name ?? "").toUpperCase();
  if (n === "ADMIN" || n === "ROLE_ADMIN") return "Quản trị viên";
  if (n === "WAREHOUSE") return "Nhân viên kho";
  if (n === "SALES") return "Nhân viên bán hàng";
  return name ?? "Nhân viên";
}
