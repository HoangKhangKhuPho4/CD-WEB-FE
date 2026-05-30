"use client";

import AdminSubNav from "@/components/Admin/AdminSubNav";
import { contentLinks } from "@/components/Admin/adminNavConfig";
import PageHeader from "@/components/Admin/shared/PageHeader";
import BannerManagement from "@/components/Admin/Banners/BannerManagement";

export default function AdminBannersPage() {
  return (
    <div className="space-y-6">
      <AdminSubNav links={contentLinks} />
      <PageHeader
        title="Quản lý Banner"
        subtitle="Banner trang chủ, danh mục và các vị trí quảng cáo"
      />
      <BannerManagement />
    </div>
  );
}
