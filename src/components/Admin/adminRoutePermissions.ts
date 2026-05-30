import {
  contentLinks,
  customerLinks,
  inventoryLinks,
  orderLinks,
  overviewLinks,
  salesCatalogLinks,
  supportLinks,
  systemLinks,
  type NavLink,
} from "@/components/Admin/adminNavConfig";

/** Quyền tối thiểu để mở một route admin (bất kỳ quyền nào trong danh sách). */
export const ADMIN_ROUTE_PERMISSIONS: Record<string, string[]> = {
  "/admin": [],
  "/admin/analytics": ["REPORT_REVENUE", "REPORT_SALES"],
  "/admin/orders": ["ORDER_VIEW_ALL", "ORDER_MANAGE"],
  "/admin/products": ["PRODUCT_MANAGE", "PRODUCT_CREATE", "PRODUCT_UPDATE"],
  "/admin/products/new": ["PRODUCT_MANAGE", "PRODUCT_CREATE"],
  "/admin/categories": ["PRODUCT_MANAGE", "PRODUCT_CREATE", "PRODUCT_UPDATE"],
  "/admin/producers": ["PRODUCT_MANAGE", "PRODUCT_CREATE", "PRODUCT_UPDATE"],
  "/admin/attributes": ["PRODUCT_MANAGE", "PRODUCT_CREATE", "PRODUCT_UPDATE"],
  "/admin/inventory": ["STOCK_IMPORT", "INVENTORY_STAT"],
  "/admin/coupons": ["PRODUCT_MANAGE"],
  "/admin/imei": ["IMEI_MANAGE"],
  "/admin/return": ["STOCK_RETURN"],
  "/admin/customers": ["USER_MANAGE", "CUSTOMER_VIEW"],
  "/admin/reviews": ["PRODUCT_MANAGE"],
  "/admin/banners": ["ROLE_ADMIN"],
  "/admin/posts": ["ROLE_ADMIN"],
  "/admin/settings": ["SYSTEM_CONFIG_MANAGE", "AI_MODEL_TRAIN"],
  "/admin/warranty": ["WARRANTY_MANAGE"],
  "/admin/users": ["USER_MANAGE", "ROLE_PERM_EDIT"],
};

function collectNavLinks(): NavLink[] {
  return [
    ...overviewLinks,
    ...orderLinks,
    ...salesCatalogLinks,
    ...inventoryLinks,
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
