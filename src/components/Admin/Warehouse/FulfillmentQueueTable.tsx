"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { formatDateTime, formatVnd } from "@/utils/adminFormat";
import { warehouseFulfillmentApi, type FulfillmentQueueItem } from "@/utils/warehouseFulfillmentApi";

const STATUS_LABELS: Record<string, string> = {
  CONFIRMED: "Chờ xuất",
  PROCESSING: "Đang gom",
  SHIPPING: "Đang giao",
  DELIVERED: "Đã giao",
};

const statusClass: Record<string, string> = {
  CONFIRMED: "bg-[#FFF9EB] text-yellow-dark-2",
  PROCESSING: "bg-blue-light-5 text-blue",
  SHIPPING: "bg-[#fff3e0] text-[#e65100]",
  DELIVERED: "bg-green-light-6 text-green",
};

export default function FulfillmentQueueTable({
  orders,
  loading,
  onReload,
}: {
  orders: FulfillmentQueueItem[];
  loading: boolean;
  onReload: () => void;
}) {
  const router = useRouter();

  const handleStartPicking = async (order: FulfillmentQueueItem) => {
    try {
      await warehouseFulfillmentApi.startPicking(order.id);
      toast.success("Đã bắt đầu gom hàng");
      router.push(`/admin/warehouse-fulfillment/${order.id}`);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        "Không thể bắt đầu gom hàng";
      toast.error(msg);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-3/50 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[960px]">
          <thead>
            <tr className="bg-[#F7F9FC] border-b border-gray-3/50">
              <th className="text-left px-4 py-3 text-xs font-bold text-[#8D93A5] uppercase">Mã đơn</th>
              <th className="text-left px-4 py-3 text-xs font-bold text-[#8D93A5] uppercase">Khách hàng</th>
              <th className="text-left px-4 py-3 text-xs font-bold text-[#8D93A5] uppercase">Ngày đặt</th>
              <th className="text-right px-4 py-3 text-xs font-bold text-[#8D93A5] uppercase">Tổng tiền</th>
              <th className="text-center px-4 py-3 text-xs font-bold text-[#8D93A5] uppercase">Tiến độ quét</th>
              <th className="text-left px-4 py-3 text-xs font-bold text-[#8D93A5] uppercase">Trạng thái</th>
              <th className="text-left px-4 py-3 text-xs font-bold text-[#8D93A5] uppercase">Người soạn</th>
              <th className="text-center px-6 py-3 text-xs font-bold text-[#8D93A5] uppercase">Thao tác</th>
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
                  Không có đơn trong hàng đợi
                </td>
              </tr>
            ) : (
              orders.map((order) => (
                <tr key={order.id} className="hover:bg-[#F7F9FC]/50">
                  <td className="px-4 py-3 text-sm font-semibold text-dark">{order.orderCode}</td>
                  <td className="px-4 py-3">
                    <p className="text-sm font-medium text-dark">{order.customerName}</p>
                    <p className="text-xs text-[#8D93A5]">{order.customerPhone}</p>
                  </td>
                  <td className="px-4 py-3 text-sm text-[#606882]">
                    {formatDateTime(order.orderDate)}
                  </td>
                  <td className="px-4 py-3 text-sm font-semibold text-right">
                    {formatVnd(Number(order.total))}
                  </td>
                  <td className="px-4 py-3 text-center text-sm">
                    {order.totalSerialRequired > 0 ? (
                      <span
                        className={
                          order.pickingComplete ? "text-green font-semibold" : "text-[#F27430] font-semibold"
                        }
                      >
                        {order.totalSerialAssigned}/{order.totalSerialRequired}
                      </span>
                    ) : (
                      <span className="text-[#8D93A5]">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block px-2.5 py-1 rounded-md text-[11px] font-semibold uppercase ${
                        statusClass[order.status] ?? "bg-gray-1 text-[#6C6F93]"
                      }`}
                    >
                      {STATUS_LABELS[order.status] ?? order.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-[#606882]">
                    {order.pickedByName ?? "—"}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-2 flex-wrap">
                      {order.canStartPicking && order.status === "CONFIRMED" ? (
                        <button
                          type="button"
                          onClick={() => void handleStartPicking(order)}
                          className="px-3 py-1.5 bg-[#3C50E0] text-white text-xs font-semibold rounded-lg hover:bg-[#1C3FB7]"
                        >
                          Bắt đầu gom hàng
                        </button>
                      ) : (
                        <Link
                          href={`/admin/warehouse-fulfillment/${order.id}`}
                          className="px-3 py-1.5 border border-[#3C50E0] text-[#3C50E0] text-xs font-semibold rounded-lg hover:bg-blue-light-5"
                        >
                          {order.status === "PROCESSING" ? "Tiếp tục soạn" : "Xem chi tiết"}
                        </Link>
                      )}
                    </div>
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
