"use client";

import { useEffect, useState } from "react";
import Modal from "@/components/Admin/shared/Modal";
import PrimaryButton from "@/components/Admin/shared/PrimaryButton";

export interface BrandFormData {
  name: string;
  country: string;
  website: string;
}

export default function BrandFormModal({
  open,
  onClose,
  onSave,
  initial,
}: {
  open: boolean;
  onClose: () => void;
  onSave: (data: BrandFormData) => void;
  initial?: BrandFormData;
}) {
  const [form, setForm] = useState<BrandFormData>(
    initial ?? { name: "", country: "", website: "" }
  );

  useEffect(() => {
    if (open) setForm(initial ?? { name: "", country: "", website: "" });
  }, [open, initial]);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={initial ? "Sửa thương hiệu" : "Thêm thương hiệu"}
      footer={
        <>
          <button type="button" onClick={onClose} className="px-4 py-2.5 text-sm font-semibold text-[#6C6F93]">
            Hủy
          </button>
          <PrimaryButton onClick={() => onSave(form)}>Lưu</PrimaryButton>
        </>
      }
    >
      <div className="space-y-4">
        <input
          value={form.name}
          onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
          placeholder="Tên thương hiệu *"
          className="w-full px-3 py-2.5 border border-gray-3 rounded-lg text-sm"
        />
        <input
          value={form.country}
          onChange={(e) => setForm((p) => ({ ...p, country: e.target.value }))}
          placeholder="Quốc gia"
          className="w-full px-3 py-2.5 border border-gray-3 rounded-lg text-sm"
        />
        <input
          value={form.website}
          onChange={(e) => setForm((p) => ({ ...p, website: e.target.value }))}
          placeholder="Website"
          className="w-full px-3 py-2.5 border border-gray-3 rounded-lg text-sm"
        />
      </div>
    </Modal>
  );
}
