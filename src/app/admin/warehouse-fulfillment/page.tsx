"use client";

import AdminWarehouseSubNav from "@/components/Admin/AdminWarehouseSubNav";
import FulfillmentQueuePanel from "@/components/Admin/Warehouse/FulfillmentQueuePanel";
import FulfillmentQueueTable from "@/components/Admin/Warehouse/FulfillmentQueueTable";
import PageHeader from "@/components/Admin/shared/PageHeader";

export default function WarehouseFulfillmentPage() {
  return (
    <div className="space-y-6">
      <AdminWarehouseSubNav />
      <PageHeader
        title="Đơn hàng cần xuất"
        subtitle="Hàng đợi gom hàng — FIFO, quét serial và bàn giao vận chuyển"
      />
      <FulfillmentQueuePanel
        renderTable={(props) => <FulfillmentQueueTable {...props} />}
      />
    </div>
  );
}
