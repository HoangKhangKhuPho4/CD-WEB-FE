"use client";

import { useEffect, useState } from "react";
import { adminStatisticsApi, type OverviewStatistics } from "@/utils/adminApi";
import type { AnalyticsDateRange } from "@/utils/analyticsDateRange";
import { formatPercent, formatVnd } from "@/utils/adminFormat";

const cardStyles = [
  { bg: "from-[#E5EAF4] to-[#E5EAF4]/60", accent: "#3C50E0" },
  { bg: "from-[#DBF4F3] to-[#DBF4F3]/60", accent: "#02AAA4" },
  { bg: "from-[#D0E9F3] to-[#D0E9F3]/60", accent: "#3C50E0" },
  { bg: "from-[#FFECE1] to-[#FFECE1]/60", accent: "#F27430" },
];

export default function StatsCards({ dateRange }: { dateRange?: AnalyticsDateRange }) {
  const [data, setData] = useState<OverviewStatistics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const params = dateRange
      ? { fromDate: dateRange.fromDate, toDate: dateRange.toDate }
      : undefined;
    adminStatisticsApi
      .overview(params)
      .then((res) => setData(res.data))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [dateRange?.fromDate, dateRange?.toDate]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-28 rounded-xl bg-white animate-pulse border border-gray-3/50" />
        ))}
      </div>
    );
  }

  const items = [
    {
      label: "Tổng doanh thu",
      value: formatVnd(data?.totalRevenue),
      change: formatPercent(data?.revenueGrowthPercent),
    },
    {
      label: "Tổng đơn hàng",
      value: String(data?.totalOrders ?? 0),
      change: formatPercent(data?.orderGrowthPercent),
    },
    {
      label: "Khách hàng",
      value: String(data?.totalCustomers ?? 0),
      change: formatPercent(data?.customerGrowthPercent),
    },
    {
      label: "Sản phẩm đã bán",
      value: String(data?.totalProductsSold ?? 0),
      change: "",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {items.map((stat, index) => (
        <div
          key={stat.label}
          className={`bg-gradient-to-br ${cardStyles[index].bg} rounded-xl p-5 border border-gray-3/50 hover:shadow-2 transition-all`}
        >
          <p className="text-xs text-[#606882] mb-1">{stat.label}</p>
          <p className="text-xl font-bold text-dark">{stat.value}</p>
          {stat.change ? (
            <p className="text-xs font-medium text-green mt-2">{stat.change} so với kỳ trước</p>
          ) : null}
        </div>
      ))}
    </div>
  );
}
