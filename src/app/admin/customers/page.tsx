"use client";

import AdminSubNav from "@/components/Admin/AdminSubNav";
import { customerLinks } from "@/components/Admin/adminNavConfig";
import CustomerList from "@/components/Admin/Customers/CustomerList";
import CustomerReviews from "@/components/Admin/Customers/CustomerReviews";
import ReviewManagementTable from "@/components/Admin/Customers/ReviewManagementTable";
import { useState } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "@/redux/store";
import { hasAnyPermission } from "@/utils/rbac";

export default function CustomersPage() {
  const user = useSelector((s: RootState) => s.authReducer.user);
  const canViewCustomers = hasAnyPermission(user, ["USER_MANAGE", "CUSTOMER_VIEW", "ROLE_ADMIN"]);
  const canManageReviews = hasAnyPermission(user, ["PRODUCT_MANAGE", "WARRANTY_MANAGE"]);
  const [activeTab, setActiveTab] = useState(canViewCustomers ? "customers" : "reviews");

  return (
    <div className="space-y-6">
      <AdminSubNav links={customerLinks} />

      {(canViewCustomers || canManageReviews) && (
        <div className="flex bg-white rounded-lg p-1 w-fit border border-gray-3/50 shadow-sm flex-wrap gap-1">
          {canViewCustomers && (
            <button
              onClick={() => setActiveTab("customers")}
              className={`px-4 py-2 rounded-md text-sm font-semibold transition-all ${
                activeTab === "customers"
                  ? "bg-[#3C50E0] text-white shadow-md"
                  : "text-[#6C6F93] hover:text-dark hover:bg-gray-1"
              }`}
            >
              Khách hàng
            </button>
          )}
          {canManageReviews && (
            <button
              onClick={() => setActiveTab("reviews")}
              className={`px-4 py-2 rounded-md text-sm font-semibold transition-all ${
                activeTab === "reviews"
                  ? "bg-[#3C50E0] text-white shadow-md"
                  : "text-[#6C6F93] hover:text-dark hover:bg-gray-1"
              }`}
            >
              Quản lý đánh giá
            </button>
          )}
        </div>
      )}

      {activeTab === "customers" && canViewCustomers ? (
        <div className="space-y-8">
          <div>
            <h1 className="text-2xl font-bold text-dark">Quản lý khách hàng</h1>
            <p className="text-sm text-[#6C6F93] mt-1">
              Tài khoản đăng ký mua hàng (vai trò Khách hàng). Nhân viên &amp; Admin quản lý tại{" "}
              <span className="font-medium text-dark">Nhân viên &amp; Phân quyền</span>.
            </p>
          </div>
          <CustomerList />
          <CustomerReviews />
        </div>
      ) : (
        <ReviewManagementTable />
      )}
    </div>
  );
}
