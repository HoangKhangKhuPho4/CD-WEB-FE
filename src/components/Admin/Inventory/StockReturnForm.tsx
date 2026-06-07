"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import PrimaryButton from "@/components/Admin/shared/PrimaryButton";
import VariantSearchInput from "@/components/Admin/Inventory/VariantSearchInput";
import { extractInventoryError, formatVariantLabel } from "@/components/Admin/Inventory/inventoryUtils";
import { adminInventoryApi, type VariantSearchHit } from "@/utils/adminApi";

type ReturnMode = "imei" | "quantity";

export default function StockReturnForm({ onSuccess }: { onSuccess?: () => void }) {
  const [mode, setMode] = useState<ReturnMode>("imei");
  const [imei, setImei] = useState("");
  const [reason, setReason] = useState("");
  const [isDefective, setIsDefective] = useState(false);
  const [variantId, setVariantId] = useState<number | null>(null);
  const [variantLabel, setVariantLabel] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [submitting, setSubmitting] = useState(false);

  const submitImei = async () => {
    if (!imei.trim()) {
      toast.error("Nhập IMEI/Serial");
      return;
    }
    setSubmitting(true);
    try {
      await adminInventoryApi.returnStock({
        imei: imei.trim(),
        reason: reason.trim() || undefined,
        isDefective,
      });
      toast.success("Đã ghi nhận hàng trả");
      setImei("");
      setReason("");
      setIsDefective(false);
      onSuccess?.();
    } catch (err) {
      toast.error(extractInventoryError(err, "Xử lý trả hàng thất bại"));
    } finally {
      setSubmitting(false);
    }
  };

  const submitQuantity = async () => {
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
      await adminInventoryApi.returnQuantity({
        variantId,
        quantity: qty,
        reason: reason.trim() || undefined,
        isDefective,
      });
      toast.success("Đã ghi nhận trả hàng theo số lượng");
      setQuantity("1");
      setReason("");
      setIsDefective(false);
      onSuccess?.();
    } catch (err) {
      toast.error(extractInventoryError(err, "Trả hàng thất bại"));
    } finally {
      setSubmitting(false);
    }
  };

  const selectVariant = (hit: VariantSearchHit) => {
    setVariantId(hit.id);
    setVariantLabel(formatVariantLabel(hit));
  };

  return (
    <div className="max-w-xl space-y-5">
      <div>
        <h3 className="text-lg font-bold text-dark">Nhập kho hàng trả lại</h3>
        <p className="text-sm text-[#6C6F93] mt-1">Theo IMEI hoặc theo số lượng biến thể.</p>
      </div>

      <div className="flex gap-2 p-1 bg-[#F7F9FC] rounded-lg w-fit">
        {(["imei", "quantity"] as ReturnMode[]).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => setMode(m)}
            className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors ${
              mode === m ? "bg-white text-[#3C50E0] shadow-sm" : "text-[#6C6F93]"
            }`}
          >
            {m === "imei" ? "Theo IMEI" : "Theo số lượng"}
          </button>
        ))}
      </div>

      {mode === "imei" ? (
        <input
          value={imei}
          onChange={(e) => setImei(e.target.value)}
          placeholder="IMEI / Serial *"
          className="w-full px-4 py-2.5 border border-gray-3 rounded-lg text-sm font-mono"
        />
      ) : (
        <>
          <VariantSearchInput
            label="Biến thể *"
            value={variantLabel}
            variantId={variantId}
            onChange={(text) => {
              setVariantLabel(text);
              setVariantId(null);
            }}
            onSelect={selectVariant}
          />
          <input
            type="number"
            min={1}
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            placeholder="Số lượng trả *"
            className="w-full px-4 py-2.5 border border-gray-3 rounded-lg text-sm"
          />
        </>
      )}

      <textarea
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        placeholder="Lý do trả hàng"
        rows={3}
        className="w-full px-4 py-2.5 border border-gray-3 rounded-lg text-sm resize-none"
      />

      <label className="flex items-center gap-2 text-sm text-dark cursor-pointer">
        <input
          type="checkbox"
          checked={isDefective}
          onChange={(e) => setIsDefective(e.target.checked)}
          className="rounded border-gray-3"
        />
        Hàng lỗi / hư hỏng
      </label>

      <PrimaryButton
        type="button"
        onClick={() => void (mode === "imei" ? submitImei() : submitQuantity())}
        disabled={submitting}
      >
        {submitting ? "Đang xử lý..." : "Ghi nhận trả hàng"}
      </PrimaryButton>
    </div>
  );
}
