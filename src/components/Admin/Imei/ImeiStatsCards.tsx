"use client";

import type { ImeiStats } from "@/utils/adminApi";

const cards: {
  key: keyof ImeiStats;
  label: string;
  color: string;
}[] = [
  { key: "total", label: "Tổng thiết bị", color: "from-[#3C50E0] to-[#1C3FB7]" },
  { key: "available", label: "Trong kho", color: "from-green-600 to-green-700" },
  { key: "reserved", label: "Đã giữ đơn", color: "from-slate-500 to-slate-600" },
  { key: "sold", label: "Đã bán", color: "from-indigo-500 to-indigo-600" },
  { key: "inRepair", label: "Bảo hành", color: "from-amber-500 to-amber-600" },
  { key: "defective", label: "Lỗi", color: "from-red-500 to-red-600" },
  { key: "returned", label: "Trả hàng", color: "from-orange-500 to-orange-600" },
  { key: "linkedToOrders", label: "Liên kết đơn", color: "from-violet-500 to-violet-600" },
];

export default function ImeiStatsCards({ stats }: { stats: ImeiStats | null }) {
  if (!stats) return null;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-8 gap-3">
      {cards.map((c) => (
        <div
          key={c.key}
          className={`rounded-xl bg-gradient-to-br ${c.color} text-white p-4 shadow-sm`}
        >
          <p className="text-2xl font-bold">{stats[c.key] ?? 0}</p>
          <p className="text-xs font-medium opacity-90 mt-1">{c.label}</p>
        </div>
      ))}
    </div>
  );
}
