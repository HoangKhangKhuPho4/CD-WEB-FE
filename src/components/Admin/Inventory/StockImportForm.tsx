"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import PrimaryButton from "@/components/Admin/shared/PrimaryButton";
import VariantSearchInput from "@/components/Admin/Inventory/VariantSearchInput";
import {
  extractInventoryError,
  formatVariantLabel,
} from "@/components/Admin/Inventory/inventoryUtils";
import {
  adminInventoryApi,
  type ValidateImportItemResult,
  type VariantSearchHit,
} from "@/utils/adminApi";

type ImportLine = {
  key: string;
  variantId: number | null;
  label: string;
  quantity: string;
};

function emptyLine(): ImportLine {
  return { key: String(Date.now() + Math.random()), variantId: null, label: "", quantity: "1" };
}

export default function StockImportForm({ onSuccess }: { onSuccess?: () => void }) {
  const [lines, setLines] = useState<ImportLine[]>([emptyLine()]);
  const [supplier, setSupplier] = useState("");
  const [note, setNote] = useState("");
  const [validating, setValidating] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [validation, setValidation] = useState<ValidateImportItemResult[] | null>(null);
  const [allValid, setAllValid] = useState(false);

  const buildPayload = () => ({
    items: lines
      .filter((l) => l.variantId != null)
      .map((l) => ({ variantId: l.variantId as number, quantity: Number(l.quantity) })),
    supplier: supplier.trim() || undefined,
    note: note.trim() || undefined,
  });

  const validate = async () => {
    const payload = buildPayload();
    if (payload.items.length === 0) {
      toast.error("Thêm ít nhất một dòng sản phẩm");
      return;
    }
    if (payload.items.some((i) => !i.quantity || i.quantity < 1)) {
      toast.error("Số lượng phải lớn hơn 0");
      return;
    }
    setValidating(true);
    try {
      const res = await adminInventoryApi.validateImport(payload);
      if (res.data.success) {
        setValidation(res.data.data.results);
        setAllValid(res.data.data.allValid);
        toast.success(res.data.data.allValid ? "Phiếu hợp lệ — có thể nhập kho" : "Có dòng không hợp lệ");
      }
    } catch (err) {
      toast.error(extractInventoryError(err, "Kiểm tra phiếu thất bại"));
    } finally {
      setValidating(false);
    }
  };

  const submit = async () => {
    const payload = buildPayload();
    if (payload.items.length === 0) {
      toast.error("Thêm ít nhất một dòng sản phẩm");
      return;
    }
    setSubmitting(true);
    try {
      await adminInventoryApi.importStock(payload);
      toast.success("Nhập kho thành công");
      setLines([emptyLine()]);
      setSupplier("");
      setNote("");
      setValidation(null);
      setAllValid(false);
      onSuccess?.();
    } catch (err) {
      toast.error(extractInventoryError(err, "Nhập kho thất bại"));
    } finally {
      setSubmitting(false);
    }
  };

  const updateLine = (key: string, patch: Partial<ImportLine>) => {
    setLines((prev) => prev.map((l) => (l.key === key ? { ...l, ...patch } : l)));
    setValidation(null);
    setAllValid(false);
  };

  const selectVariant = (key: string, hit: VariantSearchHit) => {
    updateLine(key, { variantId: hit.id, label: formatVariantLabel(hit) });
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h3 className="text-lg font-bold text-dark">Phiếu nhập kho</h3>
        <p className="text-sm text-[#6C6F93] mt-1">
          Thêm nhiều dòng sản phẩm, kiểm tra trước khi lập phiếu.
        </p>
      </div>

      <div className="space-y-4">
        {lines.map((line, index) => (
          <div
            key={line.key}
            className="p-4 border border-gray-3/50 rounded-xl space-y-3 bg-[#F7F9FC]/40"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#8D93A5] uppercase">Dòng {index + 1}</span>
              {lines.length > 1 && (
                <button
                  type="button"
                  className="text-xs text-red hover:underline"
                  onClick={() => setLines((prev) => prev.filter((l) => l.key !== line.key))}
                >
                  Xóa dòng
                </button>
              )}
            </div>
            <VariantSearchInput
              value={line.label}
              variantId={line.variantId}
              onChange={(text) => updateLine(line.key, { label: text, variantId: null })}
              onSelect={(hit) => selectVariant(line.key, hit)}
            />
            <input
              type="number"
              min={1}
              value={line.quantity}
              onChange={(e) => updateLine(line.key, { quantity: e.target.value })}
              placeholder="Số lượng"
              className="w-full px-4 py-2.5 border border-gray-3 rounded-lg text-sm"
            />
          </div>
        ))}
        <button
          type="button"
          onClick={() => setLines((prev) => [...prev, emptyLine()])}
          className="text-sm font-semibold text-[#3C50E0] hover:underline"
        >
          + Thêm dòng sản phẩm
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <input
          value={supplier}
          onChange={(e) => setSupplier(e.target.value)}
          placeholder="Nhà cung cấp"
          className="w-full px-4 py-2.5 border border-gray-3 rounded-lg text-sm"
        />
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Ghi chú phiếu nhập"
          rows={2}
          className="w-full px-4 py-2.5 border border-gray-3 rounded-lg text-sm resize-none sm:col-span-2"
        />
      </div>

      {validation && validation.length > 0 && (
        <div className="border border-gray-3/50 rounded-xl overflow-hidden">
          <div className="px-4 py-2 bg-[#F7F9FC] text-sm font-semibold text-dark">
            Kết quả kiểm tra {allValid ? "✓" : "— có lỗi"}
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-white border-b border-gray-3/50">
                <th className="text-left px-4 py-2 text-xs text-[#8D93A5]">SKU</th>
                <th className="text-center px-4 py-2 text-xs text-[#8D93A5]">Tồn hiện tại</th>
                <th className="text-center px-4 py-2 text-xs text-[#8D93A5]">Nhập</th>
                <th className="text-left px-4 py-2 text-xs text-[#8D93A5]">Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {validation.map((row, i) => (
                <tr key={i} className="border-b border-gray-3/30">
                  <td className="px-4 py-2">{row.skuCode ?? row.variantId ?? "—"}</td>
                  <td className="px-4 py-2 text-center">{row.currentStock ?? "—"}</td>
                  <td className="px-4 py-2 text-center">{row.requestedQuantity ?? "—"}</td>
                  <td className={`px-4 py-2 ${row.valid ? "text-green" : "text-red"}`}>
                    {row.message}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="flex flex-wrap gap-3">
        <PrimaryButton type="button" onClick={() => void validate()} disabled={validating}>
          {validating ? "Đang kiểm tra..." : "Kiểm tra phiếu"}
        </PrimaryButton>
        <PrimaryButton
          type="button"
          onClick={() => void submit()}
          disabled={submitting || (validation != null && !allValid)}
        >
          {submitting ? "Đang lưu..." : "Lập phiếu nhập"}
        </PrimaryButton>
      </div>
    </div>
  );
}
