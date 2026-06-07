"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import Modal from "@/components/Admin/shared/Modal";
import PrimaryButton from "@/components/Admin/shared/PrimaryButton";
import {
  extractWarrantyError,
} from "@/components/Admin/Warranty/warrantyUtils";
import {
  adminWarrantyApi,
  type WarrantyLookupAdmin,
  type WarrantyValidateResponse,
} from "@/utils/adminApi";
import { formatDate } from "@/utils/adminFormat";

export default function WarrantyCreateModal({
  open,
  onClose,
  onSaved,
}: {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState({
    customerName: "",
    customerPhone: "",
    imeiOrSerial: "",
    issueDescription: "",
  });
  const [saving, setSaving] = useState(false);
  const [validating, setValidating] = useState(false);
  const [lookingUp, setLookingUp] = useState(false);
  const [validation, setValidation] = useState<WarrantyValidateResponse | null>(null);
  const [lookup, setLookup] = useState<WarrantyLookupAdmin | null>(null);

  const resetAux = () => {
    setValidation(null);
    setLookup(null);
  };

  const lookupDevice = async () => {
    const code = form.imeiOrSerial.trim();
    if (!code) {
      toast.error("Nhập IMEI/Serial để tra cứu");
      return;
    }
    setLookingUp(true);
    resetAux();
    try {
      const res = await adminWarrantyApi.lookup(code);
      if (res.data.success) {
        setLookup(res.data.data);
        toast.success("Đã tra cứu thiết bị");
      }
    } catch (err) {
      toast.error(extractWarrantyError(err, "Không tra cứu được thiết bị"));
    } finally {
      setLookingUp(false);
    }
  };

  const validateTicket = async () => {
    if (!form.customerName.trim() || !form.imeiOrSerial.trim() || !form.issueDescription.trim()) {
      toast.error("Điền đầy đủ thông tin bắt buộc trước khi kiểm tra");
      return;
    }
    setValidating(true);
    try {
      const res = await adminWarrantyApi.validate({
        customerName: form.customerName.trim(),
        customerPhone: form.customerPhone.trim(),
        imeiOrSerial: form.imeiOrSerial.trim(),
        issueDescription: form.issueDescription.trim(),
      });
      if (res.data.success) {
        setValidation(res.data.data);
        toast.success(res.data.data.valid ? "Có thể tạo phiếu" : res.data.data.message ?? "Cần xử lý trước khi tạo");
      }
    } catch (err) {
      toast.error(extractWarrantyError(err, "Kiểm tra phiếu thất bại"));
    } finally {
      setValidating(false);
    }
  };

  const submit = async () => {
    if (!form.customerName.trim() || !form.imeiOrSerial.trim() || !form.issueDescription.trim()) {
      toast.error("Điền đầy đủ thông tin bắt buộc");
      return;
    }
    if (validation && !validation.valid) {
      toast.error(validation.message ?? "Phiếu chưa hợp lệ — kiểm tra lại");
      return;
    }
    setSaving(true);
    try {
      await adminWarrantyApi.create({
        customerName: form.customerName.trim(),
        customerPhone: form.customerPhone.trim(),
        imeiOrSerial: form.imeiOrSerial.trim(),
        issueDescription: form.issueDescription.trim(),
      });
      toast.success("Đã tạo phiếu bảo hành");
      setForm({ customerName: "", customerPhone: "", imeiOrSerial: "", issueDescription: "" });
      resetAux();
      onSaved();
      onClose();
    } catch (err) {
      toast.error(extractWarrantyError(err, "Tạo phiếu thất bại"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Tạo phiếu bảo hành"
      subtitle="Tra cứu thiết bị, kiểm tra trước khi tiếp nhận"
      wide
      footer={
        <>
          <button type="button" onClick={onClose} className="px-4 py-2.5 text-sm font-semibold text-[#6C6F93]">
            Hủy
          </button>
          <button
            type="button"
            onClick={() => void validateTicket()}
            disabled={validating}
            className="px-4 py-2.5 text-sm font-semibold text-[#3C50E0] border border-[#3C50E0]/30 rounded-lg"
          >
            {validating ? "Đang kiểm tra..." : "Kiểm tra phiếu"}
          </button>
          <PrimaryButton
            onClick={() => void submit()}
            disabled={saving || (validation != null && !validation.valid)}
          >
            {saving ? "Đang lưu..." : "Tạo phiếu"}
          </PrimaryButton>
        </>
      }
    >
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            value={form.customerName}
            onChange={(e) => {
              setForm((p) => ({ ...p, customerName: e.target.value }));
              resetAux();
            }}
            placeholder="Tên khách hàng *"
            className="px-3 py-2.5 border border-gray-3 rounded-lg text-sm"
          />
          <input
            value={form.customerPhone}
            onChange={(e) => {
              setForm((p) => ({ ...p, customerPhone: e.target.value }));
              resetAux();
            }}
            placeholder="Số điện thoại *"
            className="px-3 py-2.5 border border-gray-3 rounded-lg text-sm"
          />
        </div>

        <div className="flex gap-2">
          <input
            value={form.imeiOrSerial}
            onChange={(e) => {
              setForm((p) => ({ ...p, imeiOrSerial: e.target.value }));
              resetAux();
            }}
            placeholder="IMEI / Serial *"
            className="flex-1 px-3 py-2.5 border border-gray-3 rounded-lg text-sm font-mono"
          />
          <button
            type="button"
            onClick={() => void lookupDevice()}
            disabled={lookingUp}
            className="px-4 py-2.5 text-sm font-semibold border border-gray-3 rounded-lg hover:bg-[#F7F9FC]"
          >
            {lookingUp ? "..." : "Tra cứu"}
          </button>
        </div>

        <textarea
          value={form.issueDescription}
          onChange={(e) => {
            setForm((p) => ({ ...p, issueDescription: e.target.value }));
            resetAux();
          }}
          placeholder="Mô tả lỗi / tình trạng máy *"
          rows={3}
          className="w-full px-3 py-2.5 border border-gray-3 rounded-lg text-sm resize-none"
        />

        {lookup?.found && lookup.warranty && (
          <div className="p-4 bg-[#F7F9FC] rounded-xl border border-gray-3/50 text-sm space-y-1">
            <p className="font-semibold text-dark">Thông tin thiết bị</p>
            <p>
              {lookup.warranty.productName}
              {lookup.warranty.variantName ? ` (${lookup.warranty.variantName})` : ""}
            </p>
            <p className={lookup.warranty.isValid ? "text-green" : "text-yellow-dark-2"}>
              {lookup.warranty.message}
            </p>
            {lookup.warranty.warrantyEndDate && (
              <p className="text-[#6C6F93]">Hết hạn BH: {formatDate(lookup.warranty.warrantyEndDate)}</p>
            )}
            {lookup.purchase?.orderCode && (
              <p className="text-[#6C6F93]">Đơn mua: {lookup.purchase.orderCode}</p>
            )}
            {(lookup.repairTickets?.length ?? 0) > 0 && (
              <p className="text-[#6C6F93]">
                Lịch sử phiếu: {lookup.repairTickets!.map((t) => t.ticketCode).join(", ")}
              </p>
            )}
          </div>
        )}

        {validation && (
          <div
            className={`p-4 rounded-xl border text-sm ${
              validation.valid
                ? "bg-green-light-6 border-green-light-5 text-green"
                : "bg-red-light-6 border-red-light-4 text-red"
            }`}
          >
            <p className="font-semibold">{validation.valid ? "Phiếu hợp lệ" : "Chưa thể tạo phiếu"}</p>
            <p>{validation.message}</p>
            {validation.hasActiveTicket && validation.activeTicketCode && (
              <p className="mt-1">Phiếu đang mở: {validation.activeTicketCode}</p>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
}
