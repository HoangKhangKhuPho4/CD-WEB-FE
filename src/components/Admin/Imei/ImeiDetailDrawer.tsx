"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import PrimaryButton from "@/components/Admin/shared/PrimaryButton";
import { extractApiError } from "@/components/Admin/Imei/imeiUtils";
import {
  IMEI_STATUS_OPTIONS,
  imeiStatusClass,
  imeiStatusLabel,
} from "@/components/Admin/Imei/imeiStatusMap";
import { adminImeiApi, type ImeiDetail } from "@/utils/adminApi";
import { formatDate } from "@/utils/adminFormat";

export default function ImeiDetailDrawer({
  id,
  onClose,
  onUpdated,
}: {
  id: number | null;
  onClose: () => void;
  onUpdated: () => void;
}) {
  const [detail, setDetail] = useState<ImeiDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [editNotes, setEditNotes] = useState("");
  const [editLocation, setEditLocation] = useState("");
  const [saving, setSaving] = useState(false);
  const [newStatus, setNewStatus] = useState("");
  const [statusReason, setStatusReason] = useState("");

  const load = useCallback(async () => {
    if (id == null) return;
    setLoading(true);
    try {
      const res = await adminImeiApi.get(id);
      if (res.data.success) {
        setDetail(res.data.data);
        setEditNotes(res.data.data.notes ?? "");
        setEditLocation(res.data.data.location ?? "");
        setNewStatus(String(res.data.data.status ?? ""));
      }
    } catch (err) {
      toast.error(extractApiError(err, "Không tải chi tiết IMEI"));
      onClose();
    } finally {
      setLoading(false);
    }
  }, [id, onClose]);

  useEffect(() => {
    if (id != null) void load();
    else setDetail(null);
  }, [id, load]);

  const saveMeta = async () => {
    if (id == null) return;
    setSaving(true);
    try {
      await adminImeiApi.update(id, { notes: editNotes, location: editLocation });
      toast.success("Đã cập nhật");
      await load();
      onUpdated();
    } catch (err) {
      toast.error(extractApiError(err, "Cập nhật thất bại"));
    } finally {
      setSaving(false);
    }
  };

  const applyStatus = async () => {
    if (id == null || !newStatus) return;
    try {
      await adminImeiApi.updateStatus(id, { status: newStatus, reason: statusReason || undefined });
      toast.success("Đã đổi trạng thái");
      await load();
      onUpdated();
    } catch (err) {
      toast.error(extractApiError(err, "Đổi trạng thái thất bại"));
    }
  };

  const release = async () => {
    if (id == null) return;
    if (!confirm("Giải phóng IMEI khỏi đơn hàng?")) return;
    try {
      await adminImeiApi.release(id);
      toast.success("Đã giải phóng IMEI");
      await load();
      onUpdated();
    } catch (err) {
      toast.error(extractApiError(err, "Giải phóng thất bại"));
    }
  };

  if (id == null) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} aria-hidden />
      <div className="relative w-full max-w-md bg-white h-full shadow-2xl overflow-y-auto flex flex-col">
        <div className="sticky top-0 bg-white border-b border-gray-3/50 px-5 py-4 flex items-center justify-between">
          <h2 className="font-bold text-dark">Chi tiết IMEI</h2>
          <button type="button" onClick={onClose} className="text-[#6C6F93] hover:text-dark text-xl">
            ×
          </button>
        </div>

        {loading || !detail ? (
          <p className="p-6 text-sm text-[#8D93A5]">Đang tải...</p>
        ) : (
          <div className="p-5 space-y-5 flex-1">
            <div>
              <p className="font-mono text-lg text-[#3C50E0] break-all">
                {detail.imei ?? detail.serialNumber}
              </p>
              <span
                className={`inline-block mt-2 px-2.5 py-1 rounded-full text-xs font-medium ${imeiStatusClass(detail.status)}`}
              >
                {imeiStatusLabel(detail.status)}
              </span>
            </div>

            <dl className="grid grid-cols-2 gap-2 text-sm">
              <dt className="text-[#8D93A5]">Sản phẩm</dt>
              <dd className="font-medium">{detail.productName}</dd>
              <dt className="text-[#8D93A5]">SKU</dt>
              <dd>{detail.skuCode ?? "—"}</dd>
              <dt className="text-[#8D93A5]">Số lô</dt>
              <dd>{detail.batchNumber ?? "—"}</dd>
              <dt className="text-[#8D93A5]">Ngày nhập</dt>
              <dd>{formatDate(detail.createdAt)}</dd>
            </dl>

            {detail.order?.orderCode && (
              <div className="rounded-lg bg-[#F7F9FC] p-3">
                <p className="text-xs text-[#8D93A5] mb-1">Đơn hàng</p>
                <Link
                  href={`/admin/orders`}
                  className="text-sm font-semibold text-[#3C50E0] hover:underline"
                >
                  {detail.order.orderCode}
                </Link>
                <p className="text-xs text-[#6C6F93] mt-1">
                  Trạng thái đơn: {detail.order.orderStatus ?? "—"}
                </p>
                {detail.status === "RESERVED" && (
                  <button
                    type="button"
                    onClick={() => void release()}
                    className="mt-2 text-xs font-semibold text-red hover:underline"
                  >
                    Giải phóng khỏi đơn
                  </button>
                )}
              </div>
            )}

            {detail.warranty && (
              <div className="rounded-lg border border-gray-3/50 p-3">
                <p className="text-xs font-semibold text-[#6C6F93] mb-1">Bảo hành</p>
                <p className="text-sm">{detail.warranty.message}</p>
                {detail.warranty.startDate && (
                  <p className="text-xs text-[#8D93A5] mt-1">
                    Từ {detail.warranty.startDate} — {detail.warranty.months ?? 12} tháng
                  </p>
                )}
                <Link
                  href={`/admin/warranty`}
                  className="text-xs text-[#3C50E0] hover:underline mt-2 inline-block"
                >
                  Quản lý phiếu BH →
                </Link>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-xs font-medium text-[#6C6F93]">Vị trí kho</label>
              <input
                value={editLocation}
                onChange={(e) => setEditLocation(e.target.value)}
                className="w-full px-3 py-2 border border-gray-3 rounded-lg text-sm"
              />
              <label className="text-xs font-medium text-[#6C6F93]">Ghi chú</label>
              <textarea
                value={editNotes}
                onChange={(e) => setEditNotes(e.target.value)}
                rows={2}
                className="w-full px-3 py-2 border border-gray-3 rounded-lg text-sm resize-none"
              />
              <PrimaryButton onClick={() => void saveMeta()} disabled={saving}>
                {saving ? "Đang lưu..." : "Lưu metadata"}
              </PrimaryButton>
            </div>

            <div className="space-y-2 border-t border-gray-3/50 pt-4">
              <p className="text-xs font-semibold text-[#6C6F93]">Đổi trạng thái</p>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-3 rounded-lg text-sm"
              >
                {IMEI_STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {imeiStatusLabel(s)}
                  </option>
                ))}
              </select>
              <input
                value={statusReason}
                onChange={(e) => setStatusReason(e.target.value)}
                placeholder="Lý do (tuỳ chọn)"
                className="w-full px-3 py-2 border border-gray-3 rounded-lg text-sm"
              />
              <button
                type="button"
                onClick={() => void applyStatus()}
                className="w-full py-2 text-sm font-semibold text-[#3C50E0] border border-[#3C50E0]/40 rounded-lg"
              >
                Cập nhật trạng thái
              </button>
            </div>

            {detail.transactions && detail.transactions.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-[#6C6F93] mb-2">Lịch sử kho</p>
                <ul className="space-y-2 max-h-40 overflow-auto">
                  {detail.transactions.map((t) => (
                    <li key={t.id} className="text-xs border-l-2 border-[#3C50E0]/30 pl-2">
                      <span className="font-semibold">{t.transactionType}</span>
                      {t.reason && ` — ${t.reason}`}
                      <span className="block text-[#8D93A5]">{formatDate(t.createdAt)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
