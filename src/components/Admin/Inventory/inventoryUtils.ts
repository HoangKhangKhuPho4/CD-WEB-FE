import type { InventoryTransactionType, VariantSearchHit } from "@/utils/adminApi";

export function extractInventoryError(err: unknown, fallback: string): string {
  return (
    (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
    fallback
  );
}

export function downloadInventoryCsv(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function formatVariantLabel(v: Pick<VariantSearchHit, "productName" | "skuCode" | "variantName">): string {
  const product = v.productName?.trim() || "Sản phẩm";
  const sku = v.skuCode ?? v.variantName;
  return sku ? `${product} — ${sku}` : product;
}

export const TX_TYPE_OPTIONS: { value: InventoryTransactionType | ""; label: string }[] = [
  { value: "", label: "Tất cả loại" },
  { value: "IMPORT", label: "Nhập kho" },
  { value: "ADJUSTMENT", label: "Điều chỉnh" },
  { value: "RETURN", label: "Trả hàng" },
  { value: "EXPORT", label: "Xuất kho" },
  { value: "TRANSFER", label: "Chuyển kho" },
];

export function txTypeLabel(type?: string): string {
  return TX_TYPE_OPTIONS.find((o) => o.value === type)?.label ?? type ?? "—";
}
