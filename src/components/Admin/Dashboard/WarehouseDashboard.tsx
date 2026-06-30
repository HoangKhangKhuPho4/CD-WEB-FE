"use client";

import Link from "next/link";
import { useEffect, useState, type ComponentType } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "@/redux/store";
import {
  IconAlertTriangle,
  IconBox,
  IconChip,
  IconClipboard,
  IconQrCode,
  IconReturn,
  IconTruck,
  IconWarehouse,
} from "@/components/Admin/icons/AdminIcons";
import LowStockProducts from "@/components/Admin/Dashboard/LowStockProducts";
import { INVENTORY_RETURN_HREF } from "@/components/Admin/adminNavConfig";
import { adminStatisticsApi, type StaffOverviewStatistics } from "@/utils/adminApi";
import { returnInspectionApi } from "@/utils/returnInspectionApi";
import { isWarehouseOnlyUser } from "@/utils/rbac";
import { warehouseFulfillmentApi } from "@/utils/warehouseFulfillmentApi";

type KpiTone = "blue" | "orange" | "red" | "teal";

const KPI_STYLES: Record<
  KpiTone,
  { border: string; bg: string; iconWrap: string; accent: string }
> = {
  blue: {
    border: "border-l-[#3C50E0]",
    bg: "bg-gradient-to-br from-[#EEF2FF] to-white",
    iconWrap: "bg-[#3C50E0]/10 text-[#3C50E0]",
    accent: "#3C50E0",
  },
  orange: {
    border: "border-l-[#F27430]",
    bg: "bg-gradient-to-br from-[#FFF8EF] to-white",
    iconWrap: "bg-[#F27430]/10 text-[#F27430]",
    accent: "#F27430",
  },
  red: {
    border: "border-l-[#E10E0E]",
    bg: "bg-gradient-to-br from-[#FEF2F2] to-white",
    iconWrap: "bg-red/10 text-red",
    accent: "#E10E0E",
  },
  teal: {
    border: "border-l-[#02AAA4]",
    bg: "bg-gradient-to-br from-[#ECFEFF] to-white",
    iconWrap: "bg-[#02AAA4]/10 text-[#02AAA4]",
    accent: "#02AAA4",
  },
};

function WarehouseKpiCard({
  href,
  label,
  desc,
  count,
  tone,
  Icon,
}: {
  href: string;
  label: string;
  desc: string;
  count: number;
  tone: KpiTone;
  Icon: ComponentType<{ size?: number; className?: string }>;
}) {
  const s = KPI_STYLES[tone];
  return (
    <Link
      href={href}
      className={`group block rounded-xl border border-gray-3/50 border-l-4 ${s.border} ${s.bg} p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-wide text-[#8D93A5]">{label}</p>
          <p className="text-3xl font-bold tabular-nums mt-1" style={{ color: s.accent }}>
            {count}
          </p>
          <p className="text-xs text-[#6C6F93] mt-1">{desc}</p>
        </div>
        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${s.iconWrap} transition-transform group-hover:scale-105`}
        >
          <Icon size={22} />
        </div>
      </div>
    </Link>
  );
}

function ActionShortcut({
  href,
  label,
  desc,
  borderColor,
  iconWrap,
  Icon,
}: {
  href: string;
  label: string;
  desc: string;
  borderColor: string;
  iconWrap: string;
  Icon: ComponentType<{ size?: number; className?: string }>;
}) {
  return (
    <Link
      href={href}
      className={`group block rounded-xl border-2 ${borderColor} bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-lg`}
    >
      <div className="flex items-start gap-4">
        <div
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${iconWrap} transition-transform group-hover:scale-105`}
        >
          <Icon size={24} />
        </div>
        <div>
          <p className="text-sm font-bold text-dark">{label}</p>
          <p className="text-xs text-[#8D93A5] mt-1">{desc}</p>
        </div>
      </div>
    </Link>
  );
}

export default function WarehouseDashboard() {
  const user = useSelector((s: RootState) => s.authReducer.user);
  const [data, setData] = useState<StaffOverviewStatistics | null>(null);
  const [fulfillmentCount, setFulfillmentCount] = useState(0);
  const [returnPendingCount, setReturnPendingCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const warehouseOnly = isWarehouseOnlyUser(user);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      adminStatisticsApi.staffOverview(),
      warehouseFulfillmentApi.queue({ page: 0, size: 1 }),
      returnInspectionApi.pending(),
      returnInspectionApi.drafts(),
    ])
      .then(([overviewRes, queueRes, pendingRes, draftsRes]) => {
        setData(overviewRes.data);
        setFulfillmentCount(queueRes.data.data?.totalElements ?? 0);
        const pending = pendingRes.data.data?.length ?? 0;
        const drafts = draftsRes.data.data?.length ?? 0;
        setReturnPendingCount(pending + drafts);
      })
      .catch(() => {
        setData(null);
        setFulfillmentCount(0);
        setReturnPendingCount(0);
      })
      .finally(() => setLoading(false));
  }, []);

  const lowStockCount = data?.lowStockVariants ?? 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-dark">Tổng quan kho</h1>
          <p className="text-sm text-[#6C6F93] mt-1">
            Số liệu vận hành thời gian thực — cập nhật theo hàng đợi hiện tại
          </p>
        </div>
        <span className="inline-flex items-center gap-2 self-start px-3 py-1.5 rounded-full bg-green-light-6 text-green text-xs font-semibold">
          <span className="w-2 h-2 rounded-full bg-green animate-pulse" aria-hidden />
          Live
        </span>
      </div>

      {loading && !data ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 rounded-xl bg-white animate-pulse border border-gray-3/50" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <WarehouseKpiCard
            href="/admin/warehouse-fulfillment"
            label="Đơn cần xuất"
            desc="Hàng đợi picking & xuất kho"
            count={fulfillmentCount}
            tone="blue"
            Icon={IconTruck}
          />
          <WarehouseKpiCard
            href="/admin/purchase-orders"
            label="Đơn mua hàng"
            desc="PO chờ nhập / đang quét"
            count={data?.pendingPurchaseOrders ?? 0}
            tone="orange"
            Icon={IconClipboard}
          />
          <WarehouseKpiCard
            href="/admin/inventory"
            label="Tồn kho thấp"
            desc="Biến thể cần nhập thêm"
            count={lowStockCount}
            tone="red"
            Icon={IconAlertTriangle}
          />
          <WarehouseKpiCard
            href={INVENTORY_RETURN_HREF}
            label="Xử lý hàng hoàn"
            desc="Phiếu chờ QC & lưu tạm"
            count={returnPendingCount}
            tone="teal"
            Icon={IconReturn}
          />
        </div>
      )}

      {lowStockCount > 0 && (
        <div className="rounded-xl border border-red/30 bg-gradient-to-r from-[#FEF2F2] to-white px-5 py-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-start gap-3 min-w-0">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-red/10 text-red">
              <IconAlertTriangle size={20} />
            </div>
            <div>
              <p className="text-sm font-bold text-red">
                Có {lowStockCount} biến thể sắp hết / hết hàng
              </p>
              <p className="text-xs text-[#6C6F93] mt-0.5">
                Cần lập phiếu nhập kho hoặc điều chỉnh tồn sớm để tránh thiếu hàng bán.
              </p>
            </div>
          </div>
          <Link
            href="/admin/inventory"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border-2 border-red text-red text-sm font-bold hover:bg-red hover:text-white transition-colors shrink-0"
          >
            Mở nhập kho
            <span aria-hidden>→</span>
          </Link>
        </div>
      )}

      <div>
        <h2 className="text-lg font-bold text-dark mb-4">Lối tắt nghiệp vụ</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <ActionShortcut
            href="/admin/imei"
            label="Nhập Serial"
            desc="Quét Serial theo PO — thao tác ưu tiên"
            borderColor="border-[#ff9f1a]/40 hover:border-[#ff9f1a]"
            iconWrap="bg-[#FFF8EF] text-[#F27430]"
            Icon={IconQrCode}
          />
          <ActionShortcut
            href="/admin/inventory-audit"
            label="Kiểm kê kho"
            desc="Tạo phiếu & quét mã vạch"
            borderColor="border-[#9333EA]/30 hover:border-[#9333EA]"
            iconWrap="bg-[#F5F3FF] text-[#9333EA]"
            Icon={IconWarehouse}
          />
          <ActionShortcut
            href="/admin/return"
            label="Xử lý hàng hoàn"
            desc="Kiểm định QC — hoàn kho / cách ly"
            borderColor="border-red/30 hover:border-red"
            iconWrap="bg-red-light-6 text-red"
            Icon={IconReturn}
          />
          {!warehouseOnly && (
            <ActionShortcut
              href="/admin/products"
              label="Sản phẩm"
              desc="Cập nhật catalog"
              borderColor="border-gray-3 hover:border-[#6C6F93]"
              iconWrap="bg-gray-2 text-[#6C6F93]"
              Icon={IconBox}
            />
          )}
          <ActionShortcut
            href="/admin/purchase-orders"
            label="Đơn mua hàng"
            desc="Nhận hàng & quét theo PO"
            borderColor="border-[#3C50E0]/30 hover:border-[#3C50E0]"
            iconWrap="bg-[#EEF2FF] text-[#3C50E0]"
            Icon={IconChip}
          />
        </div>
      </div>

      <LowStockProducts />
    </div>
  );
}
