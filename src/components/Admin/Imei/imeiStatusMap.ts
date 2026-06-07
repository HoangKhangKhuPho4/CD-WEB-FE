export const IMEI_STATUS_OPTIONS = [
  "AVAILABLE",
  "RESERVED",
  "SOLD",
  "IN_REPAIR",
  "DEFECTIVE",
  "RETURNED",
] as const;

export type ImeiStatusKey = (typeof IMEI_STATUS_OPTIONS)[number];

export const imeiStatusMap: Record<string, { label: string; className: string }> = {
  AVAILABLE: { label: "Trong kho", className: "bg-green-light-6 text-green" },
  RESERVED: { label: "Đã giữ", className: "bg-gray-3 text-[#6C6F93]" },
  SOLD: { label: "Đã bán", className: "bg-[#EEF2FF] text-[#3C50E0]" },
  IN_REPAIR: { label: "Bảo hành", className: "bg-[#FEF3C7] text-yellow-dark-2" },
  DEFECTIVE: { label: "Lỗi", className: "bg-red-light-6 text-red" },
  RETURNED: { label: "Trả hàng", className: "bg-[#FEF3C7] text-yellow-dark-2" },
};

export function imeiStatusLabel(status?: string) {
  const key = String(status ?? "");
  return imeiStatusMap[key]?.label ?? (key || "—");
}

export function imeiStatusClass(status?: string) {
  const key = String(status ?? "");
  return imeiStatusMap[key]?.className ?? "bg-gray-3 text-[#6C6F93]";
}
