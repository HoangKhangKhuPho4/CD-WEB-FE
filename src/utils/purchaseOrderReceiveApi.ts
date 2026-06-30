import axios from "axios";
import api, { type ApiResponse } from "./api";

function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token") ?? sessionStorage.getItem("token");
}

const rawBase =
  typeof process !== "undefined" && process.env.NEXT_PUBLIC_API_BASE_URL
    ? process.env.NEXT_PUBLIC_API_BASE_URL.replace(/\/$/, "")
    : "http://localhost:8080";

export interface ReceiveLineProgress {
  poLineId: number;
  variantId?: number;
  skuCode?: string;
  productName?: string;
  variantName?: string;
  quantityOrdered: number;
  quantityReceived: number;
  quantityDamaged: number;
  remaining: number;
  receivedSerials: string[];
  damagedSerials: string[];
}

export interface ReceiveProgress {
  totalOrdered: number;
  totalReceived: number;
  totalDamaged: number;
  totalRemaining: number;
  complete: boolean;
  lines: ReceiveLineProgress[];
}

export interface StockLotSummary {
  lotNumber: string;
  itemsScanned: number;
  itemsRequired: number;
  status: "OPEN" | "CLOSED" | string;
}

export interface PurchaseOrderSummary {
  id: number;
  code: string;
  supplier: string;
  supplierId?: number;
  items: number;
  expectedDate: string;
  status: string;
  rawStatus?: string;
  totalAmount?: number;
  totalQuantity?: number;
  notes?: string;
}

export interface BulkReceiveItemResult {
  serial: string;
  success: boolean;
  message: string;
}

export interface BulkReceiveSerialResult {
  detail: PurchaseOrderReceiveDetail;
  results: BulkReceiveItemResult[];
  successCount: number;
  failCount: number;
  autoCompleted: boolean;
  message: string;
}

export interface PurchaseOrderReceiveDetail {
  id: number;
  code: string;
  supplier: string;
  status: string;
  rawStatus?: string;
  expectedDate: string;
  notes?: string;
  defaultBatchNumber?: string;
  canStartReceiving: boolean;
  canScan: boolean;
  canComplete: boolean;
  canLockOrder: boolean;
  stockLots?: StockLotSummary[];
  autoCompleted?: boolean;
  progress: ReceiveProgress;
}

export interface ValidateReceiveScanResult {
  valid: boolean;
  message: string;
  scannedCode?: string;
}

export interface CompleteReceivingResult {
  id: number;
  code: string;
  status: string;
  totalOrdered: number;
  totalReceived: number;
  totalDamaged: number;
  totalMissing: number;
  message: string;
}

export const purchaseOrderReceiveApi = {
  imeiQueue: () =>
    api.get<ApiResponse<PurchaseOrderSummary[]>>("/admin/purchase-orders/imei-queue"),

  receiveDetail: (id: number) =>
    api.get<ApiResponse<PurchaseOrderReceiveDetail>>(
      `/admin/purchase-orders/${id}/receive-detail`
    ),

  startReceiving: (id: number) =>
    api.post<ApiResponse<{ id: number; code: string; status: string }>>(
      `/admin/purchase-orders/${id}/start-receiving`
    ),

  validateScan: (id: number, body: { poLineId: number; scannedCode: string }) =>
    api.post<ApiResponse<ValidateReceiveScanResult>>(
      `/admin/purchase-orders/${id}/validate-scan`,
      body
    ),

  receiveSerial: (
    id: number,
    body: {
      poLineId: number;
      scannedCode: string;
      batchNumber?: string;
      shelfLocation?: string;
    }
  ) =>
    api.post<ApiResponse<PurchaseOrderReceiveDetail>>(
      `/admin/purchase-orders/${id}/receive-serial`,
      body
    ),

  receiveSerialBulk: (
    id: number,
    body: {
      poLineId: number;
      serials: string[];
      batchNumber?: string;
      shelfLocation?: string;
    }
  ) =>
    api.post<ApiResponse<BulkReceiveSerialResult>>(
      `/admin/purchase-orders/${id}/receive-serial-bulk`,
      body
    ),

  receiveQuantity: (
    id: number,
    body: {
      poLineId: number;
      quantity: number;
      batchNumber?: string;
      shelfLocation?: string;
      note?: string;
    }
  ) =>
    api.post<ApiResponse<PurchaseOrderReceiveDetail>>(
      `/admin/purchase-orders/${id}/receive-quantity`,
      body
    ),

  reportDamaged: (
    id: number,
    body: {
      poLineId: number;
      serialCode?: string;
      quantity?: number;
      reason: string;
      evidenceUrl?: string;
      shelfLocation?: string;
      batchNumber?: string;
    }
  ) =>
    api.post<ApiResponse<PurchaseOrderReceiveDetail>>(
      `/admin/purchase-orders/${id}/report-damaged`,
      body
    ),

  completeReceiving: (id: number, body?: { discrepancyNote?: string }) =>
    api.post<ApiResponse<CompleteReceivingResult>>(
      `/admin/purchase-orders/${id}/complete-receiving`,
      body ?? {}
    ),

  uploadEvidence: async (file: File): Promise<string> => {
    const form = new FormData();
    form.append("file", file);
    const token = getStoredToken();
    const res = await axios.post<{ success: boolean; url?: string; message?: string }>(
      `${rawBase}/api/v1/upload`,
      form,
      {
        headers: {
          "Content-Type": "multipart/form-data",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        withCredentials: true,
      }
    );
    if (!res.data.success || !res.data.url) {
      throw new Error(res.data.message ?? "Upload ảnh thất bại");
    }
    return res.data.url;
  },
};
