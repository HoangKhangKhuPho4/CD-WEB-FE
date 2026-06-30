"use client";

import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import PrimaryButton from "@/components/Admin/shared/PrimaryButton";
import VariantSearchInput from "@/components/Admin/Inventory/VariantSearchInput";
import {
  extractInventoryError,
  formatVariantLabel,
} from "@/components/Admin/Inventory/inventoryUtils";
import {
  adminInventoryApi,
  type ValidateImportResponse,
  type VariantSearchHit,
} from "@/utils/adminApi";
import { formatVnd } from "@/utils/adminFormat";

type ImportLine = {
  key: string;
  variantId: number | null;
  label: string;
  quantity: string;
  unitCost: string;
};

function emptyLine(): ImportLine {
  return {
    key: String(Date.now() + Math.random()),
    variantId: null,
    label: "",
    quantity: "1",
    unitCost: "",
  };
}

function formatProductName(row: {
  productName?: string;
  variantName?: string;
  skuCode?: string;
}): string {
  const product = row.productName?.trim() || "Sản phẩm";
  if (row.variantName?.trim()) return `${product} (${row.variantName.trim()})`;
  return product;
}

export default function StockImportForm({ onSuccess }: { onSuccess?: () => void }) {
  const [lines, setLines] = useState<ImportLine[]>([emptyLine()]);
  const [supplier, setSupplier] = useState("");
  const [note, setNote] = useState("");
  const [validating, setValidating] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [preview, setPreview] = useState<ValidateImportResponse | null>(null);

  const buildPayload = () => ({
    items: lines
      .filter((l) => l.variantId != null)
      .map((l) => {
        const unitCost = l.unitCost.trim() ? Number(l.unitCost) : undefined;
        return {
          variantId: l.variantId as number,
          quantity: Number(l.quantity),
          ...(unitCost != null && !Number.isNaN(unitCost) ? { unitCost } : {}),
        };
      }),
    supplier: supplier.trim() || undefined,
    note: note.trim() || undefined,
  });

  const localEstimatedTotal = useMemo(() => {
    return lines.reduce((sum, line) => {
      if (line.variantId == null) return sum;
      const qty = Number(line.quantity) || 0;
      const cost = Number(line.unitCost) || 0;
      return sum + qty * cost;
    }, 0);
  }, [lines]);

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
    if (payload.items.some((i) => i.unitCost != null && i.unitCost < 0)) {
      toast.error("Đơn giá nhập không được âm");
      return;
    }
    setValidating(true);
    try {
      const res = await adminInventoryApi.validateImport(payload);
      if (res.data.success) {
        setPreview(res.data.data);
        toast.success(
          res.data.data.allValid
            ? "Phiếu hợp lệ — xem bản xem trước bên dưới"
            : "Có dòng không hợp lệ — kiểm tra bảng xem trước"
        );
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
    if (!preview?.allValid) {
      toast.error("Vui lòng bấm Kiểm tra phiếu và sửa lỗi trước khi chốt");
      return;
    }
    setSubmitting(true);
    try {
      await adminInventoryApi.importStock(payload);
      toast.success("Nhập kho thành công");
      setLines([emptyLine()]);
      setSupplier("");
      setNote("");
      setPreview(null);
      onSuccess?.();
    } catch (err) {
      toast.error(extractInventoryError(err, "Nhập kho thất bại"));
    } finally {
      setSubmitting(false);
    }
  };

  const updateLine = (key: string, patch: Partial<ImportLine>) => {
    setLines((prev) => prev.map((l) => (l.key === key ? { ...l, ...patch } : l)));
    setPreview(null);
  };

  const selectVariant = (key: string, hit: VariantSearchHit) => {
    updateLine(key, { variantId: hit.id, label: formatVariantLabel(hit) });
  };

  const estimatedTotal =
    preview?.estimatedTotalValue != null && preview.estimatedTotalValue > 0
      ? preview.estimatedTotalValue
      : localEstimatedTotal;

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h3 className="text-lg font-bold text-dark">Phiếu nhập kho</h3>
        <p className="text-sm text-[#6C6F93] mt-1">
          Thêm nhiều dòng sản phẩm, kiểm tra và xem trước trước khi lập phiếu.
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-[#6C6F93] mb-1 block">Số lượng</label>
                <input
                  type="number"
                  min={1}
                  value={line.quantity}
                  onChange={(e) => updateLine(line.key, { quantity: e.target.value })}
                  placeholder="Số lượng"
                  className="w-full px-4 py-2.5 border border-gray-3 rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-[#6C6F93] mb-1 block">Đơn giá nhập</label>
                <input
                  type="number"
                  min={0}
                  step="1000"
                  value={line.unitCost}
                  onChange={(e) => updateLine(line.key, { unitCost: e.target.value })}
                  placeholder="VD: 15000000"
                  className="w-full px-4 py-2.5 border border-gray-3 rounded-lg text-sm"
                />
              </div>
            </div>
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
          onChange={(e) => {
            setSupplier(e.target.value);
            setPreview(null);
          }}
          placeholder="Nhà cung cấp"
          className="w-full px-4 py-2.5 border border-gray-3 rounded-lg text-sm"
        />
        <textarea
          value={note}
          onChange={(e) => {
            setNote(e.target.value);
            setPreview(null);
          }}
          placeholder="Ghi chú phiếu nhập"
          rows={2}
          className="w-full px-4 py-2.5 border border-gray-3 rounded-lg text-sm resize-none sm:col-span-2"
        />
      </div>

      {estimatedTotal > 0 && (
        <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-[#F0F4FF] border border-[#3C50E0]/20">
          <span className="text-sm font-semibold text-[#6C6F93]">Tổng giá trị ước tính</span>
          <span className="text-lg font-bold text-[#3C50E0]">{formatVnd(estimatedTotal)}</span>
        </div>
      )}

      {preview && preview.results.length > 0 && (
        <div className="border-2 border-[#3C50E0]/30 rounded-xl overflow-hidden shadow-sm">
          <div className="px-5 py-4 bg-gradient-to-r from-[#3C50E0] to-[#5B73E8] text-white">
            <p className="text-sm font-bold uppercase tracking-wide">Xem trước phiếu nhập</p>
            <p className="text-xs mt-1 opacity-90">
              {preview.allValid
                ? "Phiếu hợp lệ — có thể bấm Lập phiếu nhập để chốt"
                : "Có dòng lỗi — sửa trước khi chốt"}
            </p>
          </div>
          <div className="px-5 py-3 bg-[#F7F9FC] grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm border-b border-gray-3/50">
            <p>
              <span className="text-[#6C6F93]">Nhà cung cấp:</span>{" "}
              <span className="font-semibold text-dark">{preview.supplier || supplier || "—"}</span>
            </p>
            <p>
              <span className="text-[#6C6F93]">Ghi chú:</span>{" "}
              <span className="font-semibold text-dark">{preview.note || note || "—"}</span>
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-white border-b border-gray-3/50">
                  <th className="text-left px-4 py-3 text-xs text-[#8D93A5] uppercase">Sản phẩm</th>
                  <th className="text-center px-4 py-3 text-xs text-[#8D93A5] uppercase">SL</th>
                  <th className="text-right px-4 py-3 text-xs text-[#8D93A5] uppercase">Đơn giá</th>
                  <th className="text-right px-4 py-3 text-xs text-[#8D93A5] uppercase">Thành tiền</th>
                  <th className="text-center px-4 py-3 text-xs text-[#8D93A5] uppercase">Tồn hiện tại</th>
                  <th className="text-left px-4 py-3 text-xs text-[#8D93A5] uppercase">Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {preview.results.map((row, i) => (
                  <tr key={i} className="border-b border-gray-3/30 hover:bg-[#F7F9FC]/50">
                    <td className="px-4 py-3">
                      <p className="font-semibold text-dark">{formatProductName(row)}</p>
                      <p className="text-xs text-[#8D93A5]">{row.skuCode ?? "—"}</p>
                    </td>
                    <td className="px-4 py-3 text-center font-semibold">{row.requestedQuantity ?? "—"}</td>
                    <td className="px-4 py-3 text-right">
                      {row.unitCost != null && row.unitCost > 0 ? formatVnd(row.unitCost) : "—"}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-[#3C50E0]">
                      {row.lineTotal != null && row.lineTotal > 0 ? formatVnd(row.lineTotal) : "—"}
                    </td>
                    <td className="px-4 py-3 text-center">{row.currentStock ?? "—"}</td>
                    <td className={`px-4 py-3 text-sm ${row.valid ? "text-green" : "text-red"}`}>
                      {row.valid ? "Hợp lệ" : row.message}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {estimatedTotal > 0 && (
            <div className="px-5 py-4 bg-[#FFF9EB] border-t border-yellow-light-1 flex justify-between items-center">
              <span className="text-sm font-bold text-yellow-dark-2">Tổng giá trị ước tính</span>
              <span className="text-xl font-bold text-yellow-dark-2">{formatVnd(estimatedTotal)}</span>
            </div>
          )}
        </div>
      )}

      <div className="flex flex-wrap gap-3">
        <PrimaryButton type="button" onClick={() => void validate()} disabled={validating}>
          {validating ? "Đang kiểm tra..." : "Kiểm tra phiếu"}
        </PrimaryButton>
        <PrimaryButton
          type="button"
          onClick={() => void submit()}
          disabled={submitting || !preview?.allValid}
        >
          {submitting ? "Đang lưu..." : "Lập phiếu nhập"}
        </PrimaryButton>
      </div>
    </div>
  );
}
