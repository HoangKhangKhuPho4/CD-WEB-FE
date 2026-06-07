"use client";

import { IMEI_STATUS_OPTIONS, imeiStatusMap } from "@/components/Admin/Imei/imeiStatusMap";

export default function ImeiBulkBar({
  count,
  bulkStatus,
  onBulkStatusChange,
  onApply,
  onClear,
  applying,
}: {
  count: number;
  bulkStatus: string;
  onBulkStatusChange: (s: string) => void;
  onApply: () => void;
  onClear: () => void;
  applying?: boolean;
}) {
  if (count === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-3 bg-[#EEF2FF] border border-[#3C50E0]/20 rounded-xl px-4 py-3">
      <span className="text-sm font-semibold text-[#3C50E0]">Đã chọn {count} thiết bị</span>
      <select
        value={bulkStatus}
        onChange={(e) => onBulkStatusChange(e.target.value)}
        className="px-3 py-2 border border-gray-3 rounded-lg text-sm bg-white"
      >
        {IMEI_STATUS_OPTIONS.map((s) => (
          <option key={s} value={s}>
            {imeiStatusMap[s]?.label ?? s}
          </option>
        ))}
      </select>
      <button
        type="button"
        onClick={onApply}
        disabled={applying}
        className="px-4 py-2 bg-[#3C50E0] text-white text-sm font-semibold rounded-lg disabled:opacity-50"
      >
        {applying ? "Đang cập nhật..." : "Áp dụng hàng loạt"}
      </button>
      <button type="button" onClick={onClear} className="text-sm text-[#6C6F93] hover:text-dark">
        Bỏ chọn
      </button>
    </div>
  );
}
