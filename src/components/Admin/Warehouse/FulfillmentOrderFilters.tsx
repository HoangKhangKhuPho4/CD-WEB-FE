"use client";

import { useOrdersAdmin } from "@/components/Admin/Orders/ordersAdminStore";

const fulfillmentStatuses = [
  { value: "", label: "Tất cả (xuất kho)" },
  { value: "CONFIRMED", label: "Đã xác nhận — chờ xuất" },
  { value: "PROCESSING", label: "Đang đóng gói" },
  { value: "SHIPPING", label: "Đang giao" },
  { value: "DELIVERED", label: "Đã giao" },
  { value: "COMPLETED", label: "Hoàn tất" },
];

export default function FulfillmentOrderFilters() {
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
          className="w-full lg:w-[220px] px-3 py-2.5 bg-[#F7F9FC] border border-gray-3 rounded-lg text-sm"
        >
          {fulfillmentStatuses.map((s) => (
            <option key={s.value || "all"} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={() => reload()}
          className="px-4 py-2.5 bg-[#3C50E0] text-white text-sm font-semibold rounded-lg hover:bg-[#1C3FB7]"
        >
          Lọc
        </button>
      </div>
      <p className="text-xs text-[#8D93A5] mt-3">
        Chỉ hiển thị đơn đã được Sales xác nhận — kho đóng gói, gán IMEI và bàn giao vận chuyển.
      </p>
    </div>
  );
}
