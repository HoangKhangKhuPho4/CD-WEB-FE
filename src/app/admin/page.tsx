"use client";

import { useMemo, useState } from "react";
import toast from "react-hot-toast";
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
import AnalyticsTimeToolbar from "@/components/Admin/Dashboard/AnalyticsTimeToolbar";
import type { RootState } from "@/redux/store";
import { hasPermission, isAdminUser } from "@/utils/rbac";
import {
  resolveAnalyticsDateRange,
  type AnalyticsTimeFilter,
} from "@/utils/analyticsDateRange";
import { downloadRevenueReportCsv } from "@/utils/exportRevenueReport";

const timeFilters: AnalyticsTimeFilter[] = ["7 ngày", "30 ngày", "Tháng này", "Năm nay"];

function AdminRevenueDashboard() {
  const [activeFilter, setActiveFilter] = useState<AnalyticsTimeFilter>("30 ngày");
  const [exporting, setExporting] = useState(false);
  const dateRange = useMemo(() => resolveAnalyticsDateRange(activeFilter), [activeFilter]);

  const handleExport = async () => {
    setExporting(true);
    try {
      await downloadRevenueReportCsv(dateRange);
      toast.success("Đã tải báo cáo CSV");
    } catch {
      toast.error("Export thất bại");
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-dark">Tổng quan</h1>
          <p className="text-sm text-[#6C6F93] mt-1">
            Hiệu suất hệ thống · {dateRange.fromDate} → {dateRange.toDate}
          </p>
        </div>
        <AnalyticsTimeToolbar
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
          onExport={() => void handleExport()}
          exporting={exporting}
          filters={timeFilters}
        />
      </div>
      <StatsCards dateRange={dateRange} />
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3">
          <RevenueChart dateRange={dateRange} />
        </div>
        <div className="lg:col-span-2">
          <OrderStatusChart dateRange={dateRange} />
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RecentOrders dateRange={dateRange} />
        </div>
        <div className="space-y-6">
          <PendingOrders dateRange={dateRange} />
          <PaymentMethods dateRange={dateRange} />
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <BestSellingProducts dateRange={dateRange} />
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
