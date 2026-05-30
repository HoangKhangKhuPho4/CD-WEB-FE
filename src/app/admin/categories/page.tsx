"use client";

import AdminCatalogSubNav from "@/components/Admin/AdminCatalogSubNav";
import PageHeader from "@/components/Admin/shared/PageHeader";
import CategoryManagement from "@/components/Admin/Categories/CategoryManagement";

export default function AdminCategoriesPage() {
  return (
    <div className="space-y-6">
      <AdminCatalogSubNav />
      <PageHeader
        title="Danh mục & Nhà sản xuất"
        subtitle="Quản lý cấu trúc sản phẩm và nguồn cung ứng toàn hệ thống"
      />
      <CategoryManagement />
    </div>
  );
}
