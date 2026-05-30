"use client";

import OrderStatusChart from "@/components/Admin/Dashboard/OrderStatusChart";
import RecentOrders from "@/components/Admin/Dashboard/RecentOrders";
import BestSellingProducts from "@/components/Admin/Dashboard/BestSellingProducts";
import PageHeader from "@/components/Admin/shared/PageHeader";

/** Báo cáo bán hàng — khớp electro-store (REPORT_SALES, không doanh thu). */
export default function SalesAnalyticsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Báo cáo bán hàng"
        subtitle="Thống kê đơn hàng và sản phẩm bán chạy (không bao gồm doanh thu tài chính)"
      />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <OrderStatusChart />
        <BestSellingProducts />
      </div>
      <RecentOrders />
    </div>
  );
}
