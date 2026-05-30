"use client";

import { useSelector } from "react-redux";
import StatsCards from "@/components/Admin/Dashboard/StatsCards";
import RevenueChart from "@/components/Admin/Dashboard/RevenueChart";
import OrderStatusChart from "@/components/Admin/Dashboard/OrderStatusChart";
import BestSellingProducts from "@/components/Admin/Dashboard/BestSellingProducts";
import PaymentMethods from "@/components/Admin/Dashboard/PaymentMethods";
import PageHeader from "@/components/Admin/shared/PageHeader";
import SalesAnalyticsPage from "@/components/Admin/Dashboard/SalesAnalyticsPage";
import type { RootState } from "@/redux/store";
import { hasPermission, isAdminUser } from "@/utils/rbac";
import { useState } from "react";

const timeFilters = ["7 ngày", "30 ngày", "Tháng này", "Năm nay"];

function RevenueAnalyticsPage() {
  const [activeFilter, setActiveFilter] = useState("30 ngày");

  return (
    <div className="space-y-6">
      <PageHeader
        title="Thống kê & Báo cáo"
        subtitle="Phân tích doanh thu, đơn hàng và hiệu suất bán hàng"
        action={
          <div className="flex items-center bg-white rounded-lg border border-gray-3 p-1">
            {timeFilters.map((filter) => (
              <button
                key={filter}
                type="button"
                onClick={() => setActiveFilter(filter)}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                  activeFilter === filter ? "bg-[#1C274C] text-white" : "text-[#6C6F93] hover:text-dark"
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        }
      />
      <StatsCards />
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3">
          <RevenueChart />
        </div>
        <div className="lg:col-span-2">
          <OrderStatusChart />
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <BestSellingProducts />
        <PaymentMethods />
      </div>
    </div>
  );
}

export default function AdminAnalyticsPage() {
  const user = useSelector((s: RootState) => s.authReducer.user);
  const showRevenue = isAdminUser(user) || hasPermission(user, "REPORT_REVENUE");

  if (!showRevenue && hasPermission(user, "REPORT_SALES")) {
    return <SalesAnalyticsPage />;
  }

  return <RevenueAnalyticsPage />;
}
