import api, { type ApiResponse, type PageResponse } from "./api";
import type { Page } from "@/types/api";
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
  processingOrders?: number;
  shippingOrders: number;
  ordersToday: number;
  lowStockVariants: number;
  customerAccounts: number;
  pendingPurchaseOrders?: number;
  pendingReturnOrders?: number;
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

export interface ConversionRateStat {
  productId?: number;
  productName?: string;
  viewCount?: number;
  purchaseCount?: number;
  conversionRate?: number;
}

export interface ConversionRateStats {
  productRates: ConversionRateStat[];
}

export type StatsDateParams = { fromDate?: string; toDate?: string };

const stats = {
  overview: (params?: StatsDateParams) =>
    api.get<OverviewStatistics>("/admin/statistics/overview", { params }),
  staffOverview: (params?: StatsDateParams) =>
    api.get<StaffOverviewStatistics>("/admin/statistics/staff-overview", { params }),
  revenueChart: (
    period = "month",
    params?: { startDate?: string; endDate?: string }
  ) =>
    api.get<RevenueChartData>("/admin/statistics/revenue/chart", {
      params: { period, ...params },
    }),
  orderStatus: (params?: StatsDateParams) =>
    api.get<OrderStatusStats>("/admin/statistics/orders/by-status", { params }),
  topProducts: (
    type: "best-selling" | "low-stock",
    limit = 10,
    params?: StatsDateParams
  ) =>
    api.get<TopProductStats>("/admin/statistics/top-products", {
      params: { type, limit, ...params },
    }),
  recentOrders: (limit = 10, params?: StatsDateParams) =>
    api.get<RecentOrdersData>("/admin/statistics/orders/recent", {
      params: { limit, ...params },
    }),
  paymentMethods: (params?: StatsDateParams) =>
    api.get<PaymentMethodStats>("/admin/statistics/payment-methods", { params }),
  exportRevenueCsv: (params?: {
    period?: string;
    startDate?: string;
    endDate?: string;
  }) =>
    api.get<Blob>("/admin/statistics/revenue/export", {
      params,
      responseType: "blob",
    }),
  conversionRate: () =>
    api.get<ConversionRateStats>("/admin/statistics/conversion-rate"),
  customerSegments: () =>
    api.get<CustomerSegmentStats>("/admin/statistics/customer-segments"),
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
  code: string;
  description?: string;
  logoUrl?: string;
  country?: string;
  website?: string;
  isActive?: boolean;
  productCount?: number;
  activeProductCount?: number;
  createdAt?: string;
}

export interface ProducerStats {
  total: number;
  active: number;
  inactive: number;
  withProducts: number;
  withoutProducts: number;
  totalLinkedProducts: number;
}

export interface ProducerProductSummary {
  id: number;
  name: string;
  isActive?: boolean;
  basePrice?: number;
}

export type ProducerCreatePayload = {
  name: string;
  code: string;
  logoUrl?: string;
  description?: string;
  country?: string;
  website?: string;
  isActive?: boolean;
};

export type ProducerUpdatePayload = Partial<ProducerCreatePayload>;

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
  list: (params?: {
    page?: number;
    size?: number;
    keyword?: string;
    isActive?: boolean;
    country?: string;
    hasProducts?: boolean;
    sortBy?: string;
    sortDir?: string;
  }) => api.get<ApiResponse<PageResponse<ProducerItem>>>("/admin/producers", { params }),
  stats: () => api.get<ApiResponse<ProducerStats>>("/admin/producers/stats"),
  get: (id: number) => api.get<ApiResponse<ProducerItem>>(`/admin/producers/${id}`),
  getByCode: (code: string) =>
    api.get<ApiResponse<ProducerItem>>(`/admin/producers/code/${encodeURIComponent(code)}`),
  getProducts: (id: number, params?: { page?: number; size?: number }) =>
    api.get<ApiResponse<PageResponse<ProducerProductSummary>>>(
      `/admin/producers/${id}/products`,
      { params }
    ),
  listAll: (isActive?: boolean) =>
    api.get<ApiResponse<ProducerItem[]>>("/admin/producers/all", {
      params: isActive !== undefined ? { isActive } : undefined,
    }),
  create: (body: ProducerCreatePayload) =>
    api.post<ApiResponse<ProducerItem>>("/admin/producers", body),
  update: (id: number, body: ProducerUpdatePayload) =>
    api.put<ApiResponse<ProducerItem>>(`/admin/producers/${id}`, body),
  validateCode: (body: { code: string; excludeId?: number }) =>
    api.post<ApiResponse<{ available: boolean; code: string; message?: string }>>(
      "/admin/producers/validate-code",
      body
    ),
  bulkStatus: (ids: number[], isActive: boolean) =>
    api.patch<ApiResponse<ProducerItem[]>>("/admin/producers/bulk-status", { ids, isActive }),
  remove: (id: number) => api.delete<ApiResponse<void>>(`/admin/producers/${id}`),
  hardRemove: (id: number) => api.delete<ApiResponse<void>>(`/admin/producers/${id}/hard`),
  toggle: (id: number) =>
    api.patch<ApiResponse<ProducerItem>>(`/admin/producers/${id}/toggle-status`),
};

// ─── Users ───────────────────────────────────────────────────────────────

export const CUSTOMER_ROLE_ID = 4;

export interface AdminUser {
  id: number;
  username: string;
  email: string;
  fullName?: string;
  name?: string;
  phone?: string;
  birth?: string;
  gender?: string;
  address?: string;
  provider?: string;
  avatarUrl?: string;
  enabled?: boolean;
  createdAt?: string;
  updatedAt?: string;
  lastLoginAt?: string;
  roles?: { id: number; name: string }[];
  permissions?: string[];
}

export interface CustomerSegmentStats {
  segments: {
    productTypeId?: number;
    categoryName?: string;
    segmentLabel?: string;
    userCount?: number;
    percentage?: number;
    color?: string;
  }[];
}

export const adminCustomerApi = {
  list: (params?: {
    page?: number;
    size?: number;
    keyword?: string;
    sortBy?: string;
    sortDir?: "asc" | "desc";
  }) => api.get<ApiResponse<PageResponse<AdminUser>>>("/admin/customers", { params }),
};

export const adminUserApi = {
  list: (params?: {
    page?: number;
    size?: number;
    keyword?: string;
    sortBy?: string;
    sortDir?: "asc" | "desc";
  }) => api.get<ApiResponse<PageResponse<AdminUser>>>("/admin/users", { params }),
  get: (id: number) => api.get<ApiResponse<AdminUser>>(`/admin/users/${id}`),
  create: (body: {
    username: string;
    email: string;
    password: string;
    fullName: string;
    phone?: string;
    gender?: string;
    birth?: string;
    roleId?: number;
  }) => api.post<ApiResponse<AdminUser>>("/admin/users", body),
  update: (
    id: number,
    body: Partial<{
      fullName: string;
      phone?: string;
      address?: string;
      gender?: string;
      birth?: string;
    }>
  ) => api.put<ApiResponse<AdminUser>>(`/admin/users/${id}`, body),
  toggleStatus: (id: number) =>
    api.put<ApiResponse<AdminUser>>(`/admin/users/${id}/status`),
  remove: (id: number) => api.delete<ApiResponse<void>>(`/admin/users/${id}`),
};

// ─── Reviews ─────────────────────────────────────────────────────────────

export interface AdminReview {
  id: number;
  productId?: number;
  productName?: string;
  title?: string;
  user?: { id?: number; username?: string; name?: string };
  rating?: number;
  content?: string;
  pros?: string;
  cons?: string;
  replyContent?: string;
  isApproved?: boolean | null;
  isVerifiedPurchase?: boolean;
  helpfulCount?: number;
  images?: string[];
  createdAt?: string;
}

export interface AdminReviewStats {
  total: number;
  pending: number;
  approved: number;
  hidden: number;
  verifiedCount: number;
  unrepliedCount: number;
  averageRating: number;
  ratingDistribution?: Record<number, number>;
}

export const adminReviewApi = {
  list: (params?: {
    page?: number;
    size?: number;
    isApproved?: boolean;
    rating?: number;
    productId?: number;
    keyword?: string;
    verifiedOnly?: boolean;
    hasReply?: boolean;
  }) => api.get<ApiResponse<PageResponse<AdminReview>>>("/admin/reviews", { params }),
  stats: () => api.get<ApiResponse<AdminReviewStats>>("/admin/reviews/stats"),
  get: (id: number) => api.get<ApiResponse<AdminReview>>(`/admin/reviews/${id}`),
  updateStatus: (id: number, isApproved: boolean) =>
    api.put<ApiResponse<AdminReview>>(`/admin/reviews/${id}/status`, { isApproved }),
  bulkStatus: (ids: number[], isApproved: boolean) =>
    api.patch<ApiResponse<AdminReview[]>>("/admin/reviews/bulk-status", { ids, isApproved }),
  reply: (id: number, replyContent: string) =>
    api.post<ApiResponse<AdminReview>>(`/admin/reviews/${id}/reply`, { replyContent }),
  updateReply: (id: number, replyContent: string) =>
    api.put<ApiResponse<AdminReview>>(`/admin/reviews/${id}/reply`, { replyContent }),
  deleteReply: (id: number) => api.delete<ApiResponse<AdminReview>>(`/admin/reviews/${id}/reply`),
  remove: (id: number) => api.delete<ApiResponse<void>>(`/admin/reviews/${id}`),
};

// ─── Inventory ───────────────────────────────────────────────────────────

export interface InventoryStatRow {
  variantId: number;
  productName?: string;
  variantName?: string;
  skuCode?: string;
  stockQuantity: number;
  lowStockThreshold?: number;
  unitPrice?: number;
  stockValue?: number;
  status?: string;
  defectiveQuantity?: number;
  shelfLocationHint?: string;
  /** @deprecated dùng stockQuantity */
  currentStock?: number;
}

export interface PendingReturnItem {
  productItemId: number;
  imei?: string;
  serialNumber?: string;
  productName?: string;
  skuCode?: string;
  orderCode?: string;
  updatedAt?: string;
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

export type InventoryTransactionType =
  | "IMPORT"
  | "EXPORT"
  | "ADJUSTMENT"
  | "RETURN"
  | "TRANSFER";

export interface ValidateImportItemResult {
  variantId?: number;
  skuCode?: string;
  productName?: string;
  variantName?: string;
  currentStock?: number;
  requestedQuantity?: number;
  unitCost?: number;
  lineTotal?: number;
  valid: boolean;
  message?: string;
}

export interface ValidateImportResponse {
  allValid: boolean;
  results: ValidateImportItemResult[];
  supplier?: string;
  note?: string;
  estimatedTotalValue?: number;
}

export interface InventorySummary {
  lowStockCount: number;
  outOfStockCount: number;
  importTransactionCount: number;
}

export interface InventoryTransactionQuery {
  variantId?: number;
  transactionType?: InventoryTransactionType;
  referenceType?: string;
  referenceId?: number;
  fromDate?: string;
  toDate?: string;
  page?: number;
  size?: number;
  sortBy?: string;
  sortDir?: string;
}

export const adminInventoryApi = {
  summary: (lowStockThreshold = 10) =>
    api.get<ApiResponse<InventorySummary>>("/admin/inventory/summary", {
      params: { lowStockThreshold },
    }),

  stats: (lowStockThreshold = 10) =>
    api.get<ApiResponse<InventoryStatRow[]>>("/admin/inventory/stats", {
      params: { lowStockThreshold },
    }),

  exportStatsCsv: (lowStockThreshold = 10) =>
    api.get<Blob>("/admin/inventory/stats/export", {
      params: { lowStockThreshold },
      responseType: "blob",
    }),

  pendingReturns: (limit = 20) =>
    api.get<ApiResponse<PendingReturnItem[]>>("/admin/inventory/pending-returns", {
      params: { limit },
    }),

  validateImport: (body: {
    items: { variantId: number; quantity: number; unitCost?: number }[];
    supplier?: string;
    note?: string;
  }) =>
    api.post<ApiResponse<ValidateImportResponse>>("/admin/inventory/import/validate", body),

  importStock: (body: {
    items: { variantId: number; quantity: number; unitCost?: number }[];
    supplier?: string;
    note?: string;
  }) => api.post<ApiResponse<string>>("/admin/inventory/import", body),

  adjustStock: (body: {
    variantId: number;
    quantity: number;
    direction: "INCREASE" | "DECREASE";
    reason?: string;
  }) => api.post<ApiResponse<string>>("/admin/inventory/adjust", body),

  returnStock: (body: { imei: string; reason?: string; isDefective?: boolean }) =>
    api.post<ApiResponse<string>>("/admin/inventory/return", body),

  returnQuantity: (body: {
    variantId: number;
    quantity: number;
    reason?: string;
    isDefective?: boolean;
  }) => api.post<ApiResponse<string>>("/admin/inventory/return-quantity", body),

  transactions: (params?: InventoryTransactionQuery) =>
    api.get<ApiResponse<PageResponse<InventoryTransaction> | InventoryTransaction[]>>(
      "/admin/inventory/transactions",
      { params }
    ),

  getTransaction: (id: number) =>
    api.get<ApiResponse<InventoryTransaction>>(`/admin/inventory/transactions/${id}`),

  exportTransactionsCsv: (params?: Omit<InventoryTransactionQuery, "page" | "size" | "sortBy" | "sortDir">) =>
    api.get<Blob>("/admin/inventory/transactions/export", {
      params,
      responseType: "blob",
    }),

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

// ─── Purchase orders (warehouse PO queue) ───────────────────────────────────

export type PurchaseOrderFeStatus = "pending" | "receiving" | "completed";

export interface PurchaseOrderSummary {
  id: number;
  code: string;
  supplier: string;
  supplierId?: number;
  items: number;
  expectedDate: string;
  status: PurchaseOrderFeStatus;
  rawStatus?: string;
  totalAmount?: number;
  totalQuantity?: number;
  notes?: string;
  rejectReason?: string;
}

export interface PurchaseOrderCreateLine {
  variantId: number;
  quantityOrdered: number;
  unitCost?: number;
}

export interface PurchaseOrderCreateRequest {
  supplierId: number;
  expectedDate?: string;
  notes?: string;
  lines: PurchaseOrderCreateLine[];
  submitForApproval?: boolean;
}

export interface SupplierOption {
  id: number;
  name: string;
  code?: string;
  phone?: string;
  email?: string;
}

export interface PurchaseOrderLineItem {
  id: number;
  variantId?: number;
  skuCode?: string;
  productName?: string;
  quantityOrdered: number;
  quantityReceived: number;
  unitCost?: number;
}

export interface PurchaseOrderDetail extends PurchaseOrderSummary {
  orderDate?: string;
  receivedDate?: string;
  lineItems?: PurchaseOrderLineItem[];
}

export const adminPurchaseOrderApi = {
  list: (params?: {
    status?: PurchaseOrderFeStatus;
    scope?: "procurement" | "approval" | "warehouse";
  }) =>
    api.get<ApiResponse<PurchaseOrderSummary[]>>("/admin/purchase-orders", {
      params: {
        status: params?.status,
        scope: params?.scope === "warehouse" ? undefined : params?.scope,
      },
    }),

  listPaged: (params?: {
    status?: PurchaseOrderFeStatus;
    page?: number;
    size?: number;
  }) =>
    api.get<ApiResponse<Page<PurchaseOrderSummary>>>("/admin/purchase-orders", {
      params: {
        status: params?.status,
        page: params?.page ?? 0,
        size: params?.size ?? 15,
      },
    }),

  detail: (id: number, unrestricted = false) =>
    api.get<ApiResponse<PurchaseOrderDetail>>(`/admin/purchase-orders/${id}`, {
      params: unrestricted ? { unrestricted: true } : undefined,
    }),

  create: (body: PurchaseOrderCreateRequest) =>
    api.post<ApiResponse<PurchaseOrderDetail>>("/admin/purchase-orders", body),

  approve: (id: number) =>
    api.post<ApiResponse<PurchaseOrderSummary>>(`/admin/purchase-orders/${id}/approve`),

  reject: (id: number, body: { rejectReason: string }) =>
    api.post<ApiResponse<PurchaseOrderSummary>>(`/admin/purchase-orders/${id}/reject`, body),

  startReceiving: (id: number) =>
    api.post<ApiResponse<PurchaseOrderSummary>>(`/admin/purchase-orders/${id}/start-receiving`),
};

export const adminSupplierApi = {
  list: () => api.get<ApiResponse<SupplierOption[]>>("/admin/suppliers"),
};

// ─── Inventory audit (warehouse kiểm kê) ────────────────────────────────────

export type InventoryAuditFeStatus =
  | "in_progress"
  | "reconciled"
  | "pending_approval"
  | "approved"
  | "rejected"
  | "draft"
  | "submitted";

export interface InventoryAuditReconciliationLine {
  variantId?: number;
  productName?: string;
  variantName?: string;
  skuCode?: string;
  systemQty: number;
  actualQty: number;
  variance: number;
  status: "MATCHED" | "SHORTAGE" | "SURPLUS" | string;
}

export interface InventoryAuditDiscrepancy {
  serial: string;
  type: "MISSING" | "SURPLUS" | "MISPLACED" | string;
  productName?: string;
  skuCode?: string;
  expectedLocation?: string;
  scannedLocation?: string;
  message?: string;
}

export interface InventoryAuditSheet {
  id: number;
  code: string;
  createdAt: string;
  productTypeId?: number;
  categoryName?: string;
  scanned: number;
  expected: number;
  matched: number;
  missing: number;
  surplus: number;
  variance: number;
  status: InventoryAuditFeStatus;
  note?: string;
  rejectReason?: string;
  retailLocked?: boolean;
  wizardStep?: number;
  scannedCodes?: string[];
  missingCodes?: string[];
  surplusCodes?: string[];
  lines?: InventoryAuditReconciliationLine[];
  discrepancies?: InventoryAuditDiscrepancy[];
  createdByName?: string;
  approvedByName?: string;
}

export interface InventoryAuditStats {
  inProgressCount: number;
  pendingApprovalCount: number;
  approvedCount: number;
  rejectedCount: number;
  draftCount?: number;
  submittedCount?: number;
}

export interface InventoryAuditScanResult {
  code: string;
  resultType: string;
  message: string;
  productName?: string;
  skuCode?: string;
  expectedLocation?: string;
  scannedLocation?: string;
  totalScanned?: number;
}

export interface InventoryAuditBulkScanResult {
  total: number;
  matched: number;
  surplus: number;
  duplicate: number;
  misplacement: number;
  totalScanned: number;
  results: InventoryAuditScanResult[];
}

export interface InventoryAuditScanProgress {
  totalScanned: number;
  expectedCount: number;
  hideSystemQty: boolean;
  lines: {
    variantId?: number;
    productName?: string;
    variantName?: string;
    skuCode?: string;
    actualQty: number;
  }[];
}

export const adminInventoryAuditApi = {
  list: () => api.get<ApiResponse<InventoryAuditSheet[]>>("/admin/inventory-audit"),

  recent: () => api.get<ApiResponse<InventoryAuditSheet[]>>("/admin/inventory-audit/recent"),

  stats: () => api.get<ApiResponse<InventoryAuditStats>>("/admin/inventory-audit/stats"),

  pending: () =>
    api.get<ApiResponse<InventoryAuditSheet[]>>("/admin/inventory-audit/pending"),

  processed: () =>
    api.get<ApiResponse<InventoryAuditSheet[]>>("/admin/inventory-audit/processed"),

  get: (id: number) =>
    api.get<ApiResponse<InventoryAuditSheet>>(`/admin/inventory-audit/${id}`),

  scanProgress: (id: number) =>
    api.get<ApiResponse<InventoryAuditScanProgress>>(
      `/admin/inventory-audit/${id}/scan-progress`
    ),

  start: (body: { productTypeId: number; note?: string; retailLocked?: boolean }) =>
    api.post<ApiResponse<InventoryAuditSheet>>("/admin/inventory-audit/start", body),

  scan: (id: number, body: { code: string; shelfLocation?: string }) =>
    api.post<ApiResponse<InventoryAuditScanResult>>(`/admin/inventory-audit/${id}/scan`, body),

  bulkScan: (id: number, body: { codes: string[] }) =>
    api.post<ApiResponse<InventoryAuditBulkScanResult>>(
      `/admin/inventory-audit/${id}/bulk-scan`,
      body
    ),

  complete: (id: number) =>
    api.post<ApiResponse<{ sheet: InventoryAuditSheet; summary: string }>>(
      `/admin/inventory-audit/${id}/complete`
    ),

  submit: (id: number, body?: { note?: string }) =>
    api.post<ApiResponse<InventoryAuditSheet>>(`/admin/inventory-audit/${id}/submit`, body ?? {}),

  approve: (id: number) =>
    api.post<ApiResponse<InventoryAuditSheet>>(`/admin/inventory-audit/${id}/approve`),

  reject: (id: number, body?: { reason?: string }) =>
    api.post<ApiResponse<InventoryAuditSheet>>(`/admin/inventory-audit/${id}/reject`, body ?? {}),

  updateNote: (id: number, note: string) =>
    api.patch<ApiResponse<InventoryAuditSheet>>(`/admin/inventory-audit/${id}/note`, { note }),

  /** @deprecated */
  create: (body: { scannedCodes: string[]; note?: string }) =>
    api.post<ApiResponse<InventoryAuditSheet>>("/admin/inventory-audit", body),
};

// ─── IMEI / Serial (adminImeiApi) ─────────────────────────────────────────

export type ImeiDeviceStatus =
  | "AVAILABLE"
  | "RESERVED"
  | "SOLD"
  | "IN_REPAIR"
  | "DEFECTIVE"
  | "RETURNED";

export interface ImeiStats {
  total: number;
  available: number;
  reserved: number;
  sold: number;
  inRepair: number;
  defective: number;
  returned: number;
  linkedToOrders: number;
}

export interface ImeiListItem {
  id: number;
  imei?: string;
  serialNumber?: string;
  imei2?: string;
  productName: string;
  variantName?: string;
  skuCode?: string;
  variantId?: number;
  status: ImeiDeviceStatus | string;
  condition?: string;
  orderCode?: string;
  orderId?: number;
  batchNumber?: string;
  location?: string;
  createdAt?: string;
  warrantyStartDate?: string;
  warrantyMonths?: number;
}

export interface ImeiOrderLink {
  orderId?: number;
  orderCode?: string;
  orderStatus?: string;
  orderDetailId?: number;
  quantity?: number;
}

export interface ImeiWarrantyInfo {
  startDate?: string;
  months?: number;
  active?: boolean;
  message?: string;
}

export interface ImeiTransactionItem {
  id: number;
  transactionType: string;
  quantity: number;
  reason?: string;
  createdAt?: string;
}

export interface ImeiDetail extends ImeiListItem {
  macAddress?: string;
  notes?: string;
  productId?: number;
  manufactureDate?: string;
  updatedAt?: string;
  soldAt?: string;
  order?: ImeiOrderLink;
  warranty?: ImeiWarrantyInfo;
  transactions?: ImeiTransactionItem[];
}

export interface ImeiValidateItemResult {
  imei: string;
  valid: boolean;
  message: string;
}

export interface ImeiValidateResponse {
  allValid: boolean;
  results: ImeiValidateItemResult[];
}

export interface ImeiImportResult {
  importedCount: number;
  skippedCount: number;
  errors: string[];
}

export interface ImeiBulkStatusResult {
  successCount: number;
  failCount: number;
  errors: string[];
}

export interface ImeiReleaseResponse {
  productItemId: number;
  imei?: string;
  previousStatus?: string;
  newStatus?: string;
  orderCode?: string;
  message?: string;
}

export const adminImeiApi = {
  stats: () => api.get<ApiResponse<ImeiStats>>("/admin/imei/stats"),

  list: (params?: {
    keyword?: string;
    status?: string;
    variantId?: number;
    orderCode?: string;
    fromDate?: string;
    toDate?: string;
    page?: number;
    size?: number;
    sortBy?: string;
    sortDir?: string;
  }) => api.get<ApiResponse<PageResponse<ImeiListItem>>>("/admin/imei", { params }),

  get: (id: number) => api.get<ApiResponse<ImeiDetail>>(`/admin/imei/${id}`),

  lookup: (code: string) =>
    api.get<ApiResponse<ImeiDetail>>(`/admin/imei/lookup/${encodeURIComponent(code)}`),

  validate: (body: { variantId?: number; imeis: string[]; excludeId?: number }) =>
    api.post<ApiResponse<ImeiValidateResponse>>("/admin/imei/validate", body),

  create: (body: {
    variantId: number;
    imeis: string[];
    batchNumber?: string;
    note?: string;
    imei2?: string;
    macAddress?: string;
  }) => api.post<ApiResponse<void>>("/admin/imei", body),

  uploadExcel: (file: File) => {
    const form = new FormData();
    form.append("file", file);
    return api.post<ApiResponse<ImeiImportResult>>("/admin/imei/upload-excel", form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  update: (
    id: number,
    body: {
      imei2?: string;
      macAddress?: string;
      batchNumber?: string;
      location?: string;
      notes?: string;
      condition?: string;
    }
  ) => api.patch<ApiResponse<ImeiListItem>>(`/admin/imei/${id}`, body),

  updateStatus: (
    id: number,
    body: { status: string; reason?: string; force?: boolean }
  ) => api.put<ApiResponse<ImeiListItem>>(`/admin/imei/${id}/status`, body),

  bulkStatus: (body: {
    ids: number[];
    status: string;
    reason?: string;
    force?: boolean;
  }) => api.patch<ApiResponse<ImeiBulkStatusResult>>("/admin/imei/bulk-status", body),

  release: (id: number) =>
    api.post<ApiResponse<ImeiReleaseResponse>>(`/admin/imei/${id}/release`),

  returnStock: (body: { imei: string; reason?: string; isDefective?: boolean }) =>
    api.post<ApiResponse<void>>("/admin/imei/return", body),

  exportCsv: (params?: {
    keyword?: string;
    status?: string;
    variantId?: number;
    orderCode?: string;
    fromDate?: string;
    toDate?: string;
  }) =>
    api.get<Blob>("/admin/imei/export", {
      params,
      responseType: "blob",
    }),
};

// ─── Coupons ─────────────────────────────────────────────────────────────

export type CouponLifecycleStatus =
  | "ACTIVE"
  | "INACTIVE"
  | "EXPIRED"
  | "UPCOMING"
  | "EXHAUSTED";

export type CouponScopeType = "ALL" | "PRODUCTS" | "PRODUCT_TYPES";

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
  perUserLimit?: number;
  firstOrderOnly?: boolean;
  scopeType?: CouponScopeType;
  productIds?: number[];
  productTypeIds?: number[];
  dateStart: string;
  dateEnd: string;
  isActive?: boolean;
  lifecycleStatus?: CouponLifecycleStatus;
  createdAt?: string;
  updatedAt?: string;
}

export interface AdminCouponStats {
  total: number;
  active: number;
  inactive: number;
  expired: number;
  upcoming: number;
  exhausted: number;
  totalUsedCount: number;
  firstOrderOnlyCount: number;
}

export interface CouponValidateResponse {
  valid: boolean;
  code?: string;
  message?: string;
  discountType?: string;
  discountValue?: number;
  discountAmount?: number;
  originalSubtotal?: number;
  finalAmount?: number;
}

export interface CouponUsageOrder {
  orderId: number;
  orderCode: string;
  customerName?: string;
  customerUsername?: string;
  discountAmount?: number;
  totalAmount?: number;
  orderStatus?: string;
  orderDate?: string;
}

export type CouponCreatePayload = {
  code: string;
  name?: string;
  description?: string;
  discountType: string;
  discountValue: number;
  minOrderValue?: number;
  maxDiscountAmount?: number;
  usageLimit?: number;
  perUserLimit?: number;
  firstOrderOnly?: boolean;
  scopeType?: CouponScopeType;
  productIds?: number[];
  productTypeIds?: number[];
  dateStart: string;
  dateEnd: string;
  isActive?: boolean;
};

export const adminCouponApi = {
  list: (params?: {
    page?: number;
    size?: number;
    keyword?: string;
    isActive?: boolean;
    discountType?: string;
    lifecycle?: string;
    sortBy?: string;
    sortDir?: string;
  }) => api.get<ApiResponse<PageResponse<AdminCoupon>>>("/admin/coupons", { params }),
  stats: () => api.get<ApiResponse<AdminCouponStats>>("/admin/coupons/stats"),
  get: (id: number) => api.get<ApiResponse<AdminCoupon>>(`/admin/coupons/${id}`),
  getByCode: (code: string) =>
    api.get<ApiResponse<AdminCoupon>>(`/admin/coupons/code/${encodeURIComponent(code)}`),
  getUsageOrders: (id: number, params?: { page?: number; size?: number }) =>
    api.get<ApiResponse<PageResponse<CouponUsageOrder>>>(`/admin/coupons/${id}/orders`, {
      params,
    }),
  create: (body: CouponCreatePayload) =>
    api.post<ApiResponse<AdminCoupon>>("/admin/coupons", body),
  update: (id: number, body: Partial<CouponCreatePayload>) =>
    api.put<ApiResponse<AdminCoupon>>(`/admin/coupons/${id}`, body),
  toggle: (id: number) => api.patch<ApiResponse<AdminCoupon>>(`/admin/coupons/${id}/toggle`),
  bulkStatus: (ids: number[], isActive: boolean) =>
    api.patch<ApiResponse<AdminCoupon[]>>("/admin/coupons/bulk-status", { ids, isActive }),
  validate: (body: {
    code: string;
    subtotal?: number;
    userId?: number;
    items?: { productId?: number; productTypeId?: number; lineTotal?: number }[];
  }) => api.post<ApiResponse<CouponValidateResponse>>("/admin/coupons/validate", body),
  remove: (id: number) => api.delete<ApiResponse<void>>(`/admin/coupons/${id}`),
  hardRemove: (id: number) => api.delete<ApiResponse<void>>(`/admin/coupons/${id}/hard`),
  listActive: () => api.get<ApiResponse<AdminCoupon[]>>("/admin/coupons/active"),
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
  returnedAt?: string;
  createdBy?: string;
}

export interface WarrantyStatsResponse {
  total: number;
  pending: number;
  inProgress: number;
  completed: number;
  cancelled: number;
  returned: number;
}

export interface WarrantyValidateResponse {
  valid: boolean;
  message?: string;
  deviceFound?: boolean;
  warrantyValid?: boolean;
  hasActiveTicket?: boolean;
  activeTicketCode?: string;
  warranty?: {
    productName?: string;
    variantName?: string;
    imei?: string;
    isValid?: boolean;
    message?: string;
    warrantyEndDate?: string;
    status?: string;
  };
}

export interface WarrantyLookupAdmin {
  found: boolean;
  message: string;
  warranty?: {
    productName?: string;
    variantName?: string;
    imei?: string;
    serialNumber?: string;
    isValid?: boolean;
    message?: string;
    warrantyStartDate?: string;
    warrantyEndDate?: string;
    status?: string;
  };
  purchase?: {
    orderCode?: string;
    orderDate?: string;
    orderStatusDisplay?: string;
  } | null;
  repairTickets?: {
    ticketCode?: string;
    status?: string;
    statusDisplay?: string;
    receivedAt?: string;
  }[];
}

export const adminWarrantyApi = {
  stats: () => api.get<ApiResponse<WarrantyStatsResponse>>("/admin/warranty/stats"),

  lookup: (code: string) =>
    api.get<ApiResponse<WarrantyLookupAdmin>>(`/admin/warranty/lookup/${encodeURIComponent(code)}`),

  validate: (body: {
    imeiOrSerial: string;
    customerName: string;
    customerPhone: string;
    issueDescription: string;
  }) => api.post<ApiResponse<WarrantyValidateResponse>>("/admin/warranty/tickets/validate", body),

  list: (params?: {
    page?: number;
    size?: number;
    keyword?: string;
    status?: string;
    fromDate?: string;
    toDate?: string;
  }) => api.get<ApiResponse<PageResponse<WarrantyTicket>>>("/admin/warranty/tickets", { params }),

  exportCsv: (params?: {
    keyword?: string;
    status?: string;
    fromDate?: string;
    toDate?: string;
  }) =>
    api.get<Blob>("/admin/warranty/tickets/export", {
      params,
      responseType: "blob",
    }),

  get: (id: number) =>
    api.get<ApiResponse<WarrantyTicket>>(`/admin/warranty/tickets/${id}`),

  getByCode: (ticketCode: string) =>
    api.get<ApiResponse<WarrantyTicket>>(
      `/admin/warranty/tickets/by-code/${encodeURIComponent(ticketCode)}`
    ),

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
    assignedImeis?: string[];
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
