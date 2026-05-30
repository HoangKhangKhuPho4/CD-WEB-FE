"use client";

import { useState } from "react";
import OrderStatsCards from "@/components/Admin/Orders/OrderStatsCards";
import OrderFilters from "@/components/Admin/Orders/OrderFilters";
import OrderTable from "@/components/Admin/Orders/OrderTable";
import OrderPagination from "@/components/Admin/Orders/OrderPagination";
import OrderDetailModal from "@/components/Admin/Orders/OrderDetailModal";
import PageHeader from "@/components/Admin/shared/PageHeader";
import { OrdersAdminProvider } from "@/components/Admin/Orders/ordersAdminStore";

export default function AdminOrdersPage() {
  const [detailId, setDetailId] = useState<number | null>(null);

  return (
    <OrdersAdminProvider>
      <div className="space-y-6">
        <PageHeader title="Quản lý đơn hàng" subtitle="Theo dõi và cập nhật trạng thái đơn từ hệ thống" />
        <OrderStatsCards />
        <OrderFilters />
        <OrderTable onView={setDetailId} />
        <OrderPagination />
        <OrderDetailModal
          open={detailId != null}
          onClose={() => setDetailId(null)}
          orderId={detailId}
        />
      </div>
    </OrdersAdminProvider>
  );
}
