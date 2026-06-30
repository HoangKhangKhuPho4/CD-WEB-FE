"use client";

import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import Modal from "@/components/Admin/shared/Modal";
import {
  adminPurchaseOrderApi,
  type PurchaseOrderSummary,
} from "@/utils/adminApi";

export default function PoApprovalPanel() {
  const [rows, setRows] = useState<PurchaseOrderSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [rejectTarget, setRejectTarget] = useState<PurchaseOrderSummary | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminPurchaseOrderApi.list({ scope: "approval" });
      setRows(res.data.data ?? []);
    } catch {
      toast.error("Không tải được danh sách chờ duyệt");
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const approve = async (id: number) => {
    setActionLoading(true);
    try {
      await adminPurchaseOrderApi.approve(id);
      toast.success("Đã phê duyệt — PO chuyển xuống kho");
      await load();
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        "Duyệt thất bại";
      toast.error(msg);
    } finally {
      setActionLoading(false);
    }
  };

  const openReject = (row: PurchaseOrderSummary) => {
    setRejectTarget(row);
    setRejectReason("");
  };

  const confirmReject = async () => {
    if (!rejectTarget) return;
    if (!rejectReason.trim()) {
      toast.error("Vui lòng nhập lý do từ chối");
      return;
    }
    setActionLoading(true);
    try {
      await adminPurchaseOrderApi.reject(rejectTarget.id, {
        rejectReason: rejectReason.trim(),
      });
      toast.success(`Đã từ chối PO ${rejectTarget.code}`);
      setRejectTarget(null);
      setRejectReason("");
      await load();
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        "Từ chối thất bại";
      toast.error(msg);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <>
      <div className="bg-white rounded-xl border border-gray-3/50 overflow-hidden">
        <div className="px-6 py-4 bg-[#DCFCE7] border-b border-[#BBF7D0]">
          <h2 className="text-sm font-bold text-[#15803D] uppercase tracking-wide">
            Chứng từ chờ phê duyệt
          </h2>
          <p className="text-xs text-[#166534] mt-1">
            Chỉ hiển thị PO ở trạng thái PENDING — duyệt để chuyển xuống kho
          </p>
        </div>
        <table className="w-full min-w-[800px]">
          <thead>
            <tr className="bg-[#DCFCE7]/60 border-b border-[#BBF7D0]">
              <th className="text-left px-6 py-3 text-xs font-bold text-[#166534] uppercase">
                Mã PO
              </th>
              <th className="text-left px-4 py-3 text-xs font-bold text-[#166534] uppercase">
                NCC
              </th>
              <th className="text-left px-4 py-3 text-xs font-bold text-[#166534] uppercase">
                Trạng thái
              </th>
              <th className="text-right px-4 py-3 text-xs font-bold text-[#166534] uppercase">
                Tổng SL
              </th>
              <th className="text-left px-4 py-3 text-xs font-bold text-[#166534] uppercase">
                Hẹn giao
              </th>
              <th className="text-center px-6 py-3 text-xs font-bold text-[#166534] uppercase">
                Thao tác
              </th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-sm text-[#8D93A5]">
                  Đang tải...
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-sm text-[#8D93A5]">
                  Không có chứng từ chờ duyệt
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr
                  key={row.id}
                  className="border-b border-[#FEF3C7]/80 bg-[#FFFBEB] hover:bg-[#FEF3C7]/60 transition-colors"
                >
                  <td className="px-6 py-4 text-sm font-semibold text-[#3C50E0]">
                    {row.code}
                  </td>
                  <td className="px-4 py-4 text-sm">{row.supplier}</td>
                  <td className="px-4 py-4">
                    <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-semibold bg-[#FFEDD5] text-[#C2410C]">
                      Chờ duyệt
                    </span>
                  </td>
                  <td className="px-4 py-4 text-sm text-right font-medium">
                    {(row.totalQuantity ?? row.items).toLocaleString("vi-VN")}
                  </td>
                  <td className="px-4 py-4 text-sm text-[#6C6F93]">{row.expectedDate}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        type="button"
                        disabled={actionLoading}
                        onClick={() => void approve(row.id)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-[#16A34A] hover:bg-[#15803D] disabled:opacity-60"
                      >
                        <span aria-hidden>✓</span> Phê duyệt
                      </button>
                      <button
                        type="button"
                        disabled={actionLoading}
                        onClick={() => openReject(row)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold text-[#DC2626] border border-[#FCA5A5] bg-white hover:bg-[#FEF2F2] disabled:opacity-60"
                      >
                        <span aria-hidden>✕</span> Từ chối
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Modal
        open={!!rejectTarget}
        onClose={() => {
          if (!actionLoading) {
            setRejectTarget(null);
            setRejectReason("");
          }
        }}
        title="Từ chối đơn mua hàng"
        subtitle={rejectTarget?.code}
        footer={
          <div className="flex gap-2 justify-end w-full">
            <button
              type="button"
              disabled={actionLoading}
              onClick={() => {
                setRejectTarget(null);
                setRejectReason("");
              }}
              className="px-4 py-2 rounded-lg border border-gray-3 text-sm font-semibold text-[#6C6F93]"
            >
              Hủy
            </button>
            <button
              type="button"
              disabled={actionLoading}
              onClick={() => void confirmReject()}
              className="px-4 py-2 rounded-lg text-sm font-bold text-white bg-[#DC2626] hover:bg-[#B91C1C] disabled:opacity-60"
            >
              {actionLoading ? "Đang xử lý..." : "Xác nhận từ chối"}
            </button>
          </div>
        }
      >
        <div className="space-y-3">
          <p className="text-sm text-[#6C6F93]">
            PO <strong>{rejectTarget?.code}</strong> — NCC{" "}
            <strong>{rejectTarget?.supplier}</strong>
          </p>
          <label className="block text-sm">
            <span className="font-medium text-dark">
              Lý do từ chối <span className="text-red">*</span>
            </span>
            <textarea
              className="mt-2 w-full border border-gray-3 rounded-lg px-3 py-2 text-sm min-h-[100px]"
              placeholder="Nhập lý do từ chối (bắt buộc)..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
            />
          </label>
        </div>
      </Modal>
    </>
  );
}
