"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { adminStatisticsApi } from "@/utils/adminApi";
import { formatDateTime, formatVnd } from "@/utils/adminFormat";

const statusClass: Record<string, string> = {
  PENDING: "bg-yellow-light-4 text-yellow",
  PROCESSING: "bg-blue-light-5 text-blue",
  SHIPPING: "bg-[#fff3e0] text-[#e65100]",
  DELIVERED: "bg-green-light-6 text-green",
  COMPLETED: "bg-green-light-6 text-green",
  CANCELLED: "bg-red-light-6 text-red",
};

export default function RecentOrders() {
  const [rows, setRows] = useState<
    {
      orderCode: string;
      customerName: string;
      totalAmount: number;
      status: string;
      orderDate: string;
    }[]
  >([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminStatisticsApi
      .recentOrders(10)
      .then((res) => setRows(res.data.recentOrders ?? []))
      .catch(() => setRows([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="bg-white rounded-xl border border-gray-3/50 overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-3/50">
        <h3 className="text-lg font-bold text-dark">Đơn hàng gần đây</h3>
        <Link href="/admin/orders" className="text-sm font-medium text-blue hover:underline">
          Xem tất cả
        </Link>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[600px]">
          <thead>
            <tr className="bg-[#F9FAFB] text-xs text-[#8D93A5] uppercase">
              <th className="text-left px-6 py-3">Mã đơn</th>
              <th className="text-left px-4 py-3">Khách</th>
              <th className="text-right px-4 py-3">Tổng</th>
              <th className="text-left px-4 py-3">Trạng thái</th>
              <th className="text-left px-6 py-3">Ngày</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-3/50">
            {loading ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-sm text-[#8D93A5]">
                  Đang tải...
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-sm text-[#8D93A5]">
                  Chưa có đơn hàng
                </td>
              </tr>
            ) : (
              rows.map((o) => (
                <tr key={o.orderCode} className="hover:bg-[#F7F9FC]/50">
                  <td className="px-6 py-3 text-sm font-semibold text-blue">{o.orderCode}</td>
                  <td className="px-4 py-3 text-sm text-dark">{o.customerName}</td>
                  <td className="px-4 py-3 text-sm text-right font-medium">
                    {formatVnd(o.totalAmount)}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                        statusClass[o.status] ?? "bg-gray-2 text-dark"
                      }`}
                    >
                      {o.status}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-sm text-[#606882]">
                    {formatDateTime(o.orderDate)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
