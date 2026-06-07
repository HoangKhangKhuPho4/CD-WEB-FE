"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import PrimaryButton from "@/components/Admin/shared/PrimaryButton";
import VariantSearchInput from "@/components/Admin/Inventory/VariantSearchInput";
import { extractInventoryError, formatVariantLabel } from "@/components/Admin/Inventory/inventoryUtils";
import { adminInventoryApi, type VariantSearchHit } from "@/utils/adminApi";

export default function StockAdjustForm({
  presetVariantId,
  presetLabel,
  onSuccess,
}: {
  presetVariantId?: number | null;
  presetLabel?: string;
  onSuccess?: () => void;
}) {
  const [variantId, setVariantId] = useState<number | null>(presetVariantId ?? null);
  const [variantLabel, setVariantLabel] = useState(presetLabel ?? "");
  const [quantity, setQuantity] = useState("1");
  const [direction, setDirection] = useState<"INCREASE" | "DECREASE">("INCREASE");
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (presetVariantId != null) {
      setVariantId(presetVariantId);
      setVariantLabel(presetLabel ?? "");
    }
  }, [presetVariantId, presetLabel]);

  const submit = async () => {
    if (variantId == null) {
      toast.error("Chọn biến thể sản phẩm");
      return;
    }
    const qty = Number(quantity);
    if (!qty || qty < 1) {
      toast.error("Số lượng không hợp lệ");
      return;
    }
    setSubmitting(true);
    try {
      await adminInventoryApi.adjustStock({
        variantId,
        quantity: qty,
        direction,
        reason: reason.trim() || undefined,
      });
      toast.success("Điều chỉnh tồn kho thành công");
      setQuantity("1");
      setReason("");
      onSuccess?.();
    } catch (err) {
      toast.error(extractInventoryError(err, "Điều chỉnh tồn thất bại"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-xl space-y-4">
      <div>
        <h3 className="text-lg font-bold text-dark">Điều chỉnh tồn kho</h3>
        <p className="text-sm text-[#6C6F93] mt-1">Tăng hoặc giảm tồn thủ công (không qua phiếu nhập).</p>
      </div>

      <VariantSearchInput
        label="Biến thể *"
        value={variantLabel}
        variantId={variantId}
        onChange={(text) => {
          setVariantLabel(text);
          setVariantId(null);
        }}
        onSelect={(hit: VariantSearchHit) => {
          setVariantId(hit.id);
          setVariantLabel(formatVariantLabel(hit));
        }}
      />

      <div className="flex gap-2 p-1 bg-[#F7F9FC] rounded-lg w-fit">
        {(["INCREASE", "DECREASE"] as const).map((d) => (
          <button
            key={d}
            type="button"
            onClick={() => setDirection(d)}
            className={`px-4 py-2 text-sm font-semibold rounded-md ${
              direction === d ? "bg-white text-[#3C50E0] shadow-sm" : "text-[#6C6F93]"
            }`}
          >
            {d === "INCREASE" ? "Tăng tồn" : "Giảm tồn"}
          </button>
        ))}
      </div>

      <input
        type="number"
        min={1}
        value={quantity}
        onChange={(e) => setQuantity(e.target.value)}
        placeholder="Số lượng điều chỉnh *"
        className="w-full px-4 py-2.5 border border-gray-3 rounded-lg text-sm"
      />

      <textarea
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        placeholder="Lý do điều chỉnh"
        rows={2}
        className="w-full px-4 py-2.5 border border-gray-3 rounded-lg text-sm resize-none"
      />

      <PrimaryButton type="button" onClick={() => void submit()} disabled={submitting}>
        {submitting ? "Đang lưu..." : "Xác nhận điều chỉnh"}
      </PrimaryButton>
    </div>
  );
}
