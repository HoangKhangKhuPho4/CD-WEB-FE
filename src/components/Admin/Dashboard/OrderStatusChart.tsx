"use client";

import { useEffect, useState } from "react";
import { adminStatisticsApi } from "@/utils/adminApi";

export default function OrderStatusChart() {
  const [breakdown, setBreakdown] = useState<
    { label: string; count: number; percentage: number; color: string }[]
  >([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminStatisticsApi
      .orderStatus()
      .then((res) => setBreakdown(res.data.statusBreakdown ?? []))
      .catch(() => setBreakdown([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="bg-white rounded-xl p-6 border border-gray-3/50">
      <h3 className="text-lg font-bold text-dark mb-6">Đơn hàng theo trạng thái</h3>
      {loading ? (
        <div className="h-[200px] animate-pulse bg-[#F7F9FC] rounded-lg" />
      ) : breakdown.length === 0 ? (
        <p className="text-sm text-[#8D93A5] py-16 text-center">Chưa có dữ liệu</p>
      ) : (
        <ul className="space-y-3">
          {breakdown.map((item) => (
            <li key={item.label}>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-dark font-medium">{item.label}</span>
                <span className="text-[#606882]">
                  {item.count} ({item.percentage}%)
                </span>
              </div>
              <div className="h-2 bg-[#F3F4F6] rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${item.percentage}%`,
                    backgroundColor: item.color || "#3C50E0",
                  }}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
