"use client";

import { useOrdersAdmin } from "@/components/Admin/Orders/ordersAdminStore";

export default function OrderStatsCards() {
  const { orders, pendingCount } = useOrdersAdmin();

  const stats = [
    { label: "Trên trang này", value: String(orders.length) },
    { label: "Chờ xử lý (hệ thống)", value: String(pendingCount) },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {stats.map((s) => (
        <div key={s.label} className="bg-white rounded-xl p-5 border border-gray-3/50">
          <p className="text-xs text-[#8D93A5]">{s.label}</p>
          <p className="text-2xl font-bold text-dark mt-1">{s.value}</p>
        </div>
      ))}
    </div>
  );
}
