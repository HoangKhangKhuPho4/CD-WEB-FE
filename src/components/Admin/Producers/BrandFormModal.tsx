"use client";

import { useEffect, useState } from "react";
import Modal from "@/components/Admin/shared/Modal";
import PrimaryButton from "@/components/Admin/shared/PrimaryButton";

export interface BrandFormData {
  name: string;
  code: string;
  country: string;
  website: string;
  description: string;
  logoUrl: string;
  isActive: boolean;
}

export const emptyBrandForm = (): BrandFormData => ({
  name: "",
  code: "",
  country: "",
  website: "",
  description: "",
  logoUrl: "",
  isActive: true,
});

export function suggestBrandCode(name: string): string {
  return name
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .slice(0, 10);
}

export default function BrandFormModal({
  open,
  onClose,
  onSave,
  initial,
  isEdit,
  codeHint,
  onCodeBlur,
}: {
  open: boolean;
  onClose: () => void;
  onSave: (data: BrandFormData) => void;
  initial?: BrandFormData;
  isEdit?: boolean;
  codeHint?: string;
  onCodeBlur?: (code: string) => void;
}) {
  const [form, setForm] = useState<BrandFormData>(emptyBrandForm());

  useEffect(() => {
    if (open) setForm(initial ?? emptyBrandForm());
  }, [open, initial]);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? "Sửa thương hiệu" : "Thêm thương hiệu"}
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 text-sm font-semibold text-[#6C6F93]"
          >
            Hủy
          </button>
          <PrimaryButton onClick={() => onSave(form)}>Lưu</PrimaryButton>
        </>
      }
    >
      <div className="space-y-4">
        <input
          value={form.name}
          onChange={(e) => {
            const name = e.target.value;
            setForm((p) => ({
              ...p,
              name,
              code: isEdit ? p.code : suggestBrandCode(name) || p.code,
            }));
          }}
          placeholder="Tên thương hiệu *"
          className="w-full px-3 py-2.5 border border-gray-3 rounded-lg text-sm"
        />
        <div>
          <input
            value={form.code}
            onChange={(e) =>
              setForm((p) => ({ ...p, code: e.target.value.toUpperCase().slice(0, 10) }))
            }
            disabled={isEdit}
            onBlur={() => onCodeBlur?.(form.code)}
            placeholder="Mã thương hiệu * (tối đa 10 ký tự)"
            className="w-full px-3 py-2.5 border border-gray-3 rounded-lg text-sm uppercase disabled:bg-gray-1"
          />
          {codeHint && (
            <p className={`text-xs mt-1 ${codeHint.includes("khả dụng") ? "text-green" : "text-red"}`}>
              {codeHint}
            </p>
          )}
        </div>
        <input
          value={form.country}
          onChange={(e) => setForm((p) => ({ ...p, country: e.target.value }))}
          placeholder="Quốc gia"
          className="w-full px-3 py-2.5 border border-gray-3 rounded-lg text-sm"
        />
        <input
          value={form.website}
          onChange={(e) => setForm((p) => ({ ...p, website: e.target.value }))}
          placeholder="Website (https://...)"
          className="w-full px-3 py-2.5 border border-gray-3 rounded-lg text-sm"
        />
        <input
          value={form.logoUrl}
          onChange={(e) => setForm((p) => ({ ...p, logoUrl: e.target.value }))}
          placeholder="URL logo"
          className="w-full px-3 py-2.5 border border-gray-3 rounded-lg text-sm"
        />
        <textarea
          value={form.description}
          onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
          placeholder="Mô tả"
          rows={2}
          className="w-full px-3 py-2.5 border border-gray-3 rounded-lg text-sm"
        />
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.isActive}
            onChange={(e) => setForm((p) => ({ ...p, isActive: e.target.checked }))}
          />
          Đang hoạt động
        </label>
      </div>
    </Modal>
  );
}
