"use client";

import BrandGrid from "@/components/Admin/Producers/BrandGrid";
import AdminCatalogSubNav from "@/components/Admin/AdminCatalogSubNav";
import PageHeader from "@/components/Admin/shared/PageHeader";

export default function AdminProducersPage() {
  return (
    <div className="space-y-6">
      <AdminCatalogSubNav />
      <PageHeader
        title="Quản lý thương hiệu"
        subtitle="Quản lý nhà sản xuất, mã code, logo và sản phẩm liên kết — đồng bộ API admin producers"
      />
      <BrandGrid />
    </div>
  );
}
