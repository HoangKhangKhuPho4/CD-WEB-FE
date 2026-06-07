export function extractWarrantyError(err: unknown, fallback: string): string {
  return (
    (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
    fallback
  );
}

export function downloadWarrantyCsv(blob: Blob, filename = "warranty-tickets.csv") {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export const WARRANTY_STATUS_OPTIONS = [
  { value: "", label: "Tất cả trạng thái" },
  { value: "PENDING", label: "Chờ kiểm tra" },
  { value: "IN_PROGRESS", label: "Đang sửa chữa" },
  { value: "COMPLETED", label: "Đã sửa xong" },
  { value: "RETURNED", label: "Đã trả khách" },
  { value: "CANCELLED", label: "Đã hủy" },
] as const;

export function warrantyStatusLabel(status?: string): string {
  const u = (status ?? "").toUpperCase();
  return WARRANTY_STATUS_OPTIONS.find((o) => o.value === u)?.label ?? status ?? "—";
}

const STATUS_BADGE: Record<string, { dot: string; className: string }> = {
  PENDING: { dot: "bg-yellow-dark-2", className: "bg-[#FEF3C7] text-yellow-dark-2" },
  IN_PROGRESS: { dot: "bg-[#3C50E0]", className: "bg-[#EEF2FF] text-[#3C50E0]" },
  COMPLETED: { dot: "bg-green", className: "bg-green-light-6 text-green" },
  RETURNED: { dot: "bg-[#6C6F93]", className: "bg-[#F7F9FC] text-[#6C6F93]" },
  CANCELLED: { dot: "bg-red", className: "bg-red-light-6 text-red" },
};

export function warrantyStatusBadge(status?: string) {
  const u = (status ?? "PENDING").toUpperCase();
  return (
    STATUS_BADGE[u] ?? {
      dot: "bg-[#8D93A5]",
      className: "bg-[#F7F9FC] text-[#8D93A5]",
    }
  );
}
