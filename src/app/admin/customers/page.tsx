"use client";

import AdminSubNav from "@/components/Admin/AdminSubNav";
import { customerLinks } from "@/components/Admin/adminNavConfig";
import CustomerManagement from "@/components/Admin/Customers/CustomerManagement";
import PageHeader from "@/components/Admin/shared/PageHeader";
import { useSelector } from "react-redux";
import type { RootState } from "@/redux/store";
import { hasAnyPermission } from "@/utils/rbac";

export default function CustomersPage() {
  const user = useSelector((s: RootState) => s.authReducer.user);
  const canViewCustomers = hasAnyPermission(user, ["USER_MANAGE", "CUSTOMER_VIEW", "ROLE_ADMIN"]);
  const canManageCustomers = hasAnyPermission(user, ["USER_MANAGE", "ROLE_ADMIN"]);

  if (!canViewCustomers) {
    return null;
  }

  return (
    <div className="space-y-6">
      <AdminSubNav links={customerLinks} />
      <PageHeader
        title="Quản lý khách hàng"
        subtitle="Tài khoản mua hàng (CUSTOMER). Nhân viên nội bộ quản lý tại mục Nhân viên & Phân quyền."
      />
      <CustomerManagement canManage={canManageCustomers} />
    </div>
  );
}
