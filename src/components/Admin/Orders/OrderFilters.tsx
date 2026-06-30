"use client";

import { useOrdersAdmin } from "@/components/Admin/Orders/ordersAdminStore";

const statuses = [
  { value: "", label: "Tất cả trạng thái" },
  { value: "PENDING", label: "Chờ xác nhận" },
  { value: "CONFIRMED", label: "Đã xác nhận" },
  { value: "PROCESSING", label: "Đang xử lý" },
  { value: "SHIPPING", label: "Đang giao" },
  { value: "DELIVERED", label: "Đã giao" },
  { value: "COMPLETED", label: "Hoàn thành" },
  { value: "CANCELLED", label: "Đã hủy" },
];

export default function OrderFilters() {
  const { keyword, statusFilter, setKeyword, setStatusFilter, setPage, reload } =
    useOrdersAdmin();

  return (
    <div className="bg-white rounded-xl border border-gray-3/50 p-4">
      <div className="flex flex-col lg:flex-row lg:items-center gap-3">
        <div className="flex-1 relative">
          <input
            type="search"
            placeholder="Tìm mã đơn, tên hoặc SĐT khách..."
            value={keyword}
            onChange={(e) => {
              setKeyword(e.target.value);
              setPage(0);
            }}
            onKeyDown={(e) => e.key === "Enter" && reload()}
            className="w-full px-3 py-2.5 bg-[#F7F9FC] border border-gray-3 rounded-lg text-sm"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(0);
          }}
          className="w-full lg:w-[180px] px-3 py-2.5 bg-[#F7F9FC] border border-gray-3 rounded-lg text-sm"
        >
          {statuses.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={() => reload()}
          className="px-4 py-2.5 rounded-lg bg-[#3C50E0] text-white text-sm font-semibold"
        >
          Lọc
        </button>
      </div>
    </div>
  );
}
