import {
  contentLinks,
  customerLinks,
  inventoryLinks,
  orderLinks,
  overviewLinks,
  procurementLinks,
  salesCatalogLinks,
  supportLinks,
  systemLinks,
  warehouseCatalogLinks,
  warehouseOpsLinks,
  warehouseWarrantyLinks,
  type NavLink,
} from "@/components/Admin/adminNavConfig";

/** Quyền tối thiểu để mở một route admin (bất kỳ quyền nào trong danh sách). */
export const ADMIN_ROUTE_PERMISSIONS: Record<string, string[]> = {
  "/admin": [],
  "/admin/analytics": ["REPORT_REVENUE", "REPORT_SALES"],
  "/admin/orders": ["ORDER_VIEW_ALL", "ORDER_MANAGE"],
  "/admin/warehouse-fulfillment": ["ORDER_VIEW_ALL", "ORDER_ASSIGN_SHIPPING"],
  "/admin/purchase-orders": ["STOCK_IMPORT"],
  "/admin/procurement": ["PRODUCT_MANAGE", "STOCK_IMPORT"],
  "/admin/po-management": ["PRODUCT_MANAGE", "ROLE_ADMIN"],
  "/admin/inventory-audit-approval": ["PRODUCT_MANAGE", "ROLE_ADMIN"],
  "/admin/inventory-audit": ["INVENTORY_STAT", "STOCK_IMPORT"],
  "/admin/warranty-inbound": ["WARRANTY_MANAGE", "STOCK_IMPORT", "IMEI_MANAGE"],
  "/admin/products": ["PRODUCT_MANAGE", "PRODUCT_CREATE", "PRODUCT_UPDATE"],
  "/admin/products/new": ["PRODUCT_MANAGE", "PRODUCT_CREATE"],
  "/admin/categories": ["PRODUCT_MANAGE", "PRODUCT_CREATE", "PRODUCT_UPDATE"],
  "/admin/producers": ["PRODUCT_MANAGE", "PRODUCT_CREATE", "PRODUCT_UPDATE"],
  "/admin/attributes": ["PRODUCT_MANAGE", "PRODUCT_CREATE", "PRODUCT_UPDATE"],
  "/admin/inventory": ["STOCK_IMPORT", "INVENTORY_STAT", "STOCK_RETURN"],
  "/admin/coupons": ["PRODUCT_MANAGE"],
  "/admin/imei": ["IMEI_MANAGE", "STOCK_IMPORT"],
  "/admin/return": ["STOCK_RETURN", "ORDER_MANAGE", "ROLE_ADMIN"],
  "/admin/customers": ["USER_MANAGE", "CUSTOMER_VIEW"],
  "/admin/reviews": ["REVIEW_MANAGE", "REVIEW_REPLY", "PRODUCT_MANAGE", "WARRANTY_MANAGE"],
  "/admin/banners": ["ROLE_ADMIN"],
  "/admin/posts": ["ROLE_ADMIN"],
  "/admin/settings": ["SYSTEM_CONFIG_MANAGE", "AI_MODEL_TRAIN"],
  "/admin/warranty": ["WARRANTY_MANAGE"],
  "/admin/users": ["USER_MANAGE", "ROLE_PERM_EDIT"],
};

/** Route chỉ Admin/Sales — warehouse-only bị redirect. */
export const WAREHOUSE_EXCLUDED_PATHS = [
  "/admin/orders",
  "/admin/analytics",
  "/admin/customers",
  "/admin/reviews",
  "/admin/banners",
  "/admin/posts",
  "/admin/settings",
  "/admin/users",
  "/admin/coupons",
  "/admin/warranty",
  "/admin/warranty-inbound",
  "/admin/products",
  "/admin/categories",
  "/admin/attributes",
  "/admin/producers",
  "/admin/procurement",
  "/admin/po-management",
  "/admin/inventory-audit-approval",
] as const;

function collectNavLinks(): NavLink[] {
  return [
    ...overviewLinks,
    ...orderLinks,
    ...salesCatalogLinks,
    ...inventoryLinks,
    ...procurementLinks,
    ...warehouseOpsLinks,
    ...warehouseCatalogLinks,
    ...warehouseWarrantyLinks,
    ...supportLinks,
    ...customerLinks,
    ...contentLinks,
    ...systemLinks,
  ];
}

/** Tìm quyền cho path (khớp prefix dài nhất). */
export function permissionsForAdminPath(pathname: string): string[] | null {
  if (pathname.startsWith("/admin/products/") && pathname.includes("/edit")) {
    return ADMIN_ROUTE_PERMISSIONS["/admin/products"];
  }
  if (pathname.startsWith("/admin/posts/")) {
    return ADMIN_ROUTE_PERMISSIONS["/admin/posts"];
  }

  const entries = Object.entries(ADMIN_ROUTE_PERMISSIONS).sort(
    (a, b) => b[0].length - a[0].length
  );
  for (const [route, perms] of entries) {
    if (route === "/admin") {
      if (pathname === "/admin") return perms;
      continue;
    }
    if (pathname === route || pathname.startsWith(`${route}/`)) {
      return perms;
    }
  }

  const nav = collectNavLinks().find(
    (l) =>
      l.href !== "/admin" &&
      (pathname === l.href || pathname.startsWith(`${l.href}/`))
  );
  return nav?.permissions ?? null;
}
