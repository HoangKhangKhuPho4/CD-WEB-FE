"use client";

import { use } from "react";
import AdminWarehouseSubNav from "@/components/Admin/AdminWarehouseSubNav";
import FulfillmentPickingPanel from "@/components/Admin/Warehouse/FulfillmentPickingPanel";
import PageHeader from "@/components/Admin/shared/PageHeader";

export default function WarehouseOrderFulfillmentPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const { orderId } = use(params);
  const id = Number(orderId);

  if (!Number.isFinite(id)) {
    return <p className="text-sm text-red">Mã đơn không hợp lệ</p>;
  }

  return (
    <div className="space-y-6">
      <AdminWarehouseSubNav />
      <PageHeader
        title="Soạn hàng & quét serial"
        subtitle="Đi đúng kệ · lấy máy FIFO cũ nhất · quét tem · bàn giao shipper"
      />
      <FulfillmentPickingPanel orderId={id} />
    </div>
  );
}
