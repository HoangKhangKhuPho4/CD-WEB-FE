"use client";

import OrderStatusChart from "@/components/Admin/Dashboard/OrderStatusChart";
import RecentOrders from "@/components/Admin/Dashboard/RecentOrders";
import BestSellingProducts from "@/components/Admin/Dashboard/BestSellingProducts";
import AnalyticsTimeToolbar from "@/components/Admin/Dashboard/AnalyticsTimeToolbar";
import PageHeader from "@/components/Admin/shared/PageHeader";
import { useAnalyticsTimeRange } from "@/hooks/useAnalyticsTimeRange";

/** Báo cáo bán hàng — khớp quyền REPORT_SALES (không doanh thu / export). */
export default function SalesAnalyticsPage() {
  const {
    activeFilter,
    customFromDate,
    customToDate,
    setCustomFromDate,
    setCustomToDate,
    dateRange,
    handleFilterChange,
    filters,
  } = useAnalyticsTimeRange();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Báo cáo bán hàng"
        subtitle={`Thống kê đơn hàng · ${dateRange.fromDate} → ${dateRange.toDate}`}
        action={
          <AnalyticsTimeToolbar
            activeFilter={activeFilter}
            onFilterChange={handleFilterChange}
            customFromDate={customFromDate}
            customToDate={customToDate}
            onCustomFromDateChange={setCustomFromDate}
            onCustomToDateChange={setCustomToDate}
            showExport={false}
            filters={filters}
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
