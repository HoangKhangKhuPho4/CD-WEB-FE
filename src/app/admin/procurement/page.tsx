"use client";

import AdminProcurementSubNav from "@/components/Admin/AdminProcurementSubNav";
import PageHeader from "@/components/Admin/shared/PageHeader";
import ProcurementWorkspace from "@/components/Admin/Procurement/ProcurementWorkspace";

export default function ProcurementPage() {
  return (
    <div className="space-y-6">
      <AdminProcurementSubNav />
      <PageHeader
        title="Quản lý mua hàng"
        subtitle="Lập đơn mua hàng từ NCC và theo dõi trạng thái duyệt"
      />
      <ProcurementWorkspace />
    </div>
  );
}
