"use client";

import { useEffect, useState } from "react";
import { adminStatisticsApi } from "@/utils/adminApi";
import type { AnalyticsDateRange } from "@/utils/analyticsDateRange";
import { formatVnd } from "@/utils/adminFormat";

export default function RevenueChart({ dateRange }: { dateRange?: AnalyticsDateRange }) {
  const [period, setPeriod] = useState<"day" | "month" | "year">("month");
  const [points, setPoints] = useState<{ label: string; revenue: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const chartPeriod = dateRange?.chartPeriod ?? period;
    const params = dateRange
      ? { startDate: dateRange.fromDate, endDate: dateRange.toDate }
      : undefined;
    adminStatisticsApi
      .revenueChart(chartPeriod, params)
      .then((res) => {
        const list = res.data.dataPoints ?? [];
        setPoints(list.map((p) => ({ label: p.label, revenue: Number(p.revenue) || 0 })));
      })
      .catch(() => setPoints([]))
      .finally(() => setLoading(false));
  }, [dateRange?.fromDate, dateRange?.toDate, dateRange?.chartPeriod, period]);

  const maxValue = Math.max(...points.map((d) => d.revenue), 1);

  return (
    <div className="bg-white rounded-xl p-6 border border-gray-3/50">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-dark">Doanh thu</h3>
        {dateRange ? (
          <span className="text-xs text-[#8D93A5]">
            {dateRange.fromDate} → {dateRange.toDate}
          </span>
        ) : (
          <div className="flex gap-1 bg-[#F7F9FC] rounded-lg p-1">
            {(["day", "month", "year"] as const).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPeriod(p)}
                className={`px-3 py-1 text-xs font-medium rounded-md ${
                  period === p ? "bg-[#3C50E0] text-white" : "text-[#606882]"
                }`}
              >
                {p === "day" ? "Ngày" : p === "month" ? "Tháng" : "Năm"}
              </button>
            ))}
          </div>
        )}
      </div>
      {loading ? (
        <div className="h-[200px] animate-pulse bg-[#F7F9FC] rounded-lg" />
      ) : points.length === 0 ? (
        <p className="text-sm text-[#8D93A5] py-16 text-center">Chưa có dữ liệu doanh thu</p>
      ) : (
        <div className="flex items-end justify-between gap-2 h-[200px]">
          {points.map((item) => {
            const h = (item.revenue / maxValue) * 100;
            return (
              <div key={item.label} className="flex flex-col items-center flex-1 min-w-0">
                <div className="w-full flex justify-center h-[170px] items-end">
                  <div
                    className="w-full max-w-[36px] rounded-t-lg bg-[#3C50E0]/80"
                    style={{ height: `${Math.max(h, 4)}%` }}
                    title={formatVnd(item.revenue)}
                  />
                </div>
                <span className="text-[10px] text-[#8D93A5] mt-2 truncate w-full text-center">
                  {item.label}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
