"use client";

import AdminCatalogSubNav from "@/components/Admin/AdminCatalogSubNav";
import PageHeader from "@/components/Admin/shared/PageHeader";
import ImeiManagement from "@/components/Admin/Imei/ImeiManagement";

export default function AdminImeiPage() {
  return (
    <div className="space-y-6">
      <AdminCatalogSubNav />
      <PageHeader
        title="Quản lý IMEI / Serial"
        subtitle="Theo dõi mã thiết bị từ nhập kho đến bán hàng và bảo hành"
      />
      <ImeiManagement />
    </div>
  );
}
