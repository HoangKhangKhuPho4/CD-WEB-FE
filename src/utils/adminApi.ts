import api, { type ApiResponse, type PageResponse } from "./api";
import { canAccessAdminPanel } from "@/utils/rbac";
import type { PermissionItem, RoleDetail } from "@/types/rbac";

// ─── Statistics (BE trả DTO trực tiếp, không bọc ApiResponse) ─────────────

export interface OverviewStatistics {
  totalRevenue: number;
  totalOrders: number;
  totalCustomers: number;
  totalProductsSold: number;
  pendingOrders: number;
  revenueGrowthPercent?: number;
  orderGrowthPercent?: number;
  customerGrowthPercent?: number;
}

export interface StaffOverviewStatistics {
  pendingOrders: number;
  confirmedOrders: number;
  shippingOrders: number;
  ordersToday: number;
  lowStockVariants: number;
  customerAccounts: number;
}

export interface RevenueChartData {
  period: string;
  dataPoints: { label: string; revenue: number; orders: number }[];
  totalRevenue: number;
  averageRevenue: number;
}

export interface OrderStatusStats {
  totalOrders: number;
  statusBreakdown: {
    status: string;
    label: string;
    count: number;
    percentage: number;
    color: string;
  }[];
}

export interface TopProductStat {
  rank?: number;
  productId?: number;
  productName?: string;
  variantName?: string;
  categoryName?: string;
  imageUrl?: string;
  quantitySold?: number;
  revenue?: number;
  currentStock?: number;
  lowStockThreshold?: number;
  status?: string;
}

export interface TopProductStats {
  type: string;
  products: TopProductStat[];
}

export interface RecentOrdersData {
  recentOrders: {
    orderId: number;
    orderCode: string;
    customerName: string;
    totalAmount: number;
    status: string;
    paymentMethod: string;
    orderDate: string;
    itemCount?: number;
  }[];
}

export interface PaymentMethodStats {
  paymentStats: {
    method: string;
    label: string;
    orderCount: number;
    totalAmount: number;
    percentage: number;
    color?: string;
  }[];
}

const stats = {
  overview: () => api.get<OverviewStatistics>("/admin/statistics/overview"),
  staffOverview: () =>
    api.get<StaffOverviewStatistics>("/admin/statistics/staff-overview"),
  revenueChart: (period = "month") =>
    api.get<RevenueChartData>("/admin/statistics/revenue/chart", { params: { period } }),
  orderStatus: () => api.get<OrderStatusStats>("/admin/statistics/orders/by-status"),
  topProducts: (type: "best-selling" | "low-stock", limit = 10) =>
    api.get<TopProductStats>("/admin/statistics/top-products", { params: { type, limit } }),
  recentOrders: (limit = 10) =>
    api.get<RecentOrdersData>("/admin/statistics/orders/recent", { params: { limit } }),
  paymentMethods: () => api.get<PaymentMethodStats>("/admin/statistics/payment-methods"),
};

// ─── System config ───────────────────────────────────────────────────────

export interface GeneralSettings {
  defaultShippingFee: number;
  freeShippingThreshold: number;
  codEnabled: boolean;
  vnpayEnabled: boolean;
  momoEnabled: boolean;
  zalopayEnabled: boolean;
  supportEmail: string;
  supportHotline: string;
  siteFooterText?: string;
  platformLanguage: string;
  updatedAt?: string;
}

export interface AiConfig {
  recommendationWeight: number;
  svdRank: number;
  svdEpochs: number;
  cacheTtlSeconds: number;
  aiServiceBaseUrl: string;
  retrainStatus: string;
  retrainMessage?: string;
  lastRetrainAt?: string;
  updatedAt?: string;
}

export interface RetrainResponse {
  status: string;
  message: string;
  startedAt?: string;
}

export const systemConfigApi = {
  getGeneral: () =>
    api.get<ApiResponse<GeneralSettings>>("/admin/system/general"),
  updateGeneral: (body: GeneralSettings) =>
    api.put<ApiResponse<GeneralSettings>>("/admin/system/general", body),
  getAi: () => api.get<ApiResponse<AiConfig>>("/admin/system/ai-config"),
  updateAi: (body: Omit<AiConfig, "retrainStatus" | "retrainMessage" | "lastRetrainAt" | "updatedAt">) =>
    api.put<ApiResponse<AiConfig>>("/admin/system/ai-config", body),
  retrain: () => api.post<ApiResponse<RetrainResponse>>("/admin/system/ai-retrain"),
};

// ─── Admin products ──────────────────────────────────────────────────────

export interface AdminProductListItem {
  id: number;
  name: string;
  imageUrl?: string;
  basePrice: number;
  totalQuantity: number;
  status: string;
  isFeatured?: boolean;
  productType?: { id: number; name: string };
  producer?: { id: number; name: string };
  createdAt?: string;
}

export interface AdminProductDetail extends AdminProductListItem {
  description?: string;
  variants?: {
    id: number;
    skuCode?: string;
    variantName?: string;
    price?: number;
    stockQuantity?: number;
    isActive?: boolean;
  }[];
  images?: { id: number; linkImage?: string }[];
}

export const adminProductApi = {
  list: (params?: {
    page?: number;
    size?: number;
    keyword?: string;
    isActive?: boolean;
    productTypeId?: number;
    producerId?: number;
  }) =>
    api.get<ApiResponse<PageResponse<AdminProductListItem>>>("/admin/products", { params }),
  get: (id: number) =>
    api.get<ApiResponse<AdminProductDetail>>(`/admin/products/${id}`),
  create: (body: {
    name: string;
    price: number;
    quantity: number;
    detail?: string;
    status?: string;
    productTypeId: number;
    producerId: number;
    isFeatured?: boolean;
  }) => api.post<ApiResponse<AdminProductDetail>>("/admin/products", body),
  update: (
    id: number,
    body: Partial<{
      name: string;
      price: number;
      quantity: number;
      detail: string;
      status: string;
      productTypeId: number;
      producerId: number;
      isFeatured: boolean;
    }>
  ) => api.put<ApiResponse<AdminProductDetail>>(`/admin/products/${id}`, body),
  remove: (id: number) => api.delete<ApiResponse<void>>(`/admin/products/${id}`),
  toggle: (id: number) =>
    api.put<ApiResponse<AdminProductDetail>>(`/admin/products/${id}/toggle-status`),
  stats: () =>
    api.get<ApiResponse<{ total: number; active: number; inactive: number }>>(
      "/admin/products/stats"
    ),
};

// ─── Categories & producers ────────────────────────────────────────────────

export interface CategoryItem {
  id: number;
  name: string;
  code?: string;
  description?: string;
  isActive?: boolean;
  productCount?: number;
}

export interface ProducerItem {
  id: number;
  name: string;
  description?: string;
  logoUrl?: string;
  isActive?: boolean;
}

export const adminCategoryApi = {
  listAll: () => api.get<ApiResponse<CategoryItem[]>>("/admin/categories/all"),
  list: (params?: { page?: number; size?: number; keyword?: string }) =>
    api.get<ApiResponse<PageResponse<CategoryItem>>>("/admin/categories", { params }),
  create: (body: { name: string; code?: string; description?: string }) =>
    api.post<ApiResponse<CategoryItem>>("/admin/categories", body),
  update: (id: number, body: Partial<{ name: string; code?: string; description?: string }>) =>
    api.put<ApiResponse<CategoryItem>>(`/admin/categories/${id}`, body),
  remove: (id: number) => api.delete<ApiResponse<void>>(`/admin/categories/${id}`),
  toggle: (id: number) =>
    api.patch<ApiResponse<CategoryItem>>(`/admin/categories/${id}/toggle-status`),
};

export const adminProducerApi = {
  list: (params?: { page?: number; size?: number; keyword?: string }) =>
    api.get<ApiResponse<PageResponse<ProducerItem>>>("/admin/producers", { params }),
  listAll: () => api.get<ApiResponse<ProducerItem[]>>("/admin/producers/all"),
  create: (body: { name: string; description?: string }) =>
    api.post<ApiResponse<ProducerItem>>("/admin/producers", body),
  update: (id: number, body: Partial<{ name: string; description?: string }>) =>
    api.put<ApiResponse<ProducerItem>>(`/admin/producers/${id}`, body),
  remove: (id: number) => api.delete<ApiResponse<void>>(`/admin/producers/${id}`),
  toggle: (id: number) =>
    api.patch<ApiResponse<ProducerItem>>(`/admin/producers/${id}/toggle-status`),
};

// ─── Users ───────────────────────────────────────────────────────────────

export interface AdminUser {
  id: number;
  username: string;
  email: string;
  fullName?: string;
  name?: string;
  phone?: string;
  enabled?: boolean;
  createdAt?: string;
  roles?: { id: number; name: string }[];
}

export const adminCustomerApi = {
  list: (params?: { page?: number; size?: number; keyword?: string }) =>
    api.get<ApiResponse<PageResponse<AdminUser>>>("/admin/customers", { params }),
};

export const adminUserApi = {
  list: (params?: { page?: number; size?: number; keyword?: string }) =>
    api.get<ApiResponse<PageResponse<AdminUser>>>("/admin/users", { params }),
  create: (body: {
    username: string;
    email: string;
    password: string;
    fullName: string;
    phone?: string;
    roleId?: number;
  }) => api.post<ApiResponse<AdminUser>>("/admin/users", body),
  update: (
    id: number,
    body: Partial<{ fullName: string; phone?: string; address?: string }>
  ) => api.put<ApiResponse<AdminUser>>(`/admin/users/${id}`, body),
  toggleStatus: (id: number) =>
    api.put<ApiResponse<AdminUser>>(`/admin/users/${id}/status`),
  remove: (id: number) => api.delete<ApiResponse<void>>(`/admin/users/${id}`),
};

// ─── Reviews ─────────────────────────────────────────────────────────────

export interface AdminReview {
  id: number;
  productName?: string;
  user?: { id?: number; username?: string; name?: string };
  rating?: number;
  content?: string;
  replyContent?: string;
  isApproved?: boolean | null;
  createdAt?: string;
}

export const adminReviewApi = {
  list: (params?: { page?: number; size?: number }) =>
    api.get<ApiResponse<PageResponse<AdminReview>>>("/admin/reviews", { params }),
  updateStatus: (id: number, isApproved: boolean) =>
    api.put<ApiResponse<AdminReview>>(`/admin/reviews/${id}/status`, { isApproved }),
  reply: (id: number, replyContent: string) =>
    api.post<ApiResponse<AdminReview>>(`/admin/reviews/${id}/reply`, { replyContent }),
  remove: (id: number) => api.delete<ApiResponse<void>>(`/admin/reviews/${id}`),
};

// ─── Inventory ───────────────────────────────────────────────────────────

export interface InventoryStatRow {
  variantId: number;
  productName: string;
  variantName?: string;
  skuCode?: string;
  currentStock: number;
  lowStockThreshold?: number;
  status?: string;
}

export interface InventoryTransaction {
  id: number;
  transactionType: string;
  quantity: number;
  referenceType?: string;
  referenceId?: number;
  reason?: string;
  createdAt?: string;
  variantId?: number;
  variantName?: string;
  skuCode?: string;
  productItemId?: number;
  imei?: string;
  userId?: number;
  userName?: string;
}

export interface ProductItemRow {
  id: number;
  imei?: string;
  serialNumber?: string;
  productName: string;
  variantName?: string;
  skuCode?: string;
  status: string;
  createdAt?: string;
}

export interface VariantSearchHit {
  id: number;
  skuCode?: string;
  variantName?: string;
  productName?: string;
}

export const adminInventoryApi = {
  stats: (lowStockThreshold = 10) =>
    api.get<ApiResponse<InventoryStatRow[]>>("/admin/inventory/stats", {
      params: { lowStockThreshold },
    }),
  importStock: (body: {
    items: { variantId: number; quantity: number }[];
    supplier?: string;
    note?: string;
  }) => api.post<ApiResponse<string>>("/admin/inventory/import", body),
  returnStock: (body: { imei: string; reason?: string; isDefective?: boolean }) =>
    api.post<ApiResponse<string>>("/admin/inventory/return", body),
  transactions: () =>
    api.get<ApiResponse<InventoryTransaction[]>>("/admin/inventory/transactions"),
  searchVariants: (q: string) =>
    api.get<ApiResponse<VariantSearchHit[]>>("/admin/inventory/variants/search", {
      params: { q },
    }),
  addImei: (body: {
    variantId: number;
    imeis: string[];
    batchNumber?: string;
    note?: string;
  }) => api.post<ApiResponse<string>>("/admin/inventory/imei", body),
  uploadImeiExcel: (file: File) => {
    const form = new FormData();
    form.append("file", file);
    return api.post<ApiResponse<string>>("/admin/inventory/imei/upload-excel", form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
  listProductItems: (params?: { keyword?: string; page?: number; size?: number }) =>
    api.get<ApiResponse<PageResponse<ProductItemRow>>>("/admin/inventory/product-items", {
      params,
    }),
};

// ─── Coupons ─────────────────────────────────────────────────────────────

export interface AdminCoupon {
  id: number;
  code: string;
  name?: string;
  description?: string;
  discountType: string;
  discountValue: number;
  minOrderValue?: number;
  maxDiscountAmount?: number;
  usageLimit?: number;
  usedCount?: number;
  dateStart: string;
  dateEnd: string;
  isActive?: boolean;
}

export const adminCouponApi = {
  list: (params?: { page?: number; size?: number; keyword?: string; isActive?: boolean }) =>
    api.get<ApiResponse<PageResponse<AdminCoupon>>>("/admin/coupons", { params }),
  create: (body: {
    code: string;
    name?: string;
    description?: string;
    discountType: string;
    discountValue: number;
    minOrderValue?: number;
    maxDiscountAmount?: number;
    usageLimit?: number;
    dateStart: string;
    dateEnd: string;
    isActive?: boolean;
  }) => api.post<ApiResponse<AdminCoupon>>("/admin/coupons", body),
  update: (id: number, body: Partial<AdminCoupon>) =>
    api.put<ApiResponse<AdminCoupon>>(`/admin/coupons/${id}`, body),
  toggle: (id: number) => api.patch<ApiResponse<AdminCoupon>>(`/admin/coupons/${id}/toggle`),
  remove: (id: number) => api.delete<ApiResponse<void>>(`/admin/coupons/${id}`),
};

// ─── Attributes ──────────────────────────────────────────────────────────

export interface AdminAttribute {
  id: number;
  name: string;
}

export interface AdminAttributeValue {
  id: number;
  value: string;
  attributeId?: number;
  attributeName?: string;
}

export const adminAttributeApi = {
  list: () => api.get<ApiResponse<AdminAttribute[]>>("/admin/attributes"),
  create: (body: { name: string }) =>
    api.post<ApiResponse<AdminAttribute>>("/admin/attributes", body),
  update: (id: number, body: { name: string }) =>
    api.put<ApiResponse<AdminAttribute>>(`/admin/attributes/${id}`, body),
  remove: (id: number) => api.delete<ApiResponse<void>>(`/admin/attributes/${id}`),
  listValues: (attributeId: number) =>
    api.get<ApiResponse<AdminAttributeValue[]>>(`/admin/attributes/${attributeId}/values`),
  createValue: (body: { attributeId: number; value: string }) =>
    api.post<ApiResponse<AdminAttributeValue>>("/admin/attribute-values", body),
  updateValue: (id: number, body: { attributeId: number; value: string }) =>
    api.put<ApiResponse<AdminAttributeValue>>(`/admin/attribute-values/${id}`, body),
  removeValue: (id: number) => api.delete<ApiResponse<void>>(`/admin/attribute-values/${id}`),
};

// ─── Warranty ────────────────────────────────────────────────────────────

export interface WarrantyTicket {
  id: number;
  ticketCode?: string;
  imei?: string;
  serialNumber?: string;
  productName?: string;
  variantName?: string;
  customerName?: string;
  customerPhone?: string;
  issueDescription?: string;
  technicianNote?: string;
  status?: string;
  statusDisplay?: string;
  repairCost?: number;
  receivedAt?: string;
  resolvedAt?: string;
}

export const adminWarrantyApi = {
  list: (params?: { page?: number; size?: number; keyword?: string; status?: string }) =>
    api.get<ApiResponse<PageResponse<WarrantyTicket>>>("/admin/warranty/tickets", { params }),
  get: (id: number) =>
    api.get<ApiResponse<WarrantyTicket>>(`/admin/warranty/tickets/${id}`),
  create: (body: {
    imeiOrSerial: string;
    customerName: string;
    customerPhone: string;
    issueDescription: string;
  }) => api.post<ApiResponse<WarrantyTicket>>("/admin/warranty/tickets", body),
  updateStatus: (
    id: number,
    body: { status: string; technicianNote?: string; repairCost?: number }
  ) => api.put<ApiResponse<WarrantyTicket>>(`/admin/warranty/tickets/${id}/status`, body),
  updateDeviceStatus: (code: string, status: string) =>
    api.put<ApiResponse<unknown>>(`/admin/warranty/${encodeURIComponent(code)}/status`, null, {
      params: { status },
    }),
};

// ─── CMS (banners & posts) ───────────────────────────────────────────────

export interface CmsItem {
  id: number;
  title: string;
  subtitle?: string;
  linkUrl?: string;
  imageUrl?: string;
  body?: string;
  author?: string;
  active?: boolean;
  sortOrder?: number;
  createdAt?: string;
  updatedAt?: string;
}

export const adminCmsApi = {
  listBanners: () => api.get<ApiResponse<CmsItem[]>>("/admin/cms/banners"),
  createBanner: (body: Partial<CmsItem>) =>
    api.post<ApiResponse<CmsItem>>("/admin/cms/banners", body),
  updateBanner: (id: number, body: Partial<CmsItem>) =>
    api.put<ApiResponse<CmsItem>>(`/admin/cms/banners/${id}`, body),
  toggleBanner: (id: number) =>
    api.patch<ApiResponse<CmsItem>>(`/admin/cms/banners/${id}/toggle`),
  deleteBanner: (id: number) => api.delete<ApiResponse<void>>(`/admin/cms/banners/${id}`),
  listPosts: () => api.get<ApiResponse<CmsItem[]>>("/admin/cms/posts"),
  createPost: (body: Partial<CmsItem>) =>
    api.post<ApiResponse<CmsItem>>("/admin/cms/posts", body),
  updatePost: (id: number, body: Partial<CmsItem>) =>
    api.put<ApiResponse<CmsItem>>(`/admin/cms/posts/${id}`, body),
  togglePost: (id: number) =>
    api.patch<ApiResponse<CmsItem>>(`/admin/cms/posts/${id}/toggle`),
  deletePost: (id: number) => api.delete<ApiResponse<void>>(`/admin/cms/posts/${id}`),
};

// ─── Orders (adminOrderApi) ─────────────────────────────────────────────

export interface AdminOrderSummary {
  id: number;
  orderCode: string;
  status: string;
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  total: number;
  paymentMethod: string;
  paymentStatus?: string;
  createdAt: string;
}

export interface AdminOrderDetail extends AdminOrderSummary {
  shippingAddress?: string;
  trackingCode?: string;
  ghnOrderCode?: string;
  subtotal?: number;
  shippingFee?: number;
  discount?: number;
  items?: {
    orderDetailId?: number;
    productName: string;
    variantInfo?: string;
    imageUrl?: string;
    quantity: number;
    unitPrice: number;
    subtotal: number;
  }[];
  timeline?: { status: string; note?: string; changedBy?: string; createdAt?: string }[];
}

export const adminOrderApi = {
  list: (params?: {
    keyword?: string;
    status?: string;
    page?: number;
    size?: number;
    sortBy?: string;
    sortDir?: string;
  }) =>
    api.get<ApiResponse<PageResponse<AdminOrderSummary>>>("/admin/orders", { params }),
  detail: (id: number) =>
    api.get<ApiResponse<AdminOrderDetail>>(`/admin/orders/${id}`),
  updateStatus: (
    id: number,
    status: string,
    note?: string,
    extra?: { trackingCode?: string; ghnOrderCode?: string }
  ) =>
    api.patch<ApiResponse<AdminOrderDetail>>(`/admin/orders/${id}/status`, {
      status,
      note,
      trackingCode: extra?.trackingCode,
      ghnOrderCode: extra?.ghnOrderCode,
    }),
  assignImei: (orderId: number, orderDetailId: number, imeis: string[]) =>
    api.post<ApiResponse<AdminOrderDetail>>(`/admin/orders/${orderId}/assign-imei`, {
      orderDetailId,
      imeis,
    }),

  refundVnpay: (orderId: number) =>
    api.post<
      ApiResponse<{
        success: boolean;
        orderCode?: string;
        message?: string;
      }>
    >(`/admin/orders/${orderId}/refund-vnpay`),

  ghnPrintLabel: (orderId: number) =>
    api.get<
      ApiResponse<{
        token: string;
        printUrl: string;
        ghnOrderCode: string;
      }>
    >(`/admin/orders/${orderId}/ghn-print-label`),

  bulkUpdateStatus: (orderIds: number[], status: string, note?: string) =>
    api.patch<
      ApiResponse<{
        successCount: number;
        failCount: number;
        errors?: string[];
      }>
    >("/admin/orders/bulk-status", { orderIds, status, note }),
};

export const adminStatisticsApi = stats;

export {
  canAccessAdminPanel,
  hasAnyPermission,
  hasPermission,
  isAdminUser,
} from "@/utils/rbac";

export function getStoredUser(): {
  roles?: { name?: string }[];
  permissions?: string[];
} | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem("user") ?? sessionStorage.getItem("user");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/** Sau đăng nhập: nhân viên → /admin; khách → trang chủ. */
export function getPostLoginPath(
  user: { roles?: { name?: string }[]; permissions?: string[] } | null,
  redirectParam?: string | null
): string {
  const redirect = redirectParam?.trim();
  if (redirect && redirect.startsWith("/") && !redirect.startsWith("//")) {
    if (redirect.startsWith("/admin") && !canAccessAdminPanel(user)) return "/";
    return redirect;
  }
  if (canAccessAdminPanel(user)) return "/admin";
  return "/";
}

export const rbacApi = {
  listRoles: async () => {
    const res = await api.get<ApiResponse<RoleDetail[]>>("/admin/rbac/roles");
    return res.data.data;
  },
  listPermissions: async () => {
    const res = await api.get<ApiResponse<PermissionItem[]>>("/admin/rbac/permissions");
    return res.data.data;
  },
  updateRolePermissions: async (roleId: number, permissionIds: number[]) => {
    const res = await api.put<ApiResponse<RoleDetail>>(
      `/admin/rbac/roles/${roleId}/permissions`,
      { permissionIds }
    );
    return res.data.data;
  },
};
