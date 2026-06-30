"use client";

import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { adminPurchaseOrderApi, type PurchaseOrderSummary } from "@/utils/adminApi";

const statusChip: Record<string, { label: string; className: string }> = {
  PENDING: { label: "Chờ duyệt", className: "bg-[#FFEDD5] text-[#C2410C]" },
  APPROVED: { label: "Đã duyệt", className: "bg-[#DCFCE7] text-[#15803D]" },
  DRAFT: { label: "Nháp", className: "bg-gray-2 text-[#6C6F93]" },
  CANCELLED: { label: "Đã hủy", className: "bg-[#FEE2E2] text-[#B91C1C]" },
};

export default function ProcurementPoList({
  refreshKey,
}: {
  refreshKey?: number;
}) {
  const [rows, setRows] = useState<PurchaseOrderSummary[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminPurchaseOrderApi.list({ scope: "procurement" });
      setRows(res.data.data ?? []);
    } catch {
      toast.error("Không tải được danh sách PO");
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load, refreshKey]);

  return (
    <div className="bg-white rounded-xl border border-gray-3/50 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-3/50">
        <h2 className="text-sm font-bold text-dark uppercase tracking-wide">
          Danh sách PO đã tạo
        </h2>
        <p className="text-xs text-[#8D93A5] mt-1">
          Theo dõi trạng thái duyệt của các đơn mua hàng bạn đã lập
        </p>
      </div>
      <table className="w-full min-w-[720px]">
        <thead>
          <tr className="bg-[#F7F9FC] border-b border-gray-3/50">
            <th className="text-left px-6 py-3 text-xs font-bold text-[#8D93A5] uppercase">
              Mã PO
            </th>
            <th className="text-left px-4 py-3 text-xs font-bold text-[#8D93A5] uppercase">
              NCC
            </th>
            <th className="text-left px-4 py-3 text-xs font-bold text-[#8D93A5] uppercase">
              Trạng thái
            </th>
            <th className="text-right px-4 py-3 text-xs font-bold text-[#8D93A5] uppercase">
              Tổng SL
            </th>
            <th className="text-left px-6 py-3 text-xs font-bold text-[#8D93A5] uppercase">
              Ngày hẹn giao
            </th>
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
                Chưa có đơn mua hàng nào
              </td>
            </tr>
          ) : (
            rows.map((row) => {
              const st =
                statusChip[row.rawStatus ?? "PENDING"] ?? statusChip.PENDING;
              return (
                <tr key={row.id} className="hover:bg-[#F7F9FC]/60">
                  <td className="px-6 py-4 text-sm font-semibold text-[#3C50E0]">
                    {row.code}
                  </td>
                  <td className="px-4 py-4 text-sm">{row.supplier}</td>
                  <td className="px-4 py-4">
                    <span
                      className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${st.className}`}
                    >
                      {st.label}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-sm text-right font-medium">
                    {(row.totalQuantity ?? row.items).toLocaleString("vi-VN")}
                  </td>
                  <td className="px-6 py-4 text-sm text-[#6C6F93]">
                    {row.expectedDate}
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
