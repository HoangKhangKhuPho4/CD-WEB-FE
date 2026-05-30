"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import Modal from "@/components/Admin/shared/Modal";
import PrimaryButton from "@/components/Admin/shared/PrimaryButton";
import { adminWarrantyApi } from "@/utils/adminApi";

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

  const submit = async () => {
    if (!form.customerName.trim() || !form.imeiOrSerial.trim() || !form.issueDescription.trim()) {
      toast.error("Điền đầy đủ thông tin bắt buộc");
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
      onSaved();
      onClose();
    } catch {
      toast.error("Tạo phiếu thất bại");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Tạo phiếu bảo hành"
      subtitle="Tiếp nhận thiết bị từ khách hàng"
      wide
      footer={
        <>
          <button type="button" onClick={onClose} className="px-4 py-2.5 text-sm font-semibold text-[#6C6F93]">
            Hủy
          </button>
          <PrimaryButton onClick={() => void submit()} disabled={saving}>
            {saving ? "Đang lưu..." : "Tạo phiếu"}
          </PrimaryButton>
        </>
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input
          value={form.customerName}
          onChange={(e) => setForm((p) => ({ ...p, customerName: e.target.value }))}
          placeholder="Tên khách hàng *"
          className="px-3 py-2.5 border border-gray-3 rounded-lg text-sm"
        />
        <input
          value={form.customerPhone}
          onChange={(e) => setForm((p) => ({ ...p, customerPhone: e.target.value }))}
          placeholder="Số điện thoại *"
          className="px-3 py-2.5 border border-gray-3 rounded-lg text-sm"
        />
        <input
          value={form.imeiOrSerial}
          onChange={(e) => setForm((p) => ({ ...p, imeiOrSerial: e.target.value }))}
          placeholder="IMEI / Serial *"
          className="px-3 py-2.5 border border-gray-3 rounded-lg text-sm md:col-span-2"
        />
        <textarea
          value={form.issueDescription}
          onChange={(e) => setForm((p) => ({ ...p, issueDescription: e.target.value }))}
          placeholder="Mô tả lỗi *"
          rows={3}
          className="px-3 py-2.5 border border-gray-3 rounded-lg text-sm resize-none md:col-span-2"
        />
      </div>
    </Modal>
  );
}
