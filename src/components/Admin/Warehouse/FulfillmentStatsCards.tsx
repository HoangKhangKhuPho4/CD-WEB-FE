"use client";

import { useMemo } from "react";
import { useOrdersAdmin } from "@/components/Admin/Orders/ordersAdminStore";

export default function FulfillmentStatsCards() {
  const { orders, totalElements } = useOrdersAdmin();

  const byStatus = useMemo(() => {
    const map: Record<string, number> = {};
    for (const o of orders) {
      const s = (o.status ?? "").toUpperCase();
      map[s] = (map[s] ?? 0) + 1;
    }
    return map;
  }, [orders]);

  const stats = [
    { label: "Trên trang", value: String(orders.length), accent: "#1C274C" },
    { label: "Tổng (bộ lọc)", value: String(totalElements), accent: "#3C50E0" },
    { label: "Chờ xuất", value: String(byStatus.CONFIRMED ?? 0), accent: "#F27430" },
    { label: "Đang giao", value: String(byStatus.SHIPPING ?? 0), accent: "#02AAA4" },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((s) => (
        <div key={s.label} className="bg-white rounded-xl p-5 border border-gray-3/50">
          <p className="text-xs text-[#8D93A5]">{s.label}</p>
          <p className="text-2xl font-bold mt-1" style={{ color: s.accent }}>
            {s.value}
          </p>
        </div>
      ))}
    </div>
  );
}
