"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import VariantSearchInput from "@/components/Admin/Inventory/VariantSearchInput";
import SupplierSearchInput from "@/components/Admin/Procurement/SupplierSearchInput";
import {
  adminPurchaseOrderApi,
  adminSupplierApi,
  type SupplierOption,
  type VariantSearchHit,
} from "@/utils/adminApi";

type LineDraft = {
  key: string;
  variantId: number | null;
  label: string;
  quantity: string;
  unitCost: string;
};

function emptyLine(): LineDraft {
  return {
    key: String(Date.now() + Math.random()),
    variantId: null,
    label: "",
    quantity: "1",
    unitCost: "",
  };
}

export default function ProcurementOrderForm({
  onCreated,
}: {
  onCreated?: () => void;
}) {
  const [suppliers, setSuppliers] = useState<SupplierOption[]>([]);
  const [supplierId, setSupplierId] = useState<number | null>(null);
  const [expectedDate, setExpectedDate] = useState("");
  const [notes, setNotes] = useState("");
  const [lines, setLines] = useState<LineDraft[]>([emptyLine()]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    adminSupplierApi
      .list()
      .then((res) => setSuppliers(res.data.data ?? []))
      .catch(() => toast.error("Không tải được danh sách nhà cung cấp"));
  }, []);

  const totalEstimate = useMemo(() => {
    return lines.reduce((sum, line) => {
      const qty = Number(line.quantity) || 0;
      const cost = Number(line.unitCost) || 0;
      return sum + qty * cost;
    }, 0);
  }, [lines]);

  const totalQty = useMemo(() => {
    return lines.reduce((sum, line) => sum + (Number(line.quantity) || 0), 0);
  }, [lines]);

  const pickVariant = (key: string, hit: VariantSearchHit) => {
    setLines((prev) =>
      prev.map((l) =>
        l.key === key
          ? {
              ...l,
              variantId: hit.id,
              label: `${hit.productName ?? ""} · ${hit.skuCode ?? hit.variantName ?? hit.id}`,
            }
          : l
      )
    );
  };

  const submit = useCallback(async () => {
    if (supplierId == null) {
      toast.error("Vui lòng chọn nhà cung cấp");
      return;
    }
    const payloadLines = lines
      .filter((l) => l.variantId != null)
      .map((l) => ({
        variantId: l.variantId as number,
        quantityOrdered: Number(l.quantity),
        unitCost: l.unitCost ? Number(l.unitCost) : undefined,
      }));
    if (payloadLines.length === 0) {
      toast.error("Thêm ít nhất một dòng sản phẩm");
      return;
    }
    if (payloadLines.some((l) => !l.quantityOrdered || l.quantityOrdered < 1)) {
      toast.error("Số lượng đặt mua phải lớn hơn 0");
      return;
    }

    setSubmitting(true);
    try {
      const res = await adminPurchaseOrderApi.create({
        supplierId,
        expectedDate: expectedDate || undefined,
        notes: notes.trim() || undefined,
        lines: payloadLines,
        submitForApproval: true,
      });
      toast.success(`Đã lưu PO ${res.data.data?.code ?? ""} — chờ duyệt`);
      setLines([emptyLine()]);
      setNotes("");
      setExpectedDate("");
      setSupplierId(null);
      onCreated?.();
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        "Tạo PO thất bại";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  }, [expectedDate, lines, notes, onCreated, supplierId]);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-gray-3/50 p-6 space-y-4">
        <h2 className="text-sm font-bold text-dark uppercase tracking-wide">Thông tin chung</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <SupplierSearchInput
            key={`supplier-${supplierId ?? "none"}`}
            suppliers={suppliers}
            supplierId={supplierId}
            onSelect={(s) => setSupplierId(s?.id ?? null)}
          />
          <label className="block text-sm">
            <span className="text-[#6C6F93] font-medium">Ngày hẹn giao dự kiến</span>
            <input
              type="date"
              className="mt-1 w-full border border-gray-3 rounded-lg px-3 py-2 text-sm"
              value={expectedDate}
              onChange={(e) => setExpectedDate(e.target.value)}
            />
          </label>
          <label className="block text-sm">
            <span className="text-[#6C6F93] font-medium">Ghi chú</span>
            <input
              type="text"
              className="mt-1 w-full border border-gray-3 rounded-lg px-3 py-2 text-sm"
              placeholder="Điều kiện giao hàng, số HĐ..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </label>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-3/50 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-3/50 flex items-center justify-between">
          <h2 className="text-sm font-bold text-dark uppercase tracking-wide">Sản phẩm đặt mua</h2>
          <button
            type="button"
            onClick={() => setLines((p) => [...p, emptyLine()])}
            className="text-sm font-semibold text-[#3C50E0] hover:underline"
          >
            + Thêm dòng
          </button>
        </div>
        <table className="w-full min-w-[720px]">
          <thead>
            <tr className="bg-[#F7F9FC] border-b border-gray-3/50">
              <th className="text-left px-6 py-3 text-xs font-bold text-[#8D93A5] uppercase">
                Biến thể / SKU
              </th>
              <th className="text-left px-4 py-3 text-xs font-bold text-[#8D93A5] uppercase w-28">
                SL đặt
              </th>
              <th className="text-left px-4 py-3 text-xs font-bold text-[#8D93A5] uppercase w-36">
                Đơn giá nhập
              </th>
              <th className="w-16" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-3/50">
            {lines.map((line) => (
              <tr key={line.key}>
                <td className="px-6 py-3">
                  <VariantSearchInput
                    value={line.label}
                    variantId={line.variantId}
                    onChange={(text) =>
                      setLines((p) =>
                        p.map((l) =>
                          l.key === line.key
                            ? { ...l, label: text, variantId: text ? l.variantId : null }
                            : l
                        )
                      )
                    }
                    onSelect={(hit) => pickVariant(line.key, hit)}
                  />
                </td>
                <td className="px-4 py-3">
                  <input
                    type="number"
                    min={1}
                    className="w-full border border-gray-3 rounded-lg px-2 py-1.5 text-sm"
                    value={line.quantity}
                    onChange={(e) =>
                      setLines((p) =>
                        p.map((l) => (l.key === line.key ? { ...l, quantity: e.target.value } : l))
                      )
                    }
                  />
                </td>
                <td className="px-4 py-3">
                  <input
                    type="number"
                    min={0}
                    className="w-full border border-gray-3 rounded-lg px-2 py-1.5 text-sm"
                    placeholder="VNĐ"
                    value={line.unitCost}
                    onChange={(e) =>
                      setLines((p) =>
                        p.map((l) => (l.key === line.key ? { ...l, unitCost: e.target.value } : l))
                      )
                    }
                  />
                </td>
                <td className="px-2 py-3 text-center">
                  {lines.length > 1 && (
                    <button
                      type="button"
                      className="text-red-500 text-xs"
                      onClick={() => setLines((p) => p.filter((l) => l.key !== line.key))}
                    >
                      Xóa
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="px-6 py-4 border-t border-gray-3/50 space-y-4">
          <div className="rounded-lg border border-[#FED7AA] bg-[#FFF7ED] px-4 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <p className="text-sm font-semibold text-[#C2410C]">Tổng ước tính đơn hàng</p>
              <p className="text-xs text-[#9A3412] mt-0.5">
                {totalQty.toLocaleString("vi-VN")} sản phẩm · gửi duyệt ngay sau khi lưu
              </p>
            </div>
            <p className="text-lg font-bold text-[#EA580C]">
              {totalEstimate.toLocaleString("vi-VN")} ₫
            </p>
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              disabled={submitting}
              onClick={() => void submit()}
              className="px-6 py-2.5 rounded-lg text-sm font-bold text-white bg-[#F97316] hover:bg-[#EA580C] disabled:opacity-60 transition-colors shadow-sm"
            >
              {submitting ? "Đang lưu..." : "Lưu đơn PO (Chờ duyệt)"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
