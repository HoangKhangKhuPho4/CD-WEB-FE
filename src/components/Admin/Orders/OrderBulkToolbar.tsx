"use client";

import React, { useMemo, useState } from "react";
import { useOrdersAdmin } from "@/components/Admin/Orders/ordersAdminStore";

const BULK_STATUSES = [
  { value: "CONFIRMED", label: "Xác nhận" },
  { value: "PROCESSING", label: "Đang xử lý" },
  { value: "SHIPPING", label: "Đang giao" },
  { value: "DELIVERED", label: "Đã giao" },
  { value: "COMPLETED", label: "Hoàn thành" },
  { value: "CANCELLED", label: "Hủy" },
];

export default function OrderBulkToolbar({
  selectedIds,
  onClear,
}: {
  selectedIds: number[];
  onClear: () => void;
}) {
  const { bulkUpdateStatus } = useOrdersAdmin();
  const [status, setStatus] = useState("CONFIRMED");
  const [note, setNote] = useState("");
  const [applying, setApplying] = useState(false);

  const count = selectedIds.length;
  const disabled = useMemo(() => count === 0 || applying, [count, applying]);

  if (count === 0) return null;

  const handleApply = async () => {
    if (disabled) return;
    setApplying(true);
    try {
      await bulkUpdateStatus(selectedIds, status, note.trim() || undefined);
      onClear();
      setNote("");
    } finally {
      setApplying(false);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-3 p-4 bg-blue/5 border border-blue/20 rounded-xl">
      <span className="text-sm font-medium text-dark">
        Đã chọn <strong>{count}</strong> đơn
      </span>
      <select
        value={status}
        onChange={(e) => setStatus(e.target.value)}
        className="border border-gray-3 rounded-md px-3 py-2 text-sm bg-white"
      >
        {BULK_STATUSES.map((s) => (
          <option key={s.value} value={s.value}>
            {s.label}
          </option>
        ))}
      </select>
      <input
        type="text"
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Ghi chú (tùy chọn)"
        className="flex-1 min-w-[160px] border border-gray-3 rounded-md px-3 py-2 text-sm"
      />
      <button
        type="button"
        disabled={disabled}
        onClick={() => void handleApply()}
        className="px-4 py-2 text-sm font-medium text-white bg-blue rounded-md hover:bg-blue-dark disabled:opacity-50"
      >
        {applying ? "Đang cập nhật..." : "Cập nhật hàng loạt"}
      </button>
      <button
        type="button"
        onClick={onClear}
        className="px-3 py-2 text-sm text-gray-600 hover:text-dark"
      >
        Bỏ chọn
      </button>
    </div>
  );
}
