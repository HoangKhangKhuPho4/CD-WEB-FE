import {
  hasAnyPermission,
  hasPermission,
  isAdminUser,
  type RbacUser,
} from "@/utils/rbac";

export type NavLink = {
  label: string;
  href: string;
  /** Cần ít nhất một quyền trong danh sách (ADMIN bypass). */
  permissions?: string[];
  /** Ẩn mục nếu user có bất kỳ quyền nào (vd: ẩn tra cứu SP khi đã có quản lý SP admin). */
  hideIfPermissions?: string[];
  /** Mở tab mới (storefront). */
  external?: boolean;
};

export type NavSection = {
  title: string;
  items: NavLink[];
};

// ─── Liên kết theo module (permissions khớp RbacDataInitializer) ─────────

export const overviewLinks: NavLink[] = [
  { label: "Tổng quan", href: "/admin" },
  {
    label: "Thống kê doanh thu",
    href: "/admin/analytics",
    permissions: ["REPORT_REVENUE"],
  },
  {
    label: "Báo cáo bán hàng",
    href: "/admin/analytics",
    permissions: ["REPORT_SALES"],
    hideIfPermissions: ["REPORT_REVENUE"],
  },
];

export const orderLinks: NavLink[] = [
  {
    label: "Quản lý đơn hàng",
    href: "/admin/orders",
    permissions: ["ORDER_VIEW_ALL", "ORDER_MANAGE"],
  },
];

export const salesCatalogLinks: NavLink[] = [
  {
    label: "Tra cứu sản phẩm",
    href: "/shop-with-sidebar",
    permissions: ["PRODUCT_VIEW"],
    hideIfPermissions: ["PRODUCT_MANAGE", "PRODUCT_CREATE", "PRODUCT_UPDATE"],
    external: true,
  },
];

/** Quyền quản lý catalog — ADMIN (PRODUCT_MANAGE) hoặc kho (CREATE/UPDATE). */
const catalogManagePermissions = ["PRODUCT_MANAGE", "PRODUCT_CREATE", "PRODUCT_UPDATE"];

/** Tab xử lý hàng hoàn — trạm kiểm định QC. */
export const INVENTORY_RETURN_HREF = "/admin/return";

/** Thu mua & nhập hàng từ NCC — nhóm menu sidebar Admin. */
export const procurementLinks: NavLink[] = [
  {
    label: "Quản lý mua hàng",
    href: "/admin/procurement",
    permissions: ["PRODUCT_MANAGE", "STOCK_IMPORT"],
  },
  {
    label: "Duyệt chứng từ",
    href: "/admin/po-management",
    permissions: ["PRODUCT_MANAGE", "ROLE_ADMIN"],
  },
  {
    label: "Duyệt phiếu kiểm kê",
    href: "/admin/inventory-audit-approval",
    permissions: ["PRODUCT_MANAGE", "ROLE_ADMIN"],
  },
  {
    label: "Đơn mua hàng",
    href: "/admin/purchase-orders",
    permissions: ["STOCK_IMPORT"],
  },
];

export const inventoryLinks: NavLink[] = [
  {
    label: "Sản phẩm",
    href: "/admin/products",
    permissions: catalogManagePermissions,
  },
  { label: "Danh mục", href: "/admin/categories", permissions: catalogManagePermissions },
  { label: "Thương hiệu", href: "/admin/producers", permissions: catalogManagePermissions },
  { label: "Thuộc tính", href: "/admin/attributes", permissions: catalogManagePermissions },
  {
    label: "Nhập / Tồn kho",
    href: "/admin/inventory",
    permissions: ["STOCK_IMPORT", "INVENTORY_STAT"],
  },
  { label: "Mã giảm giá", href: "/admin/coupons", permissions: ["PRODUCT_MANAGE"] },
  { label: "Quản lý IMEI", href: "/admin/imei", permissions: ["IMEI_MANAGE", "STOCK_IMPORT"] },
  {
    label: "Xử lý hàng hoàn",
    href: INVENTORY_RETURN_HREF,
    permissions: ["STOCK_RETURN"],
  },
  ...procurementLinks,
];

/** Menu kho — khớp quyền WAREHOUSE trong cd_web.sql (11 quyền). */
export const warehouseOpsLinks: NavLink[] = [
  {
    label: "Đơn cần xuất",
    href: "/admin/warehouse-fulfillment",
    permissions: ["ORDER_VIEW_ALL", "ORDER_ASSIGN_SHIPPING"],
  },
  {
    label: "Đơn mua hàng",
    href: "/admin/purchase-orders",
    permissions: ["STOCK_IMPORT"],
  },
  {
    label: "Nhập / Tồn kho",
    href: "/admin/inventory",
    permissions: ["STOCK_IMPORT", "INVENTORY_STAT"],
  },
  {
    label: "Kiểm kê kho",
    href: "/admin/inventory-audit",
    permissions: ["INVENTORY_STAT", "STOCK_IMPORT"],
  },
  { label: "Quản lý IMEI", href: "/admin/imei", permissions: ["IMEI_MANAGE", "STOCK_IMPORT"] },
  {
    label: "Xử lý hàng hoàn",
    href: INVENTORY_RETURN_HREF,
    permissions: ["STOCK_RETURN"],
  },
];

/** @deprecated NV kho không quản lý catalog — giữ export rỗng để tương thích import cũ. */
export const warehouseCatalogLinks: NavLink[] = [];

/** @deprecated NV kho không quản lý phiếu bảo hành — giữ export rỗng tương thích import cũ. */
export const warehouseWarrantyLinks: NavLink[] = [];

export function procurementSubNavLinks(user: RbacUser | null | undefined): NavLink[] {
  return filterNavLinks(user, procurementLinks);
}

/** Sub-nav trang kho — lọc theo user. */
export function warehouseSubNavLinks(user: RbacUser | null | undefined): NavLink[] {
  return filterNavLinks(user, warehouseOpsLinks);
}

/** @deprecated dùng warehouseCatalogLinks */
export const warehouseInventoryLinks: NavLink[] = warehouseCatalogLinks;

export const supportLinks: NavLink[] = [
  { label: "Quản lý phiếu bảo hành", href: "/admin/warranty", permissions: ["WARRANTY_MANAGE"] },
];

/** Sub-nav / sidebar kho & sales — chỉ quản lý phiếu (không gồm đánh giá SP). */
export const warrantyTicketLinks: NavLink[] = [
  { label: "Quản lý phiếu bảo hành", href: "/admin/warranty", permissions: ["WARRANTY_MANAGE"] },
];

export const customerLinks: NavLink[] = [
  { label: "Khách hàng", href: "/admin/customers", permissions: ["USER_MANAGE", "CUSTOMER_VIEW"] },
  {
    label: "Quản lý đánh giá",
    href: "/admin/reviews",
    permissions: ["REVIEW_MANAGE", "REVIEW_REPLY", "PRODUCT_MANAGE", "WARRANTY_MANAGE"],
  },
];

export const contentLinks: NavLink[] = [
  { label: "Banner", href: "/admin/banners", permissions: ["ROLE_ADMIN"] },
  { label: "Bài viết", href: "/admin/posts", permissions: ["ROLE_ADMIN"] },
];

export const systemLinks: NavLink[] = [
  {
    label: "Cấu hình hệ thống",
    href: "/admin/settings",
    permissions: ["SYSTEM_CONFIG_MANAGE", "AI_MODEL_TRAIN"],
  },
  {
    label: "Nhân viên & Phân quyền",
    href: "/admin/users",
    permissions: ["USER_MANAGE", "ROLE_PERM_EDIT"],
  },
];

/** Các nhóm menu sidebar — lọc theo permission khi render. */
export const sidebarSectionDefs: NavSection[] = [
  { title: "Tổng quan", items: overviewLinks },
  { title: "Đơn hàng", items: orderLinks },
  /** Admin: tra cứu SP (Sales). Không lặp orderLinks — đã có ở nhóm Đơn hàng. */
  { title: "Bán hàng & Tư vấn", items: salesCatalogLinks },
  { title: "Sản phẩm & Kho", items: inventoryLinks },
  { title: "Hỗ trợ khách hàng", items: supportLinks },
  { title: "Khách hàng", items: customerLinks },
  { title: "Nội dung website", items: contentLinks },
  { title: "Hệ thống", items: systemLinks },
];

/** Menu gọn cho SALES — tránh trùng section. */
const salesSectionDefs: NavSection[] = [
  {
    title: "Tổng quan",
    items: [
      { label: "Tổng quan", href: "/admin" },
      {
        label: "Báo cáo bán hàng",
        href: "/admin/analytics",
        permissions: ["REPORT_SALES"],
      },
    ],
  },
  {
    title: "Bán hàng",
    items: [...orderLinks, ...salesCatalogLinks],
  },
  { title: "Phiếu bảo hành", items: warrantyTicketLinks },
];

/** Menu gọn cho WAREHOUSE — theo mô hình electro-store + quyền cd_web.sql. */
const warehouseSectionDefs: NavSection[] = [
  { title: "Tổng quan", items: [{ label: "Tổng quan kho", href: "/admin" }] },
  { title: "Xuất kho & Nhập kho", items: warehouseOpsLinks },
];

/** Sub-nav catalog — menu kho gọn, admin đầy đủ. */
export function catalogSubNavLinks(user: RbacUser | null | undefined): NavLink[] {
  const isWarehouse =
    user?.roles?.some((r) => (r.name ?? "").toUpperCase() === "WAREHOUSE") ?? false;
  const isSales = user?.roles?.some((r) => (r.name ?? "").toUpperCase() === "SALES") ?? false;
  if (isWarehouse && !isSales) return warehouseOpsLinks;
  return inventoryLinks;
}

export function matchNavHref(pathname: string, href: string) {
  const baseHref = href.split("?")[0];
  if (baseHref === "/admin") return pathname === "/admin";
  if (baseHref.startsWith("/shop")) return false;
  return pathname === baseHref || pathname.startsWith(`${baseHref}/`);
}

export function filterNavLinks(user: RbacUser | null | undefined, items: NavLink[]): NavLink[] {
  return items.filter((item) => {
    if (item.hideIfPermissions?.length && hasAnyPermission(user, item.hideIfPermissions)) {
      return false;
    }
    if (!item.permissions?.length) return true;
    return hasAnyPermission(user, item.permissions);
  });
}

/** Sub-nav / tab: chỉ label + href sau khi lọc quyền. */
export function navLinksForUser(
  user: RbacUser | null | undefined,
  items: NavLink[]
): { label: string; href: string }[] {
  return filterNavLinks(user, items).map(({ label, href }) => ({ label, href }));
}

function dedupeNavItems(items: NavLink[]): NavLink[] {
  const seen = new Set<string>();
  return items.filter((item) => {
    const key = `${item.href}|${item.label}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function resolveSectionDefs(user: RbacUser | null | undefined): NavSection[] {
  if (isAdminUser(user)) return sidebarSectionDefs;

  const isSales = user?.roles?.some((r) => (r.name ?? "").toUpperCase() === "SALES") ?? false;
  const isWarehouse =
    user?.roles?.some((r) => (r.name ?? "").toUpperCase() === "WAREHOUSE") ?? false;

  if (isSales && !isWarehouse) return salesSectionDefs;
  if (isWarehouse && !isSales) return warehouseSectionDefs;

  return sidebarSectionDefs;
}

/** Sidebar sections sau khi lọc theo quyền user. */
export function buildSidebarSections(user: RbacUser | null | undefined): NavSection[] {
  return resolveSectionDefs(user)
    .map((section) => ({
      ...section,
      items: dedupeNavItems(filterNavLinks(user, section.items)),
    }))
    .filter((section) => section.items.length > 0);
}

export function getStaffPortalSubtitle(user: RbacUser | null | undefined): string {
  if (isAdminUser(user)) return "Quản trị viên";
  if (user?.roles?.some((r) => (r.name ?? "").toUpperCase() === "SALES")) {
    return "Nhân viên bán hàng";
  }
  if (user?.roles?.some((r) => (r.name ?? "").toUpperCase() === "WAREHOUSE")) {
    return "Nhân viên kho";
  }
  if (hasPermission(user, "REPORT_SALES")) return "Nhân viên bán hàng";
  if (hasAnyPermission(user, ["STOCK_IMPORT", "IMEI_MANAGE"])) return "Nhân viên kho";
  return "Nhân viên";
}

export function canAccessAdminSettings(user: RbacUser | null | undefined): boolean {
  return hasAnyPermission(user, ["SYSTEM_CONFIG_MANAGE", "AI_MODEL_TRAIN", "ROLE_ADMIN"]);
}

// Backward compat exports
export const salesLinks = orderLinks;
