import { hasAnyPermission, hasPermission, type RbacUser } from "@/utils/rbac";

export function canViewOrders(user: RbacUser | null | undefined): boolean {
  return hasAnyPermission(user, ["ORDER_MANAGE", "ORDER_VIEW_ALL"]);
}

export function canConfirmOrder(user: RbacUser | null | undefined): boolean {
  return hasAnyPermission(user, ["ORDER_MANAGE", "ORDER_CONFIRM"]);
}

export function canCancelOrder(user: RbacUser | null | undefined): boolean {
  return hasAnyPermission(user, ["ORDER_MANAGE", "ORDER_CANCEL"]);
}

export function canAssignShipping(user: RbacUser | null | undefined): boolean {
  return hasAnyPermission(user, ["ORDER_MANAGE", "ORDER_ASSIGN_SHIPPING"]);
}

export function canUpdateTracking(user: RbacUser | null | undefined): boolean {
  return hasAnyPermission(user, ["ORDER_MANAGE", "ORDER_TRACKING_UPDATE"]);
}

export function canEditTracking(user: RbacUser | null | undefined): boolean {
  return canAssignShipping(user) || canUpdateTracking(user);
}

export function canAssignImei(user: RbacUser | null | undefined): boolean {
  return hasAnyPermission(user, ["ORDER_MANAGE", "IMEI_MANAGE"]);
}

export function canUpdateOrderStatus(user: RbacUser | null | undefined): boolean {
  return (
    canConfirmOrder(user) ||
    canCancelOrder(user) ||
    canAssignShipping(user) ||
    canUpdateTracking(user)
  );
}

/** Trạng thái tiếp theo — PENDING→…→DELIVERED→COMPLETED (+ CANCELLED). */
export function allowedNextStatuses(
  current: string,
  user: RbacUser | null | undefined
): string[] {
  const cur = current.toUpperCase();
  const options: string[] = [];

  if (cur === "PENDING" && canConfirmOrder(user)) {
    options.push("CONFIRMED");
  }
  if ((cur === "CONFIRMED" || cur === "PROCESSING") && canAssignShipping(user)) {
    options.push("SHIPPING");
  }
  if (cur === "SHIPPING" && canUpdateTracking(user)) {
    options.push("DELIVERED");
  }
  if (cur === "DELIVERED" && canUpdateTracking(user)) {
    options.push("COMPLETED");
  }
  if (canCancelOrder(user) && cur !== "CANCELLED" && cur !== "DELIVERED") {
    options.push("CANCELLED");
  }
  return options;
}

export function isSalesStaff(user: RbacUser | null | undefined): boolean {
  return (
    user?.roles?.some((r) => (r.name ?? "").toUpperCase() === "SALES") ?? false
  );
}

export function hasSalesReport(user: RbacUser | null | undefined): boolean {
  return hasPermission(user, "REPORT_SALES");
}
