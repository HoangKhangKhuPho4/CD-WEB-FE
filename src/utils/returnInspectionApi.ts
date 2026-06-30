import api, { type ApiResponse } from "./api";

export interface ReturnInspectionSummary {
  id: number;
  sheetCode: string;
  status: "pending" | "draft" | "processed" | "rejected" | "cancelled" | string;
  serialCode?: string;
  orderCode?: string;
  customerName?: string;
  customerPhone?: string;
  productName?: string;
  variantName?: string;
  skuCode?: string;
  trackingCode?: string;
  judgment?: string;
  defectCause?: string;
  createdAt?: string;
  processedAt?: string;
  warehouseConfirmed?: boolean;
}

export interface ReturnInspectionDetail extends ReturnInspectionSummary {
  orderId?: number;
  detailReason?: string;
  warehouseNote?: string;
  rejectReason?: string;
  cancelReason?: string;
  evidenceUrl?: string;
  draftScannedSerial?: string;
  orderWarehouseConfirmed?: boolean;
}

export interface ReturnIntakeResult {
  redirectSheetId?: number;
  createdCount: number;
  message: string;
}

export interface DefectLabelData {
  sheetCode: string;
  serialCode?: string;
  productName?: string;
  variantName?: string;
  skuCode?: string;
  orderCode?: string;
  defectCause?: string;
  detailReason?: string;
  processedAt?: string;
  zoneLabel?: string;
}

export interface DraftRequestBody {
  scannedSerial?: string;
  judgment?: "GOOD" | "DEFECTIVE";
  defectCause?: "SHIPPING" | "MANUFACTURER";
  detailReason?: string;
  warehouseNote?: string;
  evidenceUrl?: string;
}

export const returnInspectionApi = {
  pending: () =>
    api.get<ApiResponse<ReturnInspectionSummary[]>>("/admin/return-inspection/pending"),

  drafts: () =>
    api.get<ApiResponse<ReturnInspectionSummary[]>>("/admin/return-inspection/drafts"),

  processed: () =>
    api.get<ApiResponse<ReturnInspectionSummary[]>>("/admin/return-inspection/processed"),

  detail: (id: number) =>
    api.get<ApiResponse<ReturnInspectionDetail>>(`/admin/return-inspection/${id}`),

  defectLabel: (id: number) =>
    api.get<ApiResponse<DefectLabelData>>(`/admin/return-inspection/${id}/defect-label`),

  intake: (code: string) =>
    api.post<ApiResponse<ReturnIntakeResult>>("/admin/return-inspection/intake", { code }),

  saveDraft: (id: number, body: DraftRequestBody) =>
    api.post<ApiResponse<ReturnInspectionDetail>>(
      `/admin/return-inspection/${id}/draft`,
      body
    ),

  cancel: (id: number, cancelReason: string) =>
    api.post<ApiResponse<ReturnInspectionDetail>>(`/admin/return-inspection/${id}/cancel`, {
      cancelReason,
    }),

  process: (
    id: number,
    body: {
      scannedSerial: string;
      judgment: "GOOD" | "DEFECTIVE";
      defectCause?: "SHIPPING" | "MANUFACTURER";
      detailReason?: string;
      warehouseNote?: string;
      evidenceUrl?: string;
      rejectMismatch?: boolean;
      rejectReason?: string;
    }
  ) =>
    api.post<ApiResponse<ReturnInspectionDetail>>(
      `/admin/return-inspection/${id}/process`,
      body
    ),
};

export function printDefectLabel(label: DefectLabelData) {
  const causeLabel =
    label.defectCause === "SHIPPING"
      ? "Lỗi vận chuyển"
      : label.defectCause === "MANUFACTURER"
        ? "Lỗi sản xuất"
        : "Hàng lỗi";

  const html = `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="utf-8" />
  <title>Nhãn cách ly ${label.sheetCode}</title>
  <style>
    @page { size: 80mm 50mm; margin: 4mm; }
    body { font-family: Arial, sans-serif; margin: 0; color: #111; }
    .label { border: 3px solid #DC2626; padding: 8px; border-radius: 4px; }
    .zone { background: #DC2626; color: #fff; font-weight: bold; text-align: center; padding: 6px 4px; font-size: 11px; margin: -8px -8px 8px; letter-spacing: 0.5px; }
    .serial { font-family: monospace; font-size: 18px; font-weight: bold; color: #DC2626; word-break: break-all; }
    .row { font-size: 10px; margin: 4px 0; line-height: 1.35; }
    .row strong { display: inline-block; min-width: 72px; color: #555; }
    .footer { margin-top: 8px; font-size: 9px; color: #666; text-align: center; border-top: 1px dashed #ccc; padding-top: 4px; }
  </style>
</head>
<body onload="window.print(); setTimeout(() => window.close(), 300);">
  <div class="label">
    <div class="zone">${label.zoneLabel ?? "KHU CÁCH LY — HÀNG LỖI"}</div>
    <div class="serial">${label.serialCode ?? "—"}</div>
    <div class="row"><strong>Phiếu:</strong> ${label.sheetCode}</div>
    <div class="row"><strong>Đơn:</strong> ${label.orderCode ?? "—"}</div>
    <div class="row"><strong>Sản phẩm:</strong> ${label.productName ?? "—"}</div>
    <div class="row"><strong>Biến thể:</strong> ${label.variantName ?? "—"} · ${label.skuCode ?? ""}</div>
    <div class="row"><strong>Nguyên nhân:</strong> ${causeLabel}</div>
    ${label.detailReason ? `<div class="row"><strong>Mô tả:</strong> ${label.detailReason}</div>` : ""}
    <div class="footer">${label.processedAt ?? ""} · DEFECTIVE — không bán lại</div>
  </div>
</body>
</html>`;

  const win = window.open("", "_blank", "width=420,height=320");
  if (!win) {
    throw new Error("Trình duyệt chặn cửa sổ in — cho phép popup");
  }
  win.document.write(html);
  win.document.close();
}
