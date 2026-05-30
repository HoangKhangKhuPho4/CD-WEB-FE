"use client";

import AdminSubNav from "@/components/Admin/AdminSubNav";
import { supportLinks } from "@/components/Admin/adminNavConfig";
import PageHeader from "@/components/Admin/shared/PageHeader";
import ReviewManagementTable from "@/components/Admin/Customers/ReviewManagementTable";

export default function AdminReviewsPage() {
  return (
    <div className="space-y-6">
      <AdminSubNav links={supportLinks} />
      <PageHeader
        title="Quản lý đánh giá"
        subtitle="Duyệt, phản hồi và quản lý đánh giá sản phẩm từ khách hàng"
      />
      <ReviewManagementTable />
    </div>
  );
}
