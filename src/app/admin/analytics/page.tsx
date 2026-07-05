"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";
import StatsCards from "@/components/Admin/Dashboard/StatsCards";
import RevenueChart from "@/components/Admin/Dashboard/RevenueChart";
import OrderStatusChart from "@/components/Admin/Dashboard/OrderStatusChart";
import BestSellingProducts from "@/components/Admin/Dashboard/BestSellingProducts";
import PaymentMethods from "@/components/Admin/Dashboard/PaymentMethods";
import RecentOrders from "@/components/Admin/Dashboard/RecentOrders";
import ConversionRatePanel from "@/components/Admin/Dashboard/ConversionRatePanel";
import CustomerSegmentsPanel from "@/components/Admin/Dashboard/CustomerSegmentsPanel";
import AnalyticsTimeToolbar from "@/components/Admin/Dashboard/AnalyticsTimeToolbar";
import PageHeader from "@/components/Admin/shared/PageHeader";
import SalesAnalyticsPage from "@/components/Admin/Dashboard/SalesAnalyticsPage";
import { useAnalyticsTimeRange } from "@/hooks/useAnalyticsTimeRange";
import type { RootState } from "@/redux/store";
import { hasPermission, isAdminUser } from "@/utils/rbac";
import { downloadRevenueReportCsv } from "@/utils/exportRevenueReport";

function RevenueAnalyticsPage() {
  const {
    activeFilter,
    customFromDate,
    customToDate,
    setCustomFromDate,
    setCustomToDate,
    dateRange,
    handleFilterChange,
    filters,
  } = useAnalyticsTimeRange();
  const [exporting, setExporting] = useState(false);

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
      <PageHeader
        title="Thống kê & Báo cáo"
        subtitle={`Phân tích doanh thu · ${dateRange.fromDate} → ${dateRange.toDate}`}
        action={
          <AnalyticsTimeToolbar
            activeFilter={activeFilter}
            onFilterChange={handleFilterChange}
            customFromDate={customFromDate}
            customToDate={customToDate}
            onCustomFromDateChange={setCustomFromDate}
            onCustomToDateChange={setCustomToDate}
            onExport={() => void handleExport()}
            exporting={exporting}
            filters={filters}
          />
        }
      />
      <StatsCards dateRange={dateRange} />
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3">
          <RevenueChart dateRange={dateRange} />
        </div>
        <div className="lg:col-span-2">
          <OrderStatusChart dateRange={dateRange} />
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <BestSellingProducts dateRange={dateRange} />
        <PaymentMethods dateRange={dateRange} />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ConversionRatePanel />
        <CustomerSegmentsPanel />
      </div>
      <RecentOrders dateRange={dateRange} />
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
