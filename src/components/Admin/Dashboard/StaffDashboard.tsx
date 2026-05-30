"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSelector } from "react-redux";
import {
  adminStatisticsApi,
  type StaffOverviewStatistics,
} from "@/utils/adminApi";
import type { RootState } from "@/redux/store";
import { hasAnyPermission, hasPermission } from "@/utils/rbac";
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
  const [data, setData] = useState<StaffOverviewStatistics | null>(null);
  const [loading, setLoading] = useState(true);

  const isWarehouse = hasAnyPermission(user, ["STOCK_IMPORT", "IMEI_MANAGE", "INVENTORY_STAT"]);
  const isSales =
    user?.roles?.some((r) => (r.name ?? "").toUpperCase() === "SALES") ?? false;
  const showLowStock = isWarehouse || hasPermission(user, "INVENTORY_STAT");
  const showSalesProducts = isSales || hasPermission(user, "REPORT_REVENUE");

  useEffect(() => {
    adminStatisticsApi
      .staffOverview()
      .then((res) => setData(res.data))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-28 rounded-xl bg-white animate-pulse border border-gray-3/50" />
        ))}
      </div>
    );
  }

  const title = isWarehouse && !isSales
    ? "Tổng quan kho"
    : isSales && !isWarehouse
      ? "Tổng quan bán hàng"
      : "Tổng quan công việc";

  const subtitle = isSales && !isWarehouse
    ? "Xử lý đơn hàng, báo cáo bán hàng và quản lý phiếu bảo hành — theo vai trò Sales."
    : isWarehouse && !isSales
      ? "Theo dõi đơn hàng, tồn kho, xuất hàng và quản lý phiếu bảo hành thiết bị."
      : "Theo dõi đơn hàng và công việc cần xử lý hôm nay.";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-dark">{title}</h1>
        <p className="text-sm text-[#6C6F93] mt-1">{subtitle}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          label="Đơn chờ xác nhận"
          value={data?.pendingOrders ?? 0}
          href="/admin/orders"
          accent="#F27430"
        />
        <StatCard
          label="Đã xác nhận"
          value={data?.confirmedOrders ?? 0}
          href="/admin/orders"
          accent="#3C50E0"
        />
        <StatCard
          label="Đang giao hàng"
          value={data?.shippingOrders ?? 0}
          href="/admin/orders"
          accent="#02AAA4"
        />
        {isSales ? (
          <StatCard
            label="Đơn hôm nay"
            value={data?.ordersToday ?? 0}
            href="/admin/orders"
            accent="#1C274C"
          />
        ) : (
          <StatCard
            label="Đơn hôm nay"
            value={data?.ordersToday ?? 0}
            href="/admin/orders"
            accent="#1C274C"
          />
        )}
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
          <RecentOrders />
        </div>
        <div className="lg:col-span-2">
          <OrderStatusChart />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {showSalesProducts && <BestSellingProducts />}
        {showLowStock && <LowStockProducts />}
      </div>
    </div>
  );
}
