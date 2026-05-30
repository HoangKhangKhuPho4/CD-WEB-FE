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
  { label: "Quản lý IMEI", href: "/admin/imei", permissions: ["IMEI_MANAGE"] },
  { label: "Trả hàng nhập kho", href: "/admin/return", permissions: ["STOCK_RETURN"] },
];

/** Menu kho — khớp 11 quyền WAREHOUSE trong DB (không coupon, không trả hàng). */
export const warehouseInventoryLinks: NavLink[] = [
  { label: "Sản phẩm", href: "/admin/products", permissions: ["PRODUCT_CREATE", "PRODUCT_UPDATE"] },
  { label: "Danh mục", href: "/admin/categories", permissions: ["PRODUCT_CREATE", "PRODUCT_UPDATE"] },
  { label: "Thương hiệu", href: "/admin/producers", permissions: ["PRODUCT_CREATE", "PRODUCT_UPDATE"] },
  { label: "Thuộc tính", href: "/admin/attributes", permissions: ["PRODUCT_CREATE", "PRODUCT_UPDATE"] },
  {
    label: "Nhập / Tồn kho",
    href: "/admin/inventory",
    permissions: ["STOCK_IMPORT", "INVENTORY_STAT"],
  },
  { label: "Quản lý IMEI", href: "/admin/imei", permissions: ["IMEI_MANAGE"] },
];

export const supportLinks: NavLink[] = [
  { label: "Quản lý phiếu bảo hành", href: "/admin/warranty", permissions: ["WARRANTY_MANAGE"] },
  {
    label: "Đánh giá sản phẩm",
    href: "/admin/reviews",
    permissions: ["PRODUCT_MANAGE"],
  },
];

/** Sub-nav / sidebar kho & sales — chỉ quản lý phiếu (không gồm đánh giá SP). */
export const warrantyTicketLinks: NavLink[] = [
  { label: "Quản lý phiếu bảo hành", href: "/admin/warranty", permissions: ["WARRANTY_MANAGE"] },
];

export const customerLinks: NavLink[] = [
  { label: "Khách hàng", href: "/admin/customers", permissions: ["USER_MANAGE", "CUSTOMER_VIEW"] },
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

/** Menu gọn cho WAREHOUSE — khớp thiết kế DB (11 quyền). */
const warehouseSectionDefs: NavSection[] = [
  { title: "Tổng quan", items: [{ label: "Tổng quan", href: "/admin" }] },
  { title: "Đơn hàng & Xuất kho", items: orderLinks },
  { title: "Sản phẩm & Kho", items: warehouseInventoryLinks },
  { title: "Phiếu bảo hành", items: warrantyTicketLinks },
];

/** Sub-nav catalog — menu kho gọn, admin đầy đủ. */
export function catalogSubNavLinks(user: RbacUser | null | undefined): NavLink[] {
  const isWarehouse =
    user?.roles?.some((r) => (r.name ?? "").toUpperCase() === "WAREHOUSE") ?? false;
  const isSales = user?.roles?.some((r) => (r.name ?? "").toUpperCase() === "SALES") ?? false;
  if (isWarehouse && !isSales) return warehouseInventoryLinks;
  return inventoryLinks;
}

export function matchNavHref(pathname: string, href: string) {
  if (href === "/admin") return pathname === "/admin";
  if (href.startsWith("/shop")) return false;
  return pathname === href || pathname.startsWith(`${href}/`);
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
