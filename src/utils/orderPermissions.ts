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

/** Nhân viên kho thuần: chỉ fulfillment sau khi Sales xác nhận. */
function isWarehouseFulfillmentUser(user: RbacUser | null | undefined): boolean {
  return canAssignShipping(user) && !canConfirmOrder(user) && !hasPermission(user, "ORDER_MANAGE");
}

/** Trạng thái tiếp theo theo vai trò. */
export function allowedNextStatuses(
  current: string,
  user: RbacUser | null | undefined
): string[] {
  const cur = current.toUpperCase();
  const options: string[] = [];

  if (isWarehouseFulfillmentUser(user)) {
    if (cur === "CONFIRMED") options.push("PROCESSING");
    if (cur === "PROCESSING") {
      options.push("SHIPPING");
      if (canCancelOrder(user)) options.push("CANCELLED");
    }
    if (cur === "SHIPPING") {
      if (canUpdateTracking(user)) options.push("DELIVERED");
      if (canCancelOrder(user)) options.push("CANCELLED");
    }
    if (cur === "DELIVERED" && canUpdateTracking(user)) options.push("COMPLETED");
    return options;
  }

  if (cur === "PENDING" && canConfirmOrder(user)) {
    options.push("CONFIRMED");
  }
  if (cur === "CONFIRMED" && canAssignShipping(user)) {
    options.push("PROCESSING", "SHIPPING");
  }
  if (cur === "PROCESSING" && canAssignShipping(user)) {
    options.push("SHIPPING");
  }
  if (cur === "SHIPPING" && canUpdateTracking(user)) {
    options.push("DELIVERED");
  }
  if (cur === "DELIVERED" && canUpdateTracking(user)) {
    options.push("COMPLETED");
  }
  if (
    canCancelOrder(user) &&
    cur !== "CANCELLED" &&
    cur !== "DELIVERED" &&
    cur !== "COMPLETED"
  ) {
    options.push("CANCELLED");
  }
  return Array.from(new Set(options));
}

export function isSalesStaff(user: RbacUser | null | undefined): boolean {
  return user?.roles?.some((r) => (r.name ?? "").toUpperCase() === "SALES") ?? false;
}

export function hasSalesReport(user: RbacUser | null | undefined): boolean {
  return hasPermission(user, "REPORT_SALES");
}

export function canAccessFulfillmentQueue(user: RbacUser | null | undefined): boolean {
  return hasAnyPermission(user, ["ORDER_VIEW_ALL", "ORDER_ASSIGN_SHIPPING"]);
}
