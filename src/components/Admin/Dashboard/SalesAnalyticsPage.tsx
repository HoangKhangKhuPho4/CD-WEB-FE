"use client";

import { useMemo, useState } from "react";
import OrderStatusChart from "@/components/Admin/Dashboard/OrderStatusChart";
import RecentOrders from "@/components/Admin/Dashboard/RecentOrders";
import BestSellingProducts from "@/components/Admin/Dashboard/BestSellingProducts";
import AnalyticsTimeToolbar from "@/components/Admin/Dashboard/AnalyticsTimeToolbar";
import PageHeader from "@/components/Admin/shared/PageHeader";
import {
  resolveAnalyticsDateRange,
  type AnalyticsTimeFilter,
} from "@/utils/analyticsDateRange";

const timeFilters: AnalyticsTimeFilter[] = ["7 ngày", "30 ngày", "Tháng này", "Năm nay"];

/** Báo cáo bán hàng — khớp quyền REPORT_SALES (không doanh thu / export). */
export default function SalesAnalyticsPage() {
  const [activeFilter, setActiveFilter] = useState<AnalyticsTimeFilter>("30 ngày");
  const dateRange = useMemo(() => resolveAnalyticsDateRange(activeFilter), [activeFilter]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Báo cáo bán hàng"
        subtitle={`Thống kê đơn hàng · ${dateRange.fromDate} → ${dateRange.toDate}`}
        action={
          <AnalyticsTimeToolbar
            activeFilter={activeFilter}
            onFilterChange={setActiveFilter}
            showExport={false}
            filters={timeFilters}
          />
        }
      />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <OrderStatusChart dateRange={dateRange} />
        <BestSellingProducts dateRange={dateRange} />
      </div>
      <RecentOrders dateRange={dateRange} />
    </div>
  );
}
