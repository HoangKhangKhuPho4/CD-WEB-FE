"use client";

import AdminProcurementSubNav from "@/components/Admin/AdminProcurementSubNav";
import PageHeader from "@/components/Admin/shared/PageHeader";
import PurchaseOrderQueue from "@/components/Admin/Warehouse/PurchaseOrderQueue";

export default function PurchaseOrdersPage() {
  return (
    <div className="space-y-6">
      <AdminProcurementSubNav />
      <PageHeader
        title="Đơn mua hàng"
        subtitle="Danh sách PO đã duyệt — khi hàng về kho, bấm Kiểm đếm / Nhập kho"
      />
      <PurchaseOrderQueue />
    </div>
  );
}
