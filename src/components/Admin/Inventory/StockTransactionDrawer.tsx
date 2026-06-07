"use client";

import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { adminInventoryApi, type InventoryTransaction } from "@/utils/adminApi";
import { formatDateTime } from "@/utils/adminFormat";
import { txTypeLabel } from "@/components/Admin/Inventory/inventoryUtils";

export default function StockTransactionDrawer({
  id,
  onClose,
}: {
  id: number | null;
  onClose: () => void;
}) {
  const [detail, setDetail] = useState<InventoryTransaction | null>(null);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    if (id == null) return;
    setLoading(true);
    try {
      const res = await adminInventoryApi.getTransaction(id);
      if (res.data.success) setDetail(res.data.data);
    } catch {
      toast.error("Không tải được chi tiết giao dịch");
      onClose();
    } finally {
      setLoading(false);
    }
  }, [id, onClose]);

  useEffect(() => {
    if (id != null) void load();
    else setDetail(null);
  }, [id, load]);

  if (id == null) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/30 z-40" onClick={onClose} aria-hidden />
      <aside className="fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-xl z-50 flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-3/50">
          <h2 className="text-lg font-bold text-dark">Chi tiết giao dịch #{id}</h2>
          <button type="button" onClick={onClose} className="text-[#8D93A5] hover:text-dark text-xl">
            ×
          </button>
        </div>
        <div className="flex-1 overflow-auto p-6 space-y-4 text-sm">
          {loading ? (
            <p className="text-[#8D93A5]">Đang tải...</p>
          ) : detail ? (
            <>
              <Row label="Loại" value={txTypeLabel(detail.transactionType)} />
              <Row label="Số lượng" value={String(detail.quantity)} />
              <Row label="SKU" value={detail.skuCode ?? "—"} />
              <Row label="Biến thể" value={detail.variantName ?? "—"} />
              <Row label="Variant ID" value={detail.variantId != null ? String(detail.variantId) : "—"} />
              <Row label="IMEI" value={detail.imei ?? "—"} />
              <Row label="Lý do" value={detail.reason ?? "—"} />
              <Row label="Người thực hiện" value={detail.userName ?? "—"} />
              <Row label="Thời gian" value={formatDateTime(detail.createdAt)} />
              {detail.referenceType ? (
                <Row
                  label="Tham chiếu"
                  value={`${detail.referenceType}${detail.referenceId != null ? ` #${detail.referenceId}` : ""}`}
                />
              ) : null}
            </>
          ) : (
            <p className="text-[#8D93A5]">Không có dữ liệu</p>
          )}
        </div>
      </aside>
    </>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-bold text-[#8D93A5] uppercase mb-1">{label}</p>
      <p className="text-dark break-words">{value}</p>
    </div>
  );
}
