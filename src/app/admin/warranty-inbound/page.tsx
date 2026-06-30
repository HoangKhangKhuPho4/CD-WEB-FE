"use client";

import AdminWarehouseSubNav from "@/components/Admin/AdminWarehouseSubNav";
import PageHeader from "@/components/Admin/shared/PageHeader";
import WarrantyInboundPanel from "@/components/Admin/Warehouse/WarrantyInboundPanel";

export default function WarrantyInboundPage() {
  return (
    <div className="space-y-6">
      <AdminWarehouseSubNav />
      <PageHeader
        title="Tiếp nhận bảo hành tại kho"
        subtitle="Tra cứu thiết bị và xác nhận kho đã nhận máy từ khách"
      />
      <WarrantyInboundPanel />
    </div>
  );
}
