"use client";

import AdminWarehouseSubNav from "@/components/Admin/AdminWarehouseSubNav";
import PageHeader from "@/components/Admin/shared/PageHeader";
import InventoryAuditPanel from "@/components/Admin/Warehouse/InventoryAuditPanel";

export default function InventoryAuditPage() {
  return (
    <div className="space-y-6">
      <AdminWarehouseSubNav />
      <PageHeader
        title="Kiểm kê kho"
        subtitle="Wizard 3 bước: Tạo phiếu → Quét serial (súng quét / Excel) → Báo cáo đối chiếu & duyệt"
      />
      <InventoryAuditPanel />
    </div>
  );
}
