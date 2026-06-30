"use client";

import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { adminInventoryApi, type PendingReturnItem } from "@/utils/adminApi";

export default function GhnReturnQueuePanel({ onScan }: { onScan?: (code: string) => void }) {
  const [rows, setRows] = useState<PendingReturnItem[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminInventoryApi.pendingReturns(20);
      setRows(res.data.data ?? []);
    } catch {
      toast.error("Không tải được hàng hoàn GHN");
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  if (loading) {
    return (
      <p className="text-sm text-[#8D93A5] py-4">Đang tải hàng hoàn chờ kiểm định...</p>
    );
  }

  if (rows.length === 0) {
    return (
      <div className="rounded-xl border border-gray-3/50 bg-[#F7F9FC] p-4 text-sm text-[#6C6F93]">
        Không có serial RETURNED chờ kiểm định từ GHN.
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-[#EEF2FF] bg-[#F7F9FC] overflow-hidden">
      <div className="px-4 py-3 border-b border-[#EEF2FF] flex items-center justify-between">
        <p className="text-sm font-bold text-[#3C50E0]">
          Hàng hoàn GHN chờ kiểm định ({rows.length})
        </p>
        <button
          type="button"
          onClick={() => void load()}
          className="text-xs font-semibold text-[#3C50E0] hover:underline"
        >
          Làm mới
        </button>
      </div>
      <ul className="divide-y divide-gray-3/50 max-h-48 overflow-y-auto">
        {rows.map((row) => {
          const code = row.imei ?? row.serialNumber ?? "";
          return (
            <li key={row.productItemId} className="px-4 py-3 flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="text-sm font-medium text-dark">{row.productName ?? "—"}</p>
                <p className="text-xs text-[#8D93A5]">
                  {row.orderCode ? `Đơn ${row.orderCode} · ` : ""}
                  SKU {row.skuCode ?? "—"} · {row.updatedAt}
                </p>
                <p className="text-xs font-mono text-[#3C50E0] mt-0.5">{code}</p>
              </div>
              {code && onScan && (
                <button
                  type="button"
                  onClick={() => onScan(code)}
                  className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-[#3C50E0] text-[#3C50E0] hover:bg-white"
                >
                  Quét kiểm định
                </button>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
