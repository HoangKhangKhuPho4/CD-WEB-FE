"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { IconAlertTriangle } from "@/components/Admin/icons/AdminIcons";
import { adminInventoryApi, type InventoryStatRow } from "@/utils/adminApi";

const PREVIEW_LIMIT = 10;

function isLowStockRow(row: InventoryStatRow) {
  const status = (row.status ?? "").toUpperCase();
  return status === "LOW_STOCK" || status === "OUT_OF_STOCK";
}

function statusLabel(row: InventoryStatRow) {
  const status = (row.status ?? "").toUpperCase();
  if (status === "OUT_OF_STOCK" || (row.stockQuantity ?? 0) <= 0) {
    return { text: "Hết hàng", className: "bg-red-light-6 text-red" };
  }
  return { text: "Sắp hết", className: "bg-[#FFF9EB] text-yellow-dark-2" };
}

export default function LowStockProducts() {
  const [rows, setRows] = useState<InventoryStatRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    adminInventoryApi
      .stats()
      .then((res) => {
        const all = res.data.data ?? [];
        const low = all
          .filter(isLowStockRow)
          .sort((a, b) => (a.stockQuantity ?? 0) - (b.stockQuantity ?? 0));
        setRows(low);
      })
      .catch(() => {
        setRows([]);
        setError("Không tải được danh sách tồn kho thấp");
      })
      .finally(() => setLoading(false));
  }, []);

  const preview = useMemo(() => rows.slice(0, PREVIEW_LIMIT), [rows]);
  const remaining = Math.max(0, rows.length - PREVIEW_LIMIT);

  return (
    <div className="bg-white rounded-xl border border-gray-3/50 overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 border-b border-gray-3/40 bg-[#FAFBFC]">
        <div>
          <h3 className="text-lg font-bold text-dark">Tồn kho thấp</h3>
          <p className="text-xs text-[#8D93A5] mt-0.5">
            Biến thể ở ngưỡng cảnh báo hoặc hết hàng
          </p>
        </div>
        {rows.length > 0 && (
          <Link
            href="/admin/inventory"
            className="text-sm font-semibold text-[#3C50E0] hover:underline"
          >
            Xem báo cáo tồn kho ({rows.length})
          </Link>
        )}
      </div>

      <div className="p-6">
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-10 rounded-lg bg-gray-2 animate-pulse" />
            ))}
          </div>
        ) : error ? (
          <p className="text-sm text-red inline-flex items-center gap-2">
            <IconAlertTriangle size={16} className="shrink-0" />
            {error}
          </p>
        ) : rows.length === 0 ? (
          <p className="text-sm text-[#8D93A5]">Không có cảnh báo tồn kho</p>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[520px]">
                <thead>
                  <tr className="text-left text-xs text-[#8D93A5] uppercase">
                    <th className="pb-3 font-semibold">Sản phẩm</th>
                    <th className="pb-3 font-semibold">SKU</th>
                    <th className="pb-3 text-center font-semibold">Tồn</th>
                    <th className="pb-3 text-center font-semibold">Ngưỡng</th>
                    <th className="pb-3 text-center font-semibold">Trạng thái</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-3/30">
                  {preview.map((row) => {
                    const badge = statusLabel(row);
                    return (
                      <tr key={row.variantId}>
                        <td className="py-3 pr-3">
                          <p className="font-medium text-dark truncate max-w-[220px]">
                            {row.productName}
                          </p>
                          {row.variantName && (
                            <p className="text-xs text-[#8D93A5] truncate max-w-[220px]">
                              {row.variantName}
                            </p>
                          )}
                        </td>
                        <td className="py-3 font-mono text-xs text-[#6C6F93]">
                          {row.skuCode ?? "—"}
                        </td>
                        <td className="py-3 text-center font-bold text-red tabular-nums">
                          {row.stockQuantity ?? 0}
                        </td>
                        <td className="py-3 text-center text-[#6C6F93] tabular-nums">
                          {row.lowStockThreshold ?? 10}
                        </td>
                        <td className="py-3 text-center">
                          <span
                            className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${badge.className}`}
                          >
                            {badge.text}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {remaining > 0 && (
              <p className="text-xs text-[#8D93A5] mt-4">
                Và {remaining} biến thể khác —{" "}
                <Link href="/admin/inventory" className="text-[#3C50E0] font-semibold hover:underline">
                  mở báo cáo tồn kho
                </Link>
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
