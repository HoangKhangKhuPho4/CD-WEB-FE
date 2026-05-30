"use client";

import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import Modal from "@/components/Admin/shared/Modal";
import AdminPagination from "@/components/Admin/shared/AdminPagination";
import { adminOrderApi, type AdminOrderSummary } from "@/utils/adminApi";
import { formatDate, formatVnd } from "@/utils/adminFormat";

interface ReturnRow {
  id: number;
  code: string;
  orderId: string;
  customer: string;
  reason: string;
  amount: string;
  status: "pending" | "approved" | "rejected";
  date: string;
  paymentMethod?: string;
  paymentStatus?: string;
}

const statusMap = {
  pending: { label: "Chờ duyệt", className: "bg-[#FEF3C7] text-yellow-dark-2" },
  approved: { label: "Đã hoàn tiền", className: "bg-green-light-6 text-green" },
  rejected: { label: "Đã hủy", className: "bg-red-light-6 text-red" },
};

type ReturnTab = "REFUNDED" | "CANCELLED";

function mapOrder(o: AdminOrderSummary): ReturnRow {
  const st = o.status?.toUpperCase() ?? "";
  let status: ReturnRow["status"] = "pending";
  if (st === "REFUNDED") status = "approved";
  else if (st === "CANCELLED") status = "rejected";
  return {
    id: o.id,
    code: `#RT-${o.orderCode}`,
    orderId: o.orderCode,
    customer: o.customerName,
    reason: o.paymentStatus === "REFUNDED" ? "Hoàn tiền" : "Yêu cầu trả / hủy đơn",
    amount: formatVnd(o.total),
    status,
    date: formatDate(o.createdAt),
    paymentMethod: o.paymentMethod,
    paymentStatus: o.paymentStatus,
  };
}

const PER_PAGE = 10;

export default function ReturnManagement() {
  const [rows, setRows] = useState<ReturnRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [detail, setDetail] = useState<ReturnRow | null>(null);
  const [refunding, setRefunding] = useState(false);
  const [tab, setTab] = useState<ReturnTab>("REFUNDED");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [summary, setSummary] = useState({ refunded: 0, cancelled: 0 });

  const loadSummary = useCallback(async () => {
    try {
      const [refunded, cancelled] = await Promise.all([
        adminOrderApi.list({ status: "REFUNDED", page: 0, size: 1 }),
        adminOrderApi.list({ status: "CANCELLED", page: 0, size: 1 }),
      ]);
      setSummary({
        refunded: refunded.data.success ? refunded.data.data.totalElements : 0,
        cancelled: cancelled.data.success ? cancelled.data.data.totalElements : 0,
      });
    } catch {
      /* ignore */
    }
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminOrderApi.list({
        status: tab,
        page: page - 1,
        size: PER_PAGE,
        sortBy: "orderDate",
        sortDir: "desc",
      });
      if (res.data.success) {
        const data = res.data.data;
        setRows(data.content.map(mapOrder));
        setTotalPages(Math.max(1, data.totalPages));
        setTotalElements(data.totalElements);
      }
    } catch {
      toast.error("Không tải được đơn trả/hủy");
    } finally {
      setLoading(false);
    }
  }, [tab, page]);

  useEffect(() => {
    void loadSummary();
  }, [loadSummary]);

  useEffect(() => {
    void load();
  }, [load]);

  const handleRefundVnpay = async () => {
    if (!detail) return;
    setRefunding(true);
    try {
      const res = await adminOrderApi.refundVnpay(detail.id);
      const body = res.data.data;
      if (res.data.success && body?.success) {
        toast.success(body.message || "Hoàn tiền VNPay thành công");
        setDetail(null);
        await load();
        await loadSummary();
      } else {
        toast.error(body?.message || res.data.message || "Hoàn tiền thất bại");
      }
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "Hoàn tiền VNPay thất bại";
      toast.error(msg);
    } finally {
      setRefunding(false);
    }
  };

  const updateStatus = async (id: number, status: string) => {
    try {
      await adminOrderApi.updateStatus(id, status, "Cập nhật từ quản lý trả hàng");
      toast.success("Đã cập nhật đơn");
      setDetail(null);
      await load();
      await loadSummary();
    } catch {
      toast.error("Cập nhật thất bại");
    }
  };

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "Đã hoàn tiền", value: String(summary.refunded), color: "text-green" },
          { label: "Đã hủy", value: String(summary.cancelled), color: "text-red" },
          {
            label: "Đang xem",
            value: tab === "REFUNDED" ? "Hoàn tiền" : "Đã hủy",
            color: "text-[#3C50E0]",
          },
        ].map((c) => (
          <div key={c.label} className="bg-white rounded-xl border border-gray-3/50 p-5">
            <p className="text-xs font-bold text-[#8D93A5] uppercase">{c.label}</p>
            <p className={`text-2xl font-bold mt-1 ${c.color}`}>{c.value}</p>
          </div>
        ))}
      </div>

      <div className="flex bg-white rounded-lg p-1 w-fit border border-gray-3/50 shadow-sm">
        {(
          [
            { id: "REFUNDED" as const, label: "Hoàn tiền" },
            { id: "CANCELLED" as const, label: "Đã hủy" },
          ] as const
        ).map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => {
              setTab(t.id);
              setPage(1);
            }}
            className={`px-4 py-2 rounded-md text-sm font-semibold transition-all ${
              tab === t.id ? "bg-[#3C50E0] text-white shadow-md" : "text-[#6C6F93] hover:text-dark"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-3/50 overflow-hidden">
        {loading ? (
          <p className="px-6 py-8 text-sm text-[#8D93A5]">Đang tải...</p>
        ) : (
          <table className="w-full min-w-[900px]">
            <thead>
              <tr className="bg-[#F7F9FC] border-b border-gray-3/50">
                <th className="text-left px-6 py-3 text-xs font-bold text-[#8D93A5] uppercase">Mã</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-[#8D93A5] uppercase">Đơn hàng</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-[#8D93A5] uppercase">Khách hàng</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-[#8D93A5] uppercase">Ghi chú</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-[#8D93A5] uppercase">Số tiền</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-[#8D93A5] uppercase">Trạng thái</th>
                <th className="text-center px-6 py-3 text-xs font-bold text-[#8D93A5] uppercase">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-3/50">
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-sm text-[#8D93A5] text-center">
                    Không có đơn trong tab này
                  </td>
                </tr>
              ) : (
                rows.map((row) => {
                  const st = statusMap[row.status];
                  return (
                    <tr key={row.id} className="hover:bg-[#F7F9FC]/60">
                      <td className="px-6 py-4 text-sm font-semibold text-[#3C50E0]">{row.code}</td>
                      <td className="px-4 py-4 text-sm">{row.orderId}</td>
                      <td className="px-4 py-4 text-sm">{row.customer}</td>
                      <td className="px-4 py-4 text-sm text-[#6C6F93]">{row.reason}</td>
                      <td className="px-4 py-4 text-sm font-semibold">{row.amount}</td>
                      <td className="px-4 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${st.className}`}>
                          {st.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button
                          type="button"
                          onClick={() => setDetail(row)}
                          className="text-sm font-semibold text-[#3C50E0] hover:underline"
                        >
                          Chi tiết
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        )}
        <div className="px-6 py-4 border-t border-gray-3/50">
          <AdminPagination
            page={page}
            totalPages={totalPages}
            totalElements={totalElements}
            pageSize={PER_PAGE}
            onPageChange={setPage}
            label="đơn"
          />
        </div>
      </div>

      <Modal open={!!detail} onClose={() => setDetail(null)} title={detail?.code ?? ""} subtitle={`Đơn ${detail?.orderId}`}>
        {detail && (
          <div className="space-y-3 text-sm">
            <p>
              <span className="text-[#8D93A5]">Khách hàng:</span> {detail.customer}
            </p>
            <p>
              <span className="text-[#8D93A5]">Ghi chú:</span> {detail.reason}
            </p>
            <p>
              <span className="text-[#8D93A5]">Tổng tiền:</span> {detail.amount}
            </p>
            <div className="flex flex-col gap-2 pt-4">
              {detail.paymentMethod === "VNPAY" &&
                detail.paymentStatus === "PAID" &&
                detail.status !== "approved" && (
                  <button
                    type="button"
                    disabled={refunding}
                    onClick={() => void handleRefundVnpay()}
                    className="w-full py-2.5 bg-[#3C50E0] text-white rounded-lg text-sm font-semibold disabled:opacity-60"
                  >
                    {refunding ? "Đang hoàn VNPay..." : "Hoàn tiền qua VNPay"}
                  </button>
                )}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => void updateStatus(detail.id, "REFUNDED")}
                  className="flex-1 py-2.5 bg-green text-white rounded-lg text-sm font-semibold"
                >
                  Đánh dấu hoàn tiền
                </button>
                <button
                  type="button"
                  onClick={() => void updateStatus(detail.id, "CANCELLED")}
                  className="flex-1 py-2.5 border border-red text-red rounded-lg text-sm font-semibold"
                >
                  Hủy đơn
                </button>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
