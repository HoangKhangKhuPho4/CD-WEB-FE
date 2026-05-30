import api, { type ApiResponse } from "./api";

interface WarrantyCheckData {
  productName?: string;
  variantName?: string;
  imageUrl?: string;
  imei?: string;
  serialNumber?: string;
  status?: string;
  warrantyStartDate?: string;
  warrantyEndDate?: string;
  warrantyMonths?: number;
  isValid?: boolean;
  message?: string;
}

export interface WarrantyCheckResult {
  productName?: string;
  variantName?: string;
  imageUrl?: string;
  imei?: string;
  serialNumber?: string;
  status?: string;
  warrantyStartDate?: string;
  warrantyEndDate?: string;
  warrantyMonths?: number;
  valid: boolean;
  message: string;
}

export interface PurchaseInfo {
  orderCode?: string;
  orderDate?: string;
  orderStatus?: string;
  orderStatusDisplay?: string;
  paymentMethod?: string;
  deliveredAt?: string;
  soldAt?: string;
  lineTotal?: number;
}

export interface RepairTicketSummary {
  ticketCode?: string;
  status?: string;
  statusDisplay?: string;
  receivedAt?: string;
  resolvedAt?: string;
  issueDescription?: string;
}

export interface WarrantyLookupResult {
  found: boolean;
  message: string;
  warranty: WarrantyCheckResult;
  purchase?: PurchaseInfo | null;
  repairTickets: RepairTicketSummary[];
}

export interface CreateWarrantyTicketPayload {
  imeiOrSerial: string;
  customerName: string;
  customerPhone: string;
  issueDescription: string;
}

export interface CreateWarrantyTicketResult {
  ticketCode?: string;
  status?: string;
  statusDisplay?: string;
  message?: string;
}

function mapWarrantyResponse(data: WarrantyCheckData, message: string): WarrantyCheckResult {
  return {
    productName: data.productName,
    variantName: data.variantName,
    imageUrl: data.imageUrl,
    imei: data.imei,
    serialNumber: data.serialNumber,
    status: data.status,
    warrantyStartDate: data.warrantyStartDate,
    warrantyEndDate: data.warrantyEndDate,
    warrantyMonths: data.warrantyMonths,
    valid: Boolean(data.isValid),
    message: message || data.message || "",
  };
}

function mapLookupData(data: {
  found?: boolean;
  message?: string;
  warranty?: WarrantyCheckData;
  purchase?: PurchaseInfo | null;
  repairTickets?: RepairTicketSummary[];
}): WarrantyLookupResult {
  const w = data.warranty ?? {};
  return {
    found: Boolean(data.found),
    message: data.message ?? "",
    warranty: mapWarrantyResponse(w, data.message ?? w.message ?? ""),
    purchase: data.purchase ?? null,
    repairTickets: data.repairTickets ?? [],
  };
}

/** Tra cứu đầy đủ — bảo hành, mua hàng, phiếu sửa chữa. */
export async function lookupWarrantyByCode(code: string): Promise<WarrantyLookupResult> {
  const trimmed = code.trim();
  if (!trimmed) {
    throw new Error("Vui lòng nhập IMEI hoặc số serial.");
  }

  try {
    const res = await api.get<
      ApiResponse<{
        found?: boolean;
        message?: string;
        warranty?: WarrantyCheckData;
        purchase?: PurchaseInfo | null;
        repairTickets?: RepairTicketSummary[];
      }>
    >(`/public/warranty/lookup/${encodeURIComponent(trimmed)}`);

    if (res.data.success && res.data.data) {
      return mapLookupData(res.data.data);
    }
    throw new Error(res.data.message || "Không tra cứu được thông tin.");
  } catch (err: unknown) {
    const ax = err as { response?: { data?: ApiResponse<unknown> } };
    const msg = ax.response?.data?.message;
    if (msg) throw new Error(msg);
    if (err instanceof Error) throw err;
    throw new Error("Không thể kết nối máy chủ. Vui lòng thử lại sau.");
  }
}

/** Tra cứu bảo hành cơ bản (tương thích cũ). */
export async function checkWarrantyByCode(code: string): Promise<WarrantyCheckResult> {
  const full = await lookupWarrantyByCode(code);
  return full.warranty;
}

/** Gửi yêu cầu tiếp nhận bảo hành (công khai). */
export async function createPublicWarrantyTicket(
  payload: CreateWarrantyTicketPayload
): Promise<CreateWarrantyTicketResult> {
  try {
    const res = await api.post<
      ApiResponse<{
        ticketCode?: string;
        status?: string;
        statusDisplay?: string;
      }>
    >("/public/warranty/tickets", payload);

    if (res.data.success && res.data.data) {
      return {
        ticketCode: res.data.data.ticketCode,
        status: res.data.data.status,
        statusDisplay: res.data.data.statusDisplay,
        message: res.data.message,
      };
    }
    throw new Error(res.data.message || "Gửi yêu cầu thất bại.");
  } catch (err: unknown) {
    const ax = err as { response?: { data?: ApiResponse<unknown> } };
    const msg = ax.response?.data?.message;
    if (msg) throw new Error(msg);
    if (err instanceof Error) throw err;
    throw new Error("Không thể gửi yêu cầu. Vui lòng thử lại sau.");
  }
}
