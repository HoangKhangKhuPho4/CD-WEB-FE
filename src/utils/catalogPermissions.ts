import { hasAnyPermission, hasPermission, type RbacUser } from "@/utils/rbac";

export function canCreateProduct(user: RbacUser | null | undefined): boolean {
  return hasAnyPermission(user, ["PRODUCT_MANAGE", "PRODUCT_CREATE"]);
}

export function canUpdateProduct(user: RbacUser | null | undefined): boolean {
  return hasAnyPermission(user, ["PRODUCT_MANAGE", "PRODUCT_UPDATE"]);
}

export function canDeleteProduct(user: RbacUser | null | undefined): boolean {
  return hasPermission(user, "PRODUCT_MANAGE");
}

export function canManageCoupons(user: RbacUser | null | undefined): boolean {
  return hasPermission(user, "PRODUCT_MANAGE");
}

export function canManageProducers(user: RbacUser | null | undefined): boolean {
  return hasAnyPermission(user, ["PRODUCT_MANAGE", "PRODUCT_CREATE", "PRODUCT_UPDATE"]);
}

export function canStockImport(user: RbacUser | null | undefined): boolean {
  return hasAnyPermission(user, ["STOCK_IMPORT", "ROLE_ADMIN"]);
}

export function canStockReturn(user: RbacUser | null | undefined): boolean {
  return hasAnyPermission(user, ["STOCK_RETURN", "ROLE_ADMIN"]);
}

export function canInventoryStat(user: RbacUser | null | undefined): boolean {
  return hasAnyPermission(user, ["INVENTORY_STAT", "ROLE_ADMIN"]);
}

export function canApproveInventoryAudit(user: RbacUser | null | undefined): boolean {
  return hasAnyPermission(user, ["PRODUCT_MANAGE", "ROLE_ADMIN"]);
}

export function canManageImei(user: RbacUser | null | undefined): boolean {
  return hasAnyPermission(user, ["IMEI_MANAGE", "ROLE_ADMIN"]);
}
