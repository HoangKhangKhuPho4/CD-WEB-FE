"use client";

import AdminCatalogSubNav from "@/components/Admin/AdminCatalogSubNav";
import PageHeader from "@/components/Admin/shared/PageHeader";
import ProductAttributes from "@/components/Admin/Inventory/ProductAttributes";

export default function AdminAttributesPage() {
  return (
    <div className="space-y-6">
      <AdminCatalogSubNav />
      <PageHeader
        title="Thuộc tính sản phẩm"
        subtitle="Quản lý màu sắc, dung lượng, kích thước và các thuộc tính biến thể"
      />
      <ProductAttributes />
    </div>
  );
}
