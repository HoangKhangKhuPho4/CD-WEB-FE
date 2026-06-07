"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import Modal from "@/components/Admin/shared/Modal";
import PrimaryButton from "@/components/Admin/shared/PrimaryButton";
import { extractApiError, parseImeiList } from "@/components/Admin/Imei/imeiUtils";
import {
  adminImeiApi,
  adminInventoryApi,
  type ImeiImportResult,
  type ImeiValidateItemResult,
  type VariantSearchHit,
} from "@/utils/adminApi";

export default function ImeiImportModal({
  open,
  onClose,
  onSuccess,
}: {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [variantId, setVariantId] = useState<number | null>(null);
  const [variantLabel, setVariantLabel] = useState("");
  const [variantHits, setVariantHits] = useState<VariantSearchHit[]>([]);
  const [imeiText, setImeiText] = useState("");
  const [batchNumber, setBatchNumber] = useState("");
  const [note, setNote] = useState("");
  const [validating, setValidating] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [validateResults, setValidateResults] = useState<ImeiValidateItemResult[] | null>(null);
  const [importResult, setImportResult] = useState<ImeiImportResult | null>(null);

  const reset = () => {
    setVariantId(null);
    setVariantLabel("");
    setVariantHits([]);
    setImeiText("");
    setBatchNumber("");
    setNote("");
    setValidateResults(null);
    setImportResult(null);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const searchVariant = async (keyword: string) => {
    setVariantLabel(keyword);
    if (keyword.length < 2) {
      setVariantHits([]);
      return;
    }
    try {
      const res = await adminInventoryApi.searchVariants(keyword);
      if (res.data.success) setVariantHits(res.data.data);
    } catch {
      setVariantHits([]);
    }
  };

  const runValidate = async () => {
    const imeis = parseImeiList(imeiText);
    if (!imeis.length) {
      toast.error("Nhập ít nhất một IMEI");
      return;
    }
    setValidating(true);
    setValidateResults(null);
    try {
      const res = await adminImeiApi.validate({ variantId: variantId ?? undefined, imeis });
      if (res.data.success) {
        setValidateResults(res.data.data.results);
        if (res.data.data.allValid) toast.success("Tất cả IMEI hợp lệ");
        else toast.error("Có IMEI không hợp lệ — xem danh sách bên dưới");
      }
    } catch (err) {
      toast.error(extractApiError(err, "Kiểm tra IMEI thất bại"));
    } finally {
      setValidating(false);
    }
  };

  const submitManual = async () => {
    if (!variantId) {
      toast.error("Chọn biến thể sản phẩm");
      return;
    }
    const imeis = parseImeiList(imeiText);
    if (!imeis.length) {
      toast.error("Nhập ít nhất một IMEI");
      return;
    }
    setSubmitting(true);
    try {
      await adminImeiApi.create({
        variantId,
        imeis,
        batchNumber: batchNumber.trim() || undefined,
        note: note.trim() || undefined,
      });
      toast.success(`Đã lưu ${imeis.length} IMEI`);
      handleClose();
      onSuccess();
    } catch (err) {
      toast.error(extractApiError(err, "Nhập IMEI thất bại"));
    } finally {
      setSubmitting(false);
    }
  };

  const onExcel = async (file: File) => {
    setImportResult(null);
    try {
      const res = await adminImeiApi.uploadExcel(file);
      if (res.data.success) {
        const data = res.data.data;
        setImportResult(data);
        if (data.importedCount > 0) {
          toast.success(`Import ${data.importedCount} IMEI`);
          onSuccess();
        }
        if (data.errors?.length) toast.error(`${data.errors.length} dòng lỗi`);
      }
    } catch (err) {
      toast.error(extractApiError(err, "Import Excel thất bại"));
    }
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Nhập IMEI"
      subtitle="Nhập thủ công hoặc import Excel (cột A=SKU, B=IMEI)"
      wide
      footer={
        <div className="flex flex-wrap gap-2 justify-end w-full">
          <button
            type="button"
            onClick={runValidate}
            disabled={validating}
            className="px-4 py-2.5 text-sm font-semibold text-[#3C50E0] border border-[#3C50E0]/40 rounded-lg"
          >
            {validating ? "Đang kiểm tra..." : "Kiểm tra IMEI"}
          </button>
          <PrimaryButton onClick={() => void submitManual()} disabled={submitting}>
            {submitting ? "Đang lưu..." : "Xác nhận nhập"}
          </PrimaryButton>
        </div>
      }
    >
      <div className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-[#6C6F93] mb-1.5">Biến thể *</label>
          <input
            value={variantLabel}
            onChange={(e) => void searchVariant(e.target.value)}
            placeholder="Tìm SKU / tên sản phẩm..."
            className="w-full px-3 py-2.5 border border-gray-3 rounded-lg text-sm"
          />
          {variantHits.length > 0 && (
            <ul className="mt-2 border border-gray-3 rounded-lg max-h-36 overflow-auto">
              {variantHits.map((v) => (
                <li key={v.id}>
                  <button
                    type="button"
                    className="w-full text-left px-3 py-2 text-sm hover:bg-[#F7F9FC]"
                    onClick={() => {
                      setVariantId(v.id);
                      setVariantLabel(`${v.productName} — ${v.skuCode ?? v.variantName}`);
                      setVariantHits([]);
                    }}
                  >
                    {v.productName} ({v.skuCode ?? v.variantName})
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-[#6C6F93] mb-1.5">Số lô</label>
            <input
              value={batchNumber}
              onChange={(e) => setBatchNumber(e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-3 rounded-lg text-sm"
              placeholder="BATCH-2026-01"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#6C6F93] mb-1.5">Ghi chú</label>
            <input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-3 rounded-lg text-sm"
              placeholder="Nhập từ kho A..."
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-[#6C6F93] mb-1.5">
            Danh sách IMEI (mỗi dòng một mã)
          </label>
          <textarea
            value={imeiText}
            onChange={(e) => {
              setImeiText(e.target.value);
              setValidateResults(null);
            }}
            rows={6}
            placeholder="356789012345678"
            className="w-full px-3 py-2.5 border border-gray-3 rounded-lg text-sm font-mono resize-none"
          />
        </div>

        {validateResults && validateResults.length > 0 && (
          <div className="rounded-lg border border-gray-3/50 p-3 max-h-32 overflow-auto">
            <p className="text-xs font-semibold text-[#6C6F93] mb-2">Kết quả kiểm tra</p>
            <ul className="space-y-1">
              {validateResults.map((r) => (
                <li
                  key={r.imei}
                  className={`text-xs font-mono ${r.valid ? "text-green" : "text-red"}`}
                >
                  {r.imei}: {r.message}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="border-t border-gray-3/50 pt-4">
          <label className="flex items-center gap-2 px-4 py-2.5 border border-dashed border-gray-3 rounded-lg text-sm cursor-pointer hover:border-[#3C50E0] w-fit">
            <span>Import file Excel (.xlsx)</span>
            <input
              type="file"
              accept=".xlsx,.xls"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) void onExcel(f);
              }}
            />
          </label>
          {importResult && (
            <div className="mt-3 text-sm text-[#6C6F93]">
              <p>
                Đã import: <strong>{importResult.importedCount}</strong>, bỏ qua:{" "}
                {importResult.skippedCount}
              </p>
              {importResult.errors?.length > 0 && (
                <ul className="mt-2 text-xs text-red max-h-24 overflow-auto">
                  {importResult.errors.map((e) => (
                    <li key={e}>{e}</li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
