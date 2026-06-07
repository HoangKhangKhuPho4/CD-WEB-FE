"use client";

import { useEffect, useState } from "react";
import { adminStatisticsApi, type ConversionRateStat } from "@/utils/adminApi";

export default function ConversionRatePanel({ limit = 8 }: { limit?: number }) {
  const [rows, setRows] = useState<ConversionRateStat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    adminStatisticsApi
      .conversionRate()
      .then((res) => {
        const list = [...(res.data.productRates ?? [])].sort(
          (a, b) => (b.conversionRate ?? 0) - (a.conversionRate ?? 0)
        );
        setRows(list.slice(0, limit));
      })
      .catch(() => setRows([]))
      .finally(() => setLoading(false));
  }, [limit]);

  const maxRate = Math.max(...rows.map((r) => r.conversionRate ?? 0), 1);

  return (
    <div className="bg-white rounded-xl p-6 border border-gray-3/50">
      <h3 className="text-lg font-bold text-dark mb-1">Tỷ lệ chuyển đổi sản phẩm</h3>
      <p className="text-xs text-[#8D93A5] mb-4">Lượt xem → lượt mua (toàn hệ thống)</p>
      {loading ? (
        <div className="h-40 animate-pulse bg-[#F7F9FC] rounded-lg" />
      ) : rows.length === 0 ? (
        <p className="text-sm text-[#8D93A5] py-8 text-center">Chưa có dữ liệu tương tác</p>
      ) : (
        <ul className="space-y-3">
          {rows.map((row) => (
            <li key={row.productId ?? row.productName}>
              <div className="flex justify-between text-sm mb-1 gap-2">
                <span className="font-medium text-dark truncate">{row.productName ?? "—"}</span>
                <span className="text-[#3C50E0] font-semibold whitespace-nowrap">
                  {(row.conversionRate ?? 0).toFixed(1)}%
                </span>
              </div>
              <div className="h-2 bg-[#F3F4F6] rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-[#9333EA]"
                  style={{ width: `${((row.conversionRate ?? 0) / maxRate) * 100}%` }}
                />
              </div>
              <p className="text-[10px] text-[#8D93A5] mt-1">
                {row.viewCount ?? 0} lượt xem · {row.purchaseCount ?? 0} lượt mua
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
