import api, { type ApiResponse, type PageResponse } from "./api";

export interface FulfillmentQueueItem {
  id: number;
  orderCode: string;
  status: string;
  customerName: string;
  customerPhone: string;
  total: number;
  paymentMethod: string;
  orderDate: string;
  totalSerialRequired: number;
  totalSerialAssigned: number;
  pickingComplete: boolean;
  pickedByUserId?: number;
  pickedByName?: string;
  pickedAt?: string;
  canStartPicking: boolean;
}

export interface FifoSerialHint {
  productItemId: number;
  serialNumber?: string;
  imei?: string;
  location?: string;
  batchNumber?: string;
  stockInDate?: string;
}

export interface PickingLine {
  orderDetailId: number;
  productName: string;
  variantName?: string;
  skuCode?: string;
  quantity: number;
  assignedCount: number;
  assignedSerials: string[];
  nextFifoHint?: FifoSerialHint | null;
}

export interface PickingProgress {
  totalRequired: number;
  totalAssigned: number;
  complete: boolean;
  lines: PickingLine[];
}

export interface FulfillmentDetail {
  id: number;
  orderCode: string;
  status: string;
  customerName: string;
  customerPhone: string;
  shippingAddress: string;
  total: number;
  paymentMethod: string;
  trackingCode?: string;
  ghnOrderCode?: string;
  orderDate: string;
  pickedByUserId?: number;
  pickedByName?: string;
  pickedAt?: string;
  canStartPicking: boolean;
  canScan: boolean;
  canDispatch: boolean;
  progress: PickingProgress;
  timeline?: { status: string; note?: string; changedBy?: string; createdAt?: string }[];
}

export interface ValidateScanResult {
  valid: boolean;
  message: string;
  expectedSerial?: string;
  scannedSerial?: string;
  matchedItem?: FifoSerialHint;
}

export interface DispatchResult {
  orderId: number;
  orderCode: string;
  status: string;
  trackingCode?: string;
  ghnOrderCode?: string;
  printUrl?: string;
}

export const warehouseFulfillmentApi = {
  queue: (params?: {
    keyword?: string;
    status?: string;
    page?: number;
    size?: number;
  }) =>
    api.get<ApiResponse<PageResponse<FulfillmentQueueItem>>>(
      "/admin/warehouse/fulfillment-queue",
      { params }
    ),

  detail: (orderId: number) =>
    api.get<ApiResponse<FulfillmentDetail>>(`/admin/warehouse/orders/${orderId}/fulfillment`),

  startPicking: (orderId: number) =>
    api.post<ApiResponse<FulfillmentDetail>>(`/admin/warehouse/orders/${orderId}/start-picking`),

  validateScan: (
    orderId: number,
    body: { orderDetailId: number; scannedCode: string; overrideFifo?: boolean; overrideReason?: string }
  ) =>
    api.post<ApiResponse<ValidateScanResult>>(
      `/admin/warehouse/orders/${orderId}/validate-scan`,
      body
    ),

  assignSerial: (
    orderId: number,
    body: { orderDetailId: number; scannedCode: string; overrideFifo?: boolean; overrideReason?: string }
  ) =>
    api.post<ApiResponse<PickingProgress>>(`/admin/warehouse/orders/${orderId}/assign-serial`, body),

  progress: (orderId: number) =>
    api.get<ApiResponse<PickingProgress>>(`/admin/warehouse/orders/${orderId}/picking-progress`),

  dispatch: (orderId: number) =>
    api.post<ApiResponse<DispatchResult>>(`/admin/warehouse/orders/${orderId}/dispatch`),
};
