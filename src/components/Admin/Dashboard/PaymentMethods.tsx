"use client";

import { useEffect, useState } from "react";
import { adminStatisticsApi } from "@/utils/adminApi";
import { formatVnd } from "@/utils/adminFormat";

export default function PaymentMethods() {
  const [items, setItems] = useState<
    { label: string; orderCount: number; totalAmount: number; percentage: number; color?: string }[]
  >([]);

  useEffect(() => {
    adminStatisticsApi
      .paymentMethods()
      .then((res) => setItems(res.data.paymentStats ?? []))
      .catch(() => setItems([]));
  }, []);

  return (
    <div className="bg-white rounded-xl p-6 border border-gray-3/50">
      <h3 className="text-lg font-bold text-dark mb-4">Phương thức thanh toán</h3>
      {items.length === 0 ? (
        <p className="text-sm text-[#8D93A5]">Chưa có dữ liệu</p>
      ) : (
        <ul className="space-y-3">
          {items.map((m) => (
            <li key={m.label}>
              <div className="flex justify-between text-sm mb-1">
                <span className="font-medium text-dark">{m.label}</span>
                <span className="text-[#606882]">{m.percentage?.toFixed(1)}%</span>
              </div>
              <div className="h-2 bg-[#F3F4F6] rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-[#3C50E0]"
                  style={{ width: `${m.percentage}%`, backgroundColor: m.color }}
                />
              </div>
              <p className="text-xs text-[#8D93A5] mt-1">
                {m.orderCount} đơn · {formatVnd(m.totalAmount)}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
