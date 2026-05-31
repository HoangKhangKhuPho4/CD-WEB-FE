"use client";

import React, { useMemo, useState } from "react";
import OrderBulkToolbar from "@/components/Admin/Orders/OrderBulkToolbar";
import { useOrdersAdmin } from "@/components/Admin/Orders/ordersAdminStore";
import { formatDateTime, formatVnd } from "@/utils/adminFormat";

const statusClass: Record<string, string> = {
  PENDING: "bg-yellow-light-4 text-yellow",
  CONFIRMED: "bg-blue-light-5 text-blue",
  PROCESSING: "bg-blue-light-5 text-blue",
  SHIPPING: "bg-[#fff3e0] text-[#e65100]",
  DELIVERED: "bg-green-light-6 text-green",
  COMPLETED: "bg-green-light-6 text-green",
  CANCELLED: "bg-red-light-6 text-red",
};

export default function OrderTable({ onView }: { onView: (orderId: number) => void }) {
  const { orders, loading } = useOrdersAdmin();
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  const allSelected = useMemo(
    () => orders.length > 0 && selectedIds.length === orders.length,
    [orders.length, selectedIds.length]
  );

  const toggleAll = () => {
    if (allSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(orders.map((o) => o.id));
    }
  };

  const toggleOne = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  return (
    <div className="space-y-3">
      <OrderBulkToolbar selectedIds={selectedIds} onClear={() => setSelectedIds([])} />
      <div className="bg-white rounded-xl border border-gray-3/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[960px]">
            <thead>
              <tr className="bg-[#F7F9FC] border-b border-gray-3/50">
                <th className="px-4 py-3 w-12">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={toggleAll}
                    aria-label="Chọn tất cả"
                    className="rounded border-gray-3"
                  />
                </th>
                <th className="text-left px-4 py-3 text-xs font-bold text-[#8D93A5] uppercase">
                  Mã đơn
                </th>
                <th className="text-left px-4 py-3 text-xs font-bold text-[#8D93A5] uppercase">
                  Khách hàng
                </th>
                <th className="text-left px-4 py-3 text-xs font-bold text-[#8D93A5] uppercase">
                  Ngày đặt
                </th>
                <th className="text-right px-4 py-3 text-xs font-bold text-[#8D93A5] uppercase">
                  Tổng tiền
                </th>
                <th className="text-left px-4 py-3 text-xs font-bold text-[#8D93A5] uppercase">
                  Thanh toán
                </th>
                <th className="text-left px-4 py-3 text-xs font-bold text-[#8D93A5] uppercase">
                  Trạng thái
                </th>
                <th className="text-center px-6 py-3 text-xs font-bold text-[#8D93A5] uppercase">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-3/50">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-6 py-10 text-center text-sm text-[#8D93A5]">
                    Đang tải...
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-10 text-center text-sm text-[#8D93A5]">
                    Không có đơn hàng
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order.id} className="hover:bg-[#F7F9FC]/60">
                    <td className="px-4 py-4">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(order.id)}
                        onChange={() => toggleOne(order.id)}
                        aria-label={`Chọn đơn ${order.orderCode}`}
                        className="rounded border-gray-3"
                      />
                    </td>
                    <td className="px-4 py-4 text-sm font-semibold text-blue">
                      {order.orderCode}
                    </td>
                    <td className="px-4 py-4 text-sm text-dark">{order.customerName}</td>
                    <td className="px-4 py-4 text-sm text-[#606882]">
                      {formatDateTime(order.createdAt)}
                    </td>
                    <td className="px-4 py-4 text-sm text-right font-medium">
                      {formatVnd(order.total)}
                    </td>
                    <td className="px-4 py-4 text-sm text-[#606882]">
                      {order.paymentMethod}
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                          statusClass[order.status] ?? "bg-gray-2"
                        }`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        type="button"
                        onClick={() => onView(order.id)}
                        className="text-sm font-medium text-[#3C50E0] hover:underline"
                      >
                        Chi tiết
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
