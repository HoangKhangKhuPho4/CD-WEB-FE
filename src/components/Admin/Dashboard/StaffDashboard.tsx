"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSelector } from "react-redux";
import {
  adminStatisticsApi,
  type StaffOverviewStatistics,
} from "@/utils/adminApi";
import type { RootState } from "@/redux/store";
import { hasAnyPermission, hasPermission, isWarehouseOnlyUser } from "@/utils/rbac";
import { useAnalyticsTimeRange } from "@/hooks/useAnalyticsTimeRange";
import AnalyticsTimeToolbar from "@/components/Admin/Dashboard/AnalyticsTimeToolbar";
import OrderStatusChart from "@/components/Admin/Dashboard/OrderStatusChart";
import RecentOrders from "@/components/Admin/Dashboard/RecentOrders";
import LowStockProducts from "@/components/Admin/Dashboard/LowStockProducts";
import BestSellingProducts from "@/components/Admin/Dashboard/BestSellingProducts";

function StatCard({
  label,
  value,
  href,
  accent,
}: {
  label: string;
  value: number | string;
  href?: string;
  accent: string;
}) {
  const inner = (
    <div
      className={`rounded-xl border border-gray-3/50 bg-white p-5 hover:shadow-2 transition-shadow ${
        href ? "cursor-pointer" : ""
      }`}
    >
      <p className="text-xs font-medium text-[#8D93A5] uppercase tracking-wide">{label}</p>
      <p className="text-2xl font-bold mt-2" style={{ color: accent }}>
        {value}
      </p>
    </div>
  );
  if (href) return <Link href={href}>{inner}</Link>;
  return inner;
}

export default function StaffDashboard() {
  const user = useSelector((s: RootState) => s.authReducer.user);
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
  const [data, setData] = useState<StaffOverviewStatistics | null>(null);
  const [loading, setLoading] = useState(true);

  const warehouseOnly = isWarehouseOnlyUser(user);
  const isWarehouse = warehouseOnly || hasAnyPermission(user, ["STOCK_IMPORT", "IMEI_MANAGE", "INVENTORY_STAT"]);
  const isSales =
    user?.roles?.some((r) => (r.name ?? "").toUpperCase() === "SALES") ?? false;
  const showLowStock = isWarehouse || hasPermission(user, "INVENTORY_STAT");
  const showSalesProducts = isSales || hasPermission(user, "REPORT_REVENUE");

  useEffect(() => {
    setLoading(true);
    adminStatisticsApi
      .staffOverview({
        fromDate: dateRange.fromDate,
        toDate: dateRange.toDate,
      })
      .then((res) => setData(res.data))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [dateRange.fromDate, dateRange.toDate]);

  if (loading && !data) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-28 rounded-xl bg-white animate-pulse border border-gray-3/50" />
        ))}
      </div>
    );
  }

  const ordersHref = warehouseOnly ? "/admin/warehouse-fulfillment" : "/admin/orders";

  const title = isWarehouse && !isSales
    ? "Tổng quan kho"
    : isSales && !isWarehouse
      ? "Tổng quan bán hàng"
      : "Tổng quan công việc";

  const subtitle = isSales && !isWarehouse
    ? "Xử lý đơn hàng, báo cáo bán hàng và quản lý phiếu bảo hành — theo vai trò Sales."
    : isWarehouse && !isSales
      ? "Theo dõi đơn hàng, tồn kho, xuất hàng và quản lý phiếu bảo hành thiết bị."
      : "Theo dõi đơn hàng và công việc cần xử lý trong kỳ đã chọn.";

  const ordersLabel =
    activeFilter === "Tháng này"
      ? "Đơn tháng này"
      : activeFilter === "Năm nay"
        ? "Đơn năm nay"
        : "Đơn trong kỳ";

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-dark">{title}</h1>
          <p className="text-sm text-[#6C6F93] mt-1">
            {subtitle} · {dateRange.fromDate} → {dateRange.toDate}
          </p>
        </div>
        <AnalyticsTimeToolbar
          activeFilter={activeFilter}
          onFilterChange={handleFilterChange}
          customFromDate={customFromDate}
          customToDate={customToDate}
          onCustomFromDateChange={setCustomFromDate}
          onCustomToDateChange={setCustomToDate}
          showExport={false}
          filters={filters}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          label="Đơn chờ xác nhận"
          value={data?.pendingOrders ?? 0}
          href={warehouseOnly ? undefined : "/admin/orders"}
          accent="#F27430"
        />
        <StatCard
          label="Đã xác nhận"
          value={data?.confirmedOrders ?? 0}
          href={ordersHref}
          accent="#3C50E0"
        />
        <StatCard
          label="Đang giao hàng"
          value={data?.shippingOrders ?? 0}
          href={ordersHref}
          accent="#02AAA4"
        />
        <StatCard
          label={ordersLabel}
          value={data?.ordersToday ?? 0}
          href={ordersHref}
          accent="#1C274C"
        />
      </div>

      {showLowStock && (data?.lowStockVariants ?? 0) > 0 && (
        <div className="rounded-xl border border-red/20 bg-red-light-6/30 px-5 py-4 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm font-medium text-red">
            Có {data?.lowStockVariants} biến thể sắp hết / hết hàng
          </p>
          <Link
            href="/admin/inventory"
            className="text-sm font-semibold text-[#3C50E0] hover:underline"
          >
            Xem kho →
          </Link>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3">
          <RecentOrders dateRange={dateRange} />
        </div>
        <div className="lg:col-span-2">
          <OrderStatusChart dateRange={dateRange} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {showSalesProducts && <BestSellingProducts dateRange={dateRange} />}
        {showLowStock && <LowStockProducts />}
      </div>
    </div>
  );
}
