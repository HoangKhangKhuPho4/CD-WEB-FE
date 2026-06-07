"use client";

import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import Modal from "@/components/Admin/shared/Modal";
import PrimaryButton from "@/components/Admin/shared/PrimaryButton";
import {
  extractWarrantyError,
  warrantyStatusLabel,
} from "@/components/Admin/Warranty/warrantyUtils";
import {
  adminWarrantyApi,
  type WarrantyLookupAdmin,
  type WarrantyTicket,
} from "@/utils/adminApi";
import { formatDate, formatDateTime } from "@/utils/adminFormat";

const STATUS_OPTIONS = [
  { value: "PENDING", label: "Chờ kiểm tra" },
  { value: "IN_PROGRESS", label: "Đang sửa chữa" },
  { value: "COMPLETED", label: "Đã sửa xong" },
  { value: "RETURNED", label: "Đã trả khách" },
  { value: "CANCELLED", label: "Đã hủy" },
];

const QUICK_ACTIONS = [
  { status: "IN_PROGRESS", label: "Bắt đầu sửa" },
  { status: "COMPLETED", label: "Hoàn tất sửa" },
  { status: "RETURNED", label: "Trả máy khách" },
  { status: "CANCELLED", label: "Hủy phiếu" },
];

const timelineSteps = [
  { key: "PENDING", label: "Tiếp nhận" },
  { key: "IN_PROGRESS", label: "Sửa chữa" },
  { key: "COMPLETED", label: "Hoàn tất" },
  { key: "RETURNED", label: "Trả máy" },
];

function stepIndex(status?: string): number {
  const u = (status ?? "").toUpperCase();
  if (u === "CANCELLED") return 0;
  if (u === "PENDING") return 0;
  if (u === "IN_PROGRESS") return 1;
  if (u === "COMPLETED") return 2;
  if (u === "RETURNED") return 3;
  return 0;
}

export default function WarrantyDetailModal({
  open,
  ticketId,
  onClose,
  onUpdated,
}: {
  open: boolean;
  ticketId: number | null;
  onClose: () => void;
  onUpdated?: () => void;
}) {
  const [ticket, setTicket] = useState<WarrantyTicket | null>(null);
  const [deviceLookup, setDeviceLookup] = useState<WarrantyLookupAdmin | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState("PENDING");
  const [technicianNote, setTechnicianNote] = useState("");
  const [repairCost, setRepairCost] = useState("");

  const load = useCallback(async () => {
    if (!ticketId) return;
    setLoading(true);
    try {
      const res = await adminWarrantyApi.get(ticketId);
      if (res.data.success && res.data.data) {
        const t = res.data.data;
        setTicket(t);
        setStatus((t.status ?? "PENDING").toUpperCase());
        setTechnicianNote(t.technicianNote ?? "");
        setRepairCost(t.repairCost != null ? String(t.repairCost) : "");

        const imei = t.imei ?? t.serialNumber;
        if (imei) {
          try {
            const lookupRes = await adminWarrantyApi.lookup(imei);
            if (lookupRes.data.success) setDeviceLookup(lookupRes.data.data);
          } catch {
            setDeviceLookup(null);
          }
        }
      }
    } catch {
      toast.error("Không tải được chi tiết phiếu");
    } finally {
      setLoading(false);
    }
  }, [ticketId]);

  useEffect(() => {
    if (open && ticketId) void load();
    if (!open) {
      setTicket(null);
      setDeviceLookup(null);
    }
  }, [open, ticketId, load]);

  const saveStatus = async (nextStatus?: string) => {
    if (!ticketId) return;
    setSaving(true);
    try {
      const body: { status: string; technicianNote?: string; repairCost?: number } = {
        status: nextStatus ?? status,
        technicianNote: technicianNote.trim() || undefined,
      };
      const cost = parseFloat(repairCost);
      if (!Number.isNaN(cost) && repairCost.trim()) body.repairCost = cost;

      const res = await adminWarrantyApi.updateStatus(ticketId, body);
      if (res.data.success) {
        toast.success("Đã cập nhật phiếu bảo hành");
        setTicket(res.data.data);
        setStatus((res.data.data.status ?? body.status).toUpperCase());
        onUpdated?.();
      }
    } catch (err) {
      toast.error(extractWarrantyError(err, "Cập nhật thất bại"));
    } finally {
      setSaving(false);
    }
  };

  const activeStep = stepIndex(ticket?.status);
  const code = ticket?.ticketCode ? ticket.ticketCode : ticket ? `WR-${ticket.id}` : "";
  const product = ticket?.variantName
    ? `${ticket.productName} (${ticket.variantName})`
    : ticket?.productName ?? "—";

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={ticket ? `Phiếu ${code}` : "Chi tiết phiếu"}
      subtitle={
        ticket?.statusDisplay ??
        (ticket?.status ? warrantyStatusLabel(ticket.status) : undefined)
      }
      wide
      footer={
        <div className="flex flex-wrap gap-2 justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 border border-gray-3 text-sm font-medium rounded-lg text-[#6C6F93]"
          >
            Đóng
          </button>
          <PrimaryButton onClick={() => void saveStatus()} disabled={saving || loading || !ticket}>
            {saving ? "Đang lưu..." : "Lưu cập nhật"}
          </PrimaryButton>
        </div>
      }
    >
      {loading ? (
        <p className="text-sm text-[#8D93A5] py-8 text-center">Đang tải...</p>
      ) : !ticket ? (
        <p className="text-sm text-[#8D93A5] py-8 text-center">Không có dữ liệu phiếu</p>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-[#8D93A5] text-xs">Khách hàng</p>
              <p className="font-semibold">{ticket.customerName ?? "—"}</p>
              <p className="text-[#6C6F93]">{ticket.customerPhone ?? "—"}</p>
            </div>
            <div>
              <p className="text-[#8D93A5] text-xs">Thiết bị</p>
              <p className="font-semibold">{product}</p>
              <p className="font-mono text-xs">{ticket.imei ?? ticket.serialNumber ?? "—"}</p>
            </div>
            <div>
              <p className="text-[#8D93A5] text-xs">Thời gian</p>
              <p>Tiếp nhận: {formatDateTime(ticket.receivedAt)}</p>
              {ticket.resolvedAt && <p>Hoàn tất: {formatDateTime(ticket.resolvedAt)}</p>}
              {ticket.returnedAt && <p>Trả khách: {formatDateTime(ticket.returnedAt)}</p>}
              {ticket.createdBy && <p className="text-[#6C6F93]">NV: {ticket.createdBy}</p>}
            </div>
          </div>

          <p className="text-sm">
            <span className="text-[#8D93A5]">Mô tả lỗi: </span>
            {ticket.issueDescription ?? "—"}
          </p>

          {deviceLookup?.warranty && (
            <div className="p-4 bg-[#F7F9FC] rounded-xl border border-gray-3/50 text-sm">
              <p className="font-semibold mb-1">Tra cứu bảo hành thiết bị</p>
              <p className={deviceLookup.warranty.isValid ? "text-green" : "text-yellow-dark-2"}>
                {deviceLookup.warranty.message}
              </p>
              {deviceLookup.warranty.warrantyEndDate && (
                <p className="text-[#6C6F93] mt-1">
                  Hết hạn: {formatDate(deviceLookup.warranty.warrantyEndDate)}
                </p>
              )}
              {deviceLookup.purchase?.orderCode && (
                <p className="text-[#6C6F93]">Đơn hàng: {deviceLookup.purchase.orderCode}</p>
              )}
            </div>
          )}

          <div>
            <p className="text-xs font-bold text-[#8D93A5] uppercase mb-3">Tiến trình xử lý</p>
            <div className="flex items-center justify-between gap-1">
              {timelineSteps.map((step, i) => (
                <div key={step.key} className="flex flex-col items-center flex-1 min-w-0">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                      i <= activeStep ? "bg-[#3C50E0] text-white" : "bg-gray-3 text-[#8D93A5]"
                    }`}
                  >
                    {i + 1}
                  </div>
                  <p className="text-[10px] mt-1 text-center text-[#6C6F93] truncate w-full">
                    {step.label}
                  </p>
                </div>
              ))}
            </div>
            {(ticket.status ?? "").toUpperCase() === "CANCELLED" && (
              <p className="text-xs text-red mt-2 font-medium">Phiếu đã hủy</p>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            {QUICK_ACTIONS.map((action) => (
              <button
                key={action.status}
                type="button"
                disabled={saving || ticket.status === action.status}
                onClick={() => {
                  setStatus(action.status);
                  void saveStatus(action.status);
                }}
                className="px-3 py-1.5 text-xs font-semibold border border-gray-3 rounded-lg hover:bg-[#F7F9FC] disabled:opacity-50"
              >
                {action.label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-gray-3/50">
            <div>
              <label className="block text-xs font-medium text-[#8D93A5] mb-1">Trạng thái</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-3 rounded-lg text-sm"
              >
                {STATUS_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-[#8D93A5] mb-1">
                Chi phí sửa chữa (VNĐ)
              </label>
              <input
                type="number"
                min={0}
                value={repairCost}
                onChange={(e) => setRepairCost(e.target.value)}
                placeholder="0 = bảo hành miễn phí"
                className="w-full px-3 py-2.5 border border-gray-3 rounded-lg text-sm"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-[#8D93A5] mb-1">
                Ghi chú kỹ thuật viên
              </label>
              <textarea
                value={technicianNote}
                onChange={(e) => setTechnicianNote(e.target.value)}
                rows={3}
                className="w-full px-3 py-2.5 border border-gray-3 rounded-lg text-sm resize-none"
                placeholder="Ghi chú xử lý, linh kiện thay thế..."
              />
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
}
