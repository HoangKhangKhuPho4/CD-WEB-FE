"use client";

import AdminProcurementSubNav from "@/components/Admin/AdminProcurementSubNav";
import PageHeader from "@/components/Admin/shared/PageHeader";
import PoApprovalPanel from "@/components/Admin/Procurement/PoApprovalPanel";

export default function PoManagementPage() {
  return (
    <div className="space-y-6">
      <AdminProcurementSubNav />
      <PageHeader
        title="Duyệt chứng từ"
        subtitle="Phê duyệt hoặc từ chối đơn mua hàng — PO đã duyệt sẽ chuyển xuống kho"
      />
      <PoApprovalPanel />
    </div>
  );
}
