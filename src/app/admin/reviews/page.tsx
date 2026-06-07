"use client";

import AdminSubNav from "@/components/Admin/AdminSubNav";
import { customerLinks } from "@/components/Admin/adminNavConfig";
import PageHeader from "@/components/Admin/shared/PageHeader";
import ReviewManagementTable from "@/components/Admin/Customers/ReviewManagementTable";

export default function AdminReviewsPage() {
  return (
    <div className="space-y-6">
      <AdminSubNav links={customerLinks} />
      <PageHeader
        title="Quản lý đánh giá"
        subtitle="Duyệt, phản hồi và quản lý đánh giá sản phẩm từ khách hàng"
      />
      <ReviewManagementTable />
    </div>
  );
}
