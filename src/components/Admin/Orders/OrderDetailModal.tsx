"use client";

import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import Modal from "@/components/Admin/shared/Modal";
import { useOrdersAdmin, type OrderDetail } from "@/components/Admin/Orders/ordersAdminStore";
import type { RootState } from "@/redux/store";
import { formatDateTime, formatVnd } from "@/utils/adminFormat";
import {
  allowedNextStatuses,
  canAssignImei,
  canEditTracking,
  canUpdateOrderStatus,
} from "@/utils/orderPermissions";
import { adminOrderApi } from "@/utils/adminApi";

const STATUS_LABELS: Record<string, string> = {
  PENDING: "Chờ xác nhận",
  CONFIRMED: "Đã xác nhận",
  PROCESSING: "Đang xử lý",
  SHIPPING: "Đang giao",
  DELIVERED: "Đã giao",
  COMPLETED: "Hoàn tất",
  CANCELLED: "Đã hủy",
};

export default function OrderDetailModal({
  open,
  onClose,
  orderId,
}: {
  open: boolean;
  onClose: () => void;
  orderId: number | null;
}) {
  const user = useSelector((s: RootState) => s.authReducer.user);
  const { fetchDetail, updateStatus } = useOrdersAdmin();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [detail, setDetail] = useState<OrderDetail | null>(null);
  const [nextStatus, setNextStatus] = useState("");
  const [note, setNote] = useState("");
  const [trackingCode, setTrackingCode] = useState("");
  const [ghnOrderCode, setGhnOrderCode] = useState("");
  const [imeiInputs, setImeiInputs] = useState<Record<number, string>>({});
  const [assigningImei, setAssigningImei] = useState<number | null>(null);
  const [printingLabel, setPrintingLabel] = useState(false);

  useEffect(() => {
    if (!open || orderId == null) {
      setDetail(null);
      return;
    }
    let cancelled = false;
    setLoading(true);
    void fetchDetail(orderId).then((d) => {
      if (!cancelled && d) {
        setDetail(d);
        setTrackingCode(d.trackingCode ?? "");
        setGhnOrderCode(d.ghnOrderCode ?? "");
        const next = allowedNextStatuses(d.status, user);
        setNextStatus(next[0] ?? "");
      }
      if (!cancelled) setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [open, orderId, fetchDetail, user]);

  if (!open || orderId == null) return null;

  const nextOptions = detail ? allowedNextStatuses(detail.status, user) : [];
  const showUpdate = canUpdateOrderStatus(user) && nextOptions.length > 0;
  const showTracking =
    canEditTracking(user) &&
    (nextStatus.toUpperCase() === "SHIPPING" || detail?.status.toUpperCase() === "SHIPPING");
  const showAssignImei =
    canAssignImei(user) &&
    detail &&
    ["CONFIRMED", "PROCESSING"].includes(detail.status.toUpperCase());

  const handlePrintGhnLabel = async () => {
    if (orderId == null) return;
    setPrintingLabel(true);
    try {
      const res = await adminOrderApi.ghnPrintLabel(orderId);
      if (res.data.success && res.data.data?.printUrl) {
        window.open(res.data.data.printUrl, "_blank", "noopener,noreferrer");
        toast.success("Đã mở trang in nhãn vận đơn GHN");
      } else {
        toast.error(res.data.message || "Không lấy được link in nhãn");
      }
    } catch {
      toast.error("Không lấy được link in nhãn GHN");
    } finally {
      setPrintingLabel(false);
    }
  };

  const handleAssignImei = async (orderDetailId: number) => {
    if (orderId == null) return;
    const raw = imeiInputs[orderDetailId] ?? "";
    const imeis = raw
      .split(/[\n,;]+/)
      .map((s) => s.trim())
      .filter(Boolean);
    if (!imeis.length) {
      toast.error("Nhập ít nhất một mã IMEI/Serial");
      return;
    }
    setAssigningImei(orderDetailId);
    try {
      await adminOrderApi.assignImei(orderId, orderDetailId, imeis);
      toast.success("Đã gán IMEI");
      const refreshed = await fetchDetail(orderId);
      setDetail(refreshed);
      setImeiInputs((prev) => ({ ...prev, [orderDetailId]: "" }));
    } catch {
      toast.error("Gán IMEI thất bại");
    } finally {
      setAssigningImei(null);
    }
  };

  const handleSave = async () => {
    if (!detail || !nextStatus) {
      toast.error("Chọn trạng thái mới");
      return;
    }
    setSaving(true);
    try {
      await updateStatus(orderId, nextStatus, note || undefined, {
        trackingCode: trackingCode.trim() || undefined,
        ghnOrderCode: ghnOrderCode.trim() || undefined,
      });
      const refreshed = await fetchDetail(orderId);
      setDetail(refreshed);
      setNote("");
      onClose();
    } catch {
      /* toast in store */
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={detail ? `Chi tiết đơn ${detail.code}` : "Chi tiết đơn hàng"}
      subtitle={
        detail?.date ? `Đặt ngày ${formatDateTime(detail.date)}` : "Đang tải..."
      }
      wide
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 text-sm font-semibold text-[#6C6F93]"
          >
            Đóng
          </button>
          {showUpdate && (
            <button
              type="button"
              disabled={saving || !nextStatus}
              onClick={() => void handleSave()}
              className="px-5 py-2.5 bg-[#3C50E0] text-white text-sm font-semibold rounded-lg hover:bg-[#1C3FB7] disabled:opacity-50"
            >
              {saving ? "Đang lưu..." : "Cập nhật trạng thái"}
            </button>
          )}
        </>
      }
    >
      {loading || !detail ? (
        <p className="text-sm text-[#8D93A5] py-8 text-center">Đang tải chi tiết...</p>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <p className="text-xs text-[#8D93A5] mb-1">Khách hàng</p>
                <p className="font-semibold text-dark">{detail.customerName}</p>
                <p className="text-sm text-[#6C6F93]">{detail.phone}</p>
              </div>
              <div>
                <p className="text-xs text-[#8D93A5] mb-1">Địa chỉ giao</p>
                <p className="text-sm text-dark">{detail.address}</p>
              </div>
              <div className="flex flex-wrap gap-4">
                <div>
                  <p className="text-xs text-[#8D93A5]">Thanh toán</p>
                  <p className="text-sm font-medium">{detail.payment}</p>
                </div>
                <div>
                  <p className="text-xs text-[#8D93A5]">Trạng thái</p>
                  <p className="text-sm font-medium">
                    {STATUS_LABELS[detail.status.toUpperCase()] ?? detail.status}
                  </p>
                </div>
              </div>
              {(detail.trackingCode || detail.ghnOrderCode) && (
                <div className="text-sm text-[#606882] space-y-2">
                  {detail.trackingCode && <p>Mã tracking: {detail.trackingCode}</p>}
                  {detail.ghnOrderCode && (
                    <div className="flex flex-wrap items-center gap-2">
                      <p>Mã GHN: {detail.ghnOrderCode}</p>
                      <button
                        type="button"
                        disabled={printingLabel}
                        onClick={() => void handlePrintGhnLabel()}
                        className="text-xs font-semibold text-[#3C50E0] hover:underline disabled:opacity-50"
                      >
                        {printingLabel ? "Đang tải..." : "In nhãn / PDF GHN"}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
            <div>
              <p className="text-xs font-bold text-[#8D93A5] uppercase mb-2">Sản phẩm</p>
              <ul className="space-y-2">
                {detail.items.map((item, i) => (
                  <li
                    key={i}
                    className="flex justify-between text-sm p-2 rounded-lg bg-[#F7F9FC]"
                  >
                    <span>
                      {item.name} × {item.qty}
                    </span>
                    <span className="font-semibold">{item.price}</span>
                  </li>
                ))}
              </ul>
              <p className="text-right font-bold text-dark mt-3">
                Tổng: {formatVnd(Number(detail.total))}
              </p>
            </div>
          </div>

          {detail.timeline && detail.timeline.length > 0 && (
            <div>
              <p className="text-xs font-bold text-[#8D93A5] uppercase mb-2">Lịch sử</p>
              <ul className="space-y-2 max-h-32 overflow-y-auto">
                {detail.timeline.map((t, i) => (
                  <li key={i} className="text-xs text-[#606882] border-l-2 border-[#3C50E0]/30 pl-3">
                    <span className="font-semibold">
                      {STATUS_LABELS[t.status?.toUpperCase() ?? ""] ?? t.status}
                    </span>
                    {t.note && ` — ${t.note}`}
                    {t.createdAt && (
                      <span className="block text-[#8D93A5]">
                        {formatDateTime(t.createdAt)}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {showAssignImei && (
            <div className="border-t border-gray-3/50 pt-4 space-y-3">
              <p className="text-sm font-semibold text-dark">Gán IMEI / Serial</p>
              <p className="text-xs text-[#8D93A5]">
                Khi đơn đã xác nhận — nhập nhiều mã, cách nhau bởi dấu phẩy hoặc xuống dòng.
              </p>
              {detail.items.map((item) =>
                item.orderDetailId ? (
                  <div
                    key={item.orderDetailId}
                    className="rounded-lg border border-gray-3/50 p-3 space-y-2"
                  >
                    <p className="text-sm font-medium">
                      {item.name} × {item.qty}
                    </p>
                    <textarea
                      value={imeiInputs[item.orderDetailId] ?? ""}
                      onChange={(e) =>
                        setImeiInputs((prev) => ({
                          ...prev,
                          [item.orderDetailId!]: e.target.value,
                        }))
                      }
                      rows={2}
                      placeholder="IMEI hoặc Serial..."
                      className="w-full rounded-lg border border-gray-3 px-3 py-2 text-sm"
                    />
                    <button
                      type="button"
                      disabled={assigningImei === item.orderDetailId}
                      onClick={() => void handleAssignImei(item.orderDetailId!)}
                      className="px-4 py-2 bg-[#02AAA4] text-white text-sm font-semibold rounded-lg disabled:opacity-50"
                    >
                      {assigningImei === item.orderDetailId ? "Đang gán..." : "Gán IMEI"}
                    </button>
                  </div>
                ) : null
              )}
            </div>
          )}

          {showUpdate && (
            <div className="border-t border-gray-3/50 pt-4 space-y-3">
              <p className="text-sm font-semibold text-dark">Cập nhật xử lý đơn</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label className="block">
                  <span className="text-xs text-[#8D93A5]">Trạng thái mới</span>
                  <select
                    value={nextStatus}
                    onChange={(e) => setNextStatus(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-gray-3 px-3 py-2 text-sm"
                  >
                    {nextOptions.map((s) => (
                      <option key={s} value={s}>
                        {STATUS_LABELS[s] ?? s}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block sm:col-span-2">
                  <span className="text-xs text-[#8D93A5]">Ghi chú (tuỳ chọn)</span>
                  <input
                    type="text"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-gray-3 px-3 py-2 text-sm"
                    placeholder="Ghi chú nội bộ"
                  />
                </label>
                {showTracking && (
                  <>
                    <label className="block">
                      <span className="text-xs text-[#8D93A5]">Mã tracking</span>
                      <input
                        type="text"
                        value={trackingCode}
                        onChange={(e) => setTrackingCode(e.target.value)}
                        className="mt-1 w-full rounded-lg border border-gray-3 px-3 py-2 text-sm"
                      />
                    </label>
                    <label className="block">
                      <span className="text-xs text-[#8D93A5]">Mã vận đơn GHN</span>
                      <input
                        type="text"
                        value={ghnOrderCode}
                        onChange={(e) => setGhnOrderCode(e.target.value)}
                        className="mt-1 w-full rounded-lg border border-gray-3 px-3 py-2 text-sm"
                      />
                    </label>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </Modal>
  );
}
