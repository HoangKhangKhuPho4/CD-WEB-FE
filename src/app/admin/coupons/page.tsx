"use client";

import AdminCatalogSubNav from "@/components/Admin/AdminCatalogSubNav";
import PageHeader from "@/components/Admin/shared/PageHeader";
import CouponManagement from "@/components/Admin/Inventory/CouponManagement";

export default function AdminCouponsPage() {
  return (
    <div className="space-y-6">
      <AdminCatalogSubNav />
      <PageHeader
        title="Mã giảm giá"
        subtitle="Tạo và quản lý mã khuyến mãi, voucher cho khách hàng"
      />
      <CouponManagement />
    </div>
  );
}
