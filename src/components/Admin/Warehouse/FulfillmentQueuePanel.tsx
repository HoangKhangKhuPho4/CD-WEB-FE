"use client";

import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import AdminTablePagination from "@/components/Admin/shared/AdminTablePagination";
import {
  warehouseFulfillmentApi,
  type FulfillmentQueueItem,
} from "@/utils/warehouseFulfillmentApi";

const STATUS_OPTIONS = [
  { value: "", label: "Tất cả (xuất kho)" },
  { value: "CONFIRMED", label: "Chờ xuất" },
  { value: "PROCESSING", label: "Đang gom hàng" },
  { value: "SHIPPING", label: "Đang giao" },
];

export default function FulfillmentQueuePanel({
  renderTable,
}: {
  renderTable: (props: {
    orders: FulfillmentQueueItem[];
    loading: boolean;
    onReload: () => void;
  }) => React.ReactNode;
}) {
  const [orders, setOrders] = useState<FulfillmentQueueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(15);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await warehouseFulfillmentApi.queue({
        keyword: keyword || undefined,
        status: status || undefined,
        page,
        size: pageSize,
      });
      if (res.data.success) {
        setOrders(res.data.data.content);
        setTotalPages(Math.max(1, res.data.data.totalPages));
        setTotalElements(res.data.data.totalElements);
      }
    } catch {
      toast.error("Không tải được hàng đợi xuất kho");
    } finally {
      setLoading(false);
    }
  }, [keyword, status, page, pageSize]);

  useEffect(() => {
    void load();
  }, [load]);

  const confirmedCount = orders.filter((o) => o.status === "CONFIRMED").length;
  const processingCount = orders.filter((o) => o.status === "PROCESSING").length;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Trên trang" value={String(orders.length)} accent="#1C274C" />
        <StatCard label="Tổng (bộ lọc)" value={String(totalElements)} accent="#3C50E0" />
        <StatCard label="Chờ xuất" value={String(confirmedCount)} accent="#F27430" />
        <StatCard label="Đang gom" value={String(processingCount)} accent="#02AAA4" />
      </div>

      <div className="bg-white rounded-xl border border-gray-3/50 p-4">
        <div className="flex flex-col lg:flex-row lg:items-center gap-3">
          <input
            type="search"
            placeholder="Tìm mã đơn, tên hoặc SĐT khách..."
            value={keyword}
            onChange={(e) => {
              setKeyword(e.target.value);
              setPage(0);
            }}
            onKeyDown={(e) => e.key === "Enter" && void load()}
            className="flex-1 px-3 py-2.5 bg-[#F7F9FC] border border-gray-3 rounded-lg text-sm"
          />
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(0);
            }}
            className="w-full lg:w-[220px] px-3 py-2.5 bg-[#F7F9FC] border border-gray-3 rounded-lg text-sm"
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s.value || "all"} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => void load()}
            className="px-4 py-2.5 bg-[#3C50E0] text-white text-sm font-semibold rounded-lg hover:bg-[#1C3FB7]"
          >
            Lọc
          </button>
        </div>
        <p className="text-xs text-[#8D93A5] mt-3">
          Chỉ hiển thị đơn đã được Sales xác nhận — ưu tiên đơn cũ nhất.
        </p>
      </div>

      {renderTable({ orders, loading, onReload: load })}

      {totalElements > 0 && (
        <AdminTablePagination
          page={page + 1}
          totalPages={totalPages}
          totalElements={totalElements}
          pageSize={pageSize}
          onPageChange={(p) => setPage(p - 1)}
          onPageSizeChange={(size) => {
            setPageSize(size);
            setPage(0);
          }}
          label="đơn hàng"
        />
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent: string;
}) {
  return (
    <div className="bg-white rounded-xl p-5 border border-gray-3/50">
      <p className="text-xs text-[#8D93A5]">{label}</p>
      <p className="text-2xl font-bold mt-1" style={{ color: accent }}>
        {value}
      </p>
    </div>
  );
}
