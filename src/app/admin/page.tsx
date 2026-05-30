"use client";

import { useSelector } from "react-redux";
import StatsCards from "@/components/Admin/Dashboard/StatsCards";
import RevenueChart from "@/components/Admin/Dashboard/RevenueChart";
import OrderStatusChart from "@/components/Admin/Dashboard/OrderStatusChart";
import RecentOrders from "@/components/Admin/Dashboard/RecentOrders";
import PendingOrders from "@/components/Admin/Dashboard/PendingOrders";
import PaymentMethods from "@/components/Admin/Dashboard/PaymentMethods";
import BestSellingProducts from "@/components/Admin/Dashboard/BestSellingProducts";
import LowStockProducts from "@/components/Admin/Dashboard/LowStockProducts";
import StaffDashboard from "@/components/Admin/Dashboard/StaffDashboard";
import type { RootState } from "@/redux/store";
import { hasPermission, isAdminUser } from "@/utils/rbac";
import { useState } from "react";

const timeFilters = ["7 ngày", "30 ngày", "Tháng này"];

function AdminRevenueDashboard() {
  const [activeFilter, setActiveFilter] = useState("7 ngày");

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-dark">Tổng quan</h1>
          <p className="text-sm text-[#6C6F93] mt-1">
            Chào mừng trở lại, đây là hiệu suất hệ thống của bạn.
          </p>
        </div>
        <div className="flex items-center bg-white rounded-lg border border-gray-3 p-1">
          {timeFilters.map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all duration-200 ${
                activeFilter === filter
                  ? "bg-[#1C274C] text-white shadow-sm"
                  : "text-[#6C6F93] hover:text-dark"
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>
      <StatsCards />
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3">
          <RevenueChart />
        </div>
        <div className="lg:col-span-2">
          <OrderStatusChart />
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RecentOrders />
        </div>
        <div className="space-y-6">
          <PendingOrders />
          <PaymentMethods />
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <BestSellingProducts />
        <LowStockProducts />
      </div>
    </div>
  );
}

export default function AdminDashboardPage() {
  const user = useSelector((s: RootState) => s.authReducer.user);
  const showRevenueDashboard =
    isAdminUser(user) || hasPermission(user, "REPORT_REVENUE");

  if (!showRevenueDashboard) {
    return <StaffDashboard />;
  }

  return <AdminRevenueDashboard />;
}
