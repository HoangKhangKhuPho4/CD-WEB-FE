"use client";

import AdminCatalogSubNav from "@/components/Admin/AdminCatalogSubNav";
import PageHeader from "@/components/Admin/shared/PageHeader";
import ReturnManagement from "@/components/Admin/Return/ReturnManagement";

export default function AdminReturnPage() {
  return (
    <div className="space-y-6">
      <AdminCatalogSubNav />
      <PageHeader
        title="Quản lý trả hàng"
        subtitle="Xử lý yêu cầu hoàn trả, đổi trả và hoàn tiền"
      />
      <ReturnManagement />
    </div>
  );
}
