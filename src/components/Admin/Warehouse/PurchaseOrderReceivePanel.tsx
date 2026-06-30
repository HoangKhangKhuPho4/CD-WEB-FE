"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import Modal from "@/components/Admin/shared/Modal";
import PrimaryButton from "@/components/Admin/shared/PrimaryButton";
import {
  IconAlertTriangle,
  IconCheck,
  IconCheckCircle,
  IconImport,
  IconUpload,
  IconX,
} from "@/components/Admin/icons/AdminIcons";
import { parseImeiList } from "@/components/Admin/Imei/imeiUtils";
import { parseSerialsFromExcelFile } from "@/utils/parseSerialsFromExcelFile";
import {
  purchaseOrderReceiveApi,
  type PurchaseOrderReceiveDetail,
  type ReceiveLineProgress,
  type ValidateReceiveScanResult,
} from "@/utils/purchaseOrderReceiveApi";

const DEFAULT_SHELF = "Kệ A1-02";

export default function PurchaseOrderReceivePanel({ poId }: { poId: number }) {
  const router = useRouter();
  const scanInputRef = useRef<HTMLInputElement>(null);
  const excelInputRef = useRef<HTMLInputElement>(null);
  const [detail, setDetail] = useState<PurchaseOrderReceiveDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeLineId, setActiveLineId] = useState<number | null>(null);
  const [inputMode, setInputMode] = useState<"scan" | "bulk">("scan");
  const [scanCode, setScanCode] = useState("");
  const [bulkSerialText, setBulkSerialText] = useState("");
  const [excelParsing, setExcelParsing] = useState(false);
  const [lastExcelMeta, setLastExcelMeta] = useState<string | null>(null);
  const [scanResult, setScanResult] = useState<ValidateReceiveScanResult | null>(null);
  const [batchNumber, setBatchNumber] = useState("");
  const [shelfLocation, setShelfLocation] = useState(DEFAULT_SHELF);
  const [bulkQty, setBulkQty] = useState("1");
  const [submitting, setSubmitting] = useState(false);

  const [damagedOpen, setDamagedOpen] = useState(false);
  const [damagedSerial, setDamagedSerial] = useState("");
  const [damagedQty, setDamagedQty] = useState("1");
  const [damagedReason, setDamagedReason] = useState("");
  const [evidenceFile, setEvidenceFile] = useState<File | null>(null);
  const [evidencePreview, setEvidencePreview] = useState<string | null>(null);

  const [lockOpen, setLockOpen] = useState(false);
  const [discrepancyNote, setDiscrepancyNote] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await purchaseOrderReceiveApi.receiveDetail(poId);
      if (res.data.success) {
        const data = res.data.data;
        setDetail(data);
        setBatchNumber((prev) => prev || data.defaultBatchNumber || "");
        const nextLine =
          data.progress.lines.find((l) => l.remaining > 0) ?? data.progress.lines[0];
        if (nextLine) setActiveLineId(nextLine.poLineId);
      }
    } catch {
      toast.error("Không tải được thông tin kiểm đếm PO");
    } finally {
      setLoading(false);
    }
  }, [poId]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (detail?.canScan) scanInputRef.current?.focus();
  }, [detail?.canScan, activeLineId]);

  const activeLine: ReceiveLineProgress | undefined = detail?.progress.lines.find(
    (l) => l.poLineId === activeLineId
  );

  const parsedSerials = useMemo(() => parseImeiList(bulkSerialText), [bulkSerialText]);
  const uniqueSerials = useMemo(() => Array.from(new Set(parsedSerials)), [parsedSerials]);
  const hasBulkDuplicates = parsedSerials.length > uniqueSerials.length;
  const exceedsLineLimit =
    activeLine != null && uniqueSerials.length > activeLine.remaining;

  const applyDetailAfterReceive = (data: PurchaseOrderReceiveDetail) => {
    setDetail(data);
    setBatchNumber((prev) => prev || data.defaultBatchNumber || "");
    const nextLine =
      data.progress.lines.find((l) => l.remaining > 0) ?? data.progress.lines[0];
    if (nextLine) setActiveLineId(nextLine.poLineId);
  };

  const handleStartReceiving = async () => {
    setSubmitting(true);
    try {
      await purchaseOrderReceiveApi.startReceiving(poId);
      toast.success("Đã bắt đầu kiểm đếm — quét IMEI/serial để nhập kho");
      await load();
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        "Không thể bắt đầu kiểm đếm";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleValidateAndReceive = async () => {
    if (!activeLineId || !scanCode.trim()) {
      toast.error("Nhập hoặc quét mã serial/IMEI");
      return;
    }
    setSubmitting(true);
    try {
      const validateRes = await purchaseOrderReceiveApi.validateScan(poId, {
        poLineId: activeLineId,
        scannedCode: scanCode.trim(),
      });
      const result = validateRes.data.data;
      setScanResult(result);
      if (!result.valid) {
        toast.error(result.message);
        return;
      }

      const receiveRes = await purchaseOrderReceiveApi.receiveSerial(poId, {
        poLineId: activeLineId,
        scannedCode: scanCode.trim(),
        batchNumber: batchNumber.trim() || undefined,
        shelfLocation: shelfLocation.trim() || undefined,
      });

      if (receiveRes.data.success) {
        const data = receiveRes.data.data;
        if (data.autoCompleted) {
          toast.success("PO đã quét đủ 100% — tự động hoàn tất!", {
            icon: <IconCheckCircle size={20} className="text-green" />,
          });
          router.push("/admin/purchase-orders");
          return;
        }
        toast.success("Đã nhập serial vào kho");
        setScanCode("");
        setScanResult(null);
        applyDetailAfterReceive(receiveRes.data.data);
      }
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        "Nhập serial thất bại";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleExcelFile = async (file: File) => {
    setExcelParsing(true);
    try {
      const { codes, sheetName, columnLabel } = await parseSerialsFromExcelFile(file);
      setBulkSerialText(codes.join("\n"));
      setInputMode("bulk");
      setLastExcelMeta(`Sheet "${sheetName}" · cột ${columnLabel}`);
      toast.success(`Đã đọc ${codes.length} mã từ Excel`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Không đọc được file Excel");
    } finally {
      setExcelParsing(false);
    }
  };

  const handleBulkSerialSubmit = async () => {
    if (!activeLineId) {
      toast.error("Chọn dòng PO cần nhập");
      return;
    }
    if (uniqueSerials.length === 0) {
      toast.error("Nhập hoặc upload ít nhất một mã Serial");
      return;
    }
    if (exceedsLineLimit && activeLine) {
      toast.error(`Vượt quá SL còn lại (${activeLine.remaining})`);
      return;
    }

    setSubmitting(true);
    try {
      const res = await purchaseOrderReceiveApi.receiveSerialBulk(poId, {
        poLineId: activeLineId,
        serials: uniqueSerials,
        batchNumber: batchNumber.trim() || undefined,
        shelfLocation: shelfLocation.trim() || undefined,
      });
      if (res.data.success) {
        const payload = res.data.data;
        if (payload.autoCompleted) {
          toast.success("PO đã quét đủ 100% — tự động hoàn tất!", {
            icon: <IconCheckCircle size={20} className="text-green" />,
          });
          router.push("/admin/purchase-orders");
          return;
        }
        if (payload.failCount > 0) {
          toast.error(
            `${payload.message} — ${payload.failCount} mã lỗi (xem danh sách bên dưới)`
          );
        } else {
          toast.success(payload.message || `Đã nhập ${payload.successCount} serial`);
        }
        setBulkSerialText("");
        setLastExcelMeta(null);
        applyDetailAfterReceive(payload.detail);
      }
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        "Nhập serial hàng loạt thất bại";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleBulkReceive = async () => {
    if (!activeLineId) {
      toast.error("Chọn dòng PO cần nhập");
      return;
    }
    const qty = Number(bulkQty);
    if (!qty || qty < 1) {
      toast.error("Số lượng phải lớn hơn 0");
      return;
    }
    setSubmitting(true);
    try {
      const res = await purchaseOrderReceiveApi.receiveQuantity(poId, {
        poLineId: activeLineId,
        quantity: qty,
        batchNumber: batchNumber.trim() || undefined,
        shelfLocation: shelfLocation.trim() || undefined,
      });
      if (res.data.success) {
        toast.success(`Đã nhập ${qty} vào kho`);
        setBulkQty("1");
        setDetail(res.data.data);
      }
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        "Nhập số lượng thất bại";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const openDamagedModal = () => {
    setDamagedSerial(scanCode.trim());
    setDamagedQty("1");
    setDamagedReason("");
    setEvidenceFile(null);
    setEvidencePreview(null);
    setDamagedOpen(true);
  };

  const handleEvidenceChange = (file: File | null) => {
    setEvidenceFile(file);
    if (evidencePreview) URL.revokeObjectURL(evidencePreview);
    setEvidencePreview(file ? URL.createObjectURL(file) : null);
  };

  const handleReportDamaged = async () => {
    if (!activeLineId) {
      toast.error("Chọn dòng PO");
      return;
    }
    if (!damagedReason.trim()) {
      toast.error("Vui lòng nhập lý do hàng lỗi/vỡ");
      return;
    }
    setSubmitting(true);
    try {
      let evidenceUrl: string | undefined;
      if (evidenceFile) {
        evidenceUrl = await purchaseOrderReceiveApi.uploadEvidence(evidenceFile);
      }
      const res = await purchaseOrderReceiveApi.reportDamaged(poId, {
        poLineId: activeLineId,
        serialCode: damagedSerial.trim() || undefined,
        quantity: damagedSerial.trim() ? 1 : Number(damagedQty) || 1,
        reason: damagedReason.trim(),
        evidenceUrl,
        shelfLocation: shelfLocation.trim() || undefined,
        batchNumber: batchNumber.trim() || undefined,
      });
      if (res.data.success) {
        toast.success("Đã ghi nhận hàng lỗi");
        setDamagedOpen(false);
        setScanCode("");
        setDetail(res.data.data);
      }
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        (err instanceof Error ? err.message : "Báo cáo hàng lỗi thất bại");
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleLockOrder = async () => {
    setSubmitting(true);
    try {
      const res = await purchaseOrderReceiveApi.completeReceiving(
        poId,
        detail?.progress.totalRemaining
          ? { discrepancyNote: discrepancyNote.trim() }
          : undefined
      );
      if (res.data.success) {
        toast.success(res.data.data.message);
        setLockOpen(false);
        router.push("/admin/purchase-orders");
      }
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        "Khóa đơn thất bại";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !detail) {
    return (
      <div className="rounded-xl border border-gray-3/50 bg-white p-10 text-center text-sm text-[#8D93A5]">
        Đang tải thông tin kiểm đếm...
      </div>
    );
  }

  const progress = detail.progress;

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-gray-3/50 p-6">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
          <div>
            <p className="text-xs text-[#8D93A5]">Mã PO · NCC</p>
            <h2 className="text-xl font-bold text-dark">{detail.code}</h2>
            <p className="text-sm text-[#606882] mt-1">{detail.supplier}</p>
            <p className="text-sm text-[#8D93A5] mt-2">
              Hẹn giao {detail.expectedDate}
              {detail.notes ? ` · ${detail.notes}` : ""}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {detail.canStartReceiving && (
              <PrimaryButton
                type="button"
                disabled={submitting}
                onClick={() => void handleStartReceiving()}
              >
                Bắt đầu kiểm đếm
              </PrimaryButton>
            )}
            <button
              type="button"
              onClick={() => router.push("/admin/purchase-orders")}
              className="px-4 py-2.5 text-sm font-semibold text-[#6C6F93] border border-gray-3 rounded-lg"
            >
              ← Danh sách PO
            </button>
          </div>
        </div>
      </div>

      {progress.totalOrdered > 0 && (
        <div className="bg-white rounded-xl border border-gray-3/50 p-5">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
            <p className="text-sm font-semibold text-dark">Tiến độ kiểm đếm</p>
            <p className="text-sm font-bold text-[#3C50E0]">
              {progress.totalReceived}/{progress.totalOrdered} OK
              {progress.totalDamaged > 0 && (
                <span className="text-[#DC2626] ml-2">· {progress.totalDamaged} lỗi</span>
              )}
              {progress.totalRemaining > 0 && (
                <span className="text-[#8D93A5] ml-2 font-medium">
                  · {progress.totalRemaining} còn lại
                </span>
              )}
            </p>
          </div>
          <div className="h-2.5 rounded-full bg-[#F7F9FC] overflow-hidden flex">
            <div
              className="h-full bg-[#16A34A] transition-all"
              style={{
                width: `${
                  progress.totalOrdered
                    ? (progress.totalReceived / progress.totalOrdered) * 100
                    : 0
                }%`,
              }}
            />
            <div
              className="h-full bg-[#DC2626] transition-all"
              style={{
                width: `${
                  progress.totalOrdered
                    ? (progress.totalDamaged / progress.totalOrdered) * 100
                    : 0
                }%`,
              }}
            />
          </div>
        </div>
      )}

      {detail.canScan && (
        <div className="bg-white rounded-xl border border-gray-3/50 p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="block text-sm">
            <span className="font-medium text-[#6C6F93]">Số lô (LOT / Wave)</span>
            <input
              value={batchNumber}
              onChange={(e) => setBatchNumber(e.target.value)}
              className="mt-1 w-full border border-gray-3 rounded-lg px-3 py-2 text-sm font-mono"
              placeholder={detail.defaultBatchNumber ?? "LOT-PO...-WAVE1"}
            />
            <p className="text-xs text-[#8D93A5] mt-1">
              Mặc định: {detail.defaultBatchNumber} — mỗi đợt giao thêm WAVE
            </p>
          </label>
          <label className="block text-sm">
            <span className="font-medium text-[#6C6F93]">Vị trí kệ mặc định (Shelf)</span>
            <input
              value={shelfLocation}
              onChange={(e) => setShelfLocation(e.target.value)}
              className="mt-1 w-full border border-gray-3 rounded-lg px-3 py-2 text-sm"
              placeholder="Kệ A1-02"
            />
          </label>
        </div>
      )}

      {detail.canScan && progress.lines.length > 0 && (
        <div className="space-y-4">
          {progress.lines.map((line) => (
            <div
              key={line.poLineId}
              className={`bg-white rounded-xl border p-5 ${
                activeLineId === line.poLineId
                  ? "border-[#3C50E0] shadow-sm"
                  : "border-gray-3/50"
              }`}
            >
              <button
                type="button"
                onClick={() => setActiveLineId(line.poLineId)}
                className="w-full text-left"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-dark">{line.productName}</p>
                    <p className="text-xs text-[#8D93A5]">
                      {line.variantName} · SKU {line.skuCode}
                    </p>
                  </div>
                  <div className="text-right text-sm">
                    <p className="font-bold text-[#3C50E0]">
                      {line.quantityReceived}/{line.quantityOrdered} OK
                    </p>
                    {line.quantityDamaged > 0 && (
                      <p className="text-xs text-[#DC2626] font-semibold">
                        {line.quantityDamaged} lỗi
                      </p>
                    )}
                  </div>
                </div>
              </button>

              {activeLineId === line.poLineId && line.remaining > 0 && (
                <div className="mt-4 space-y-4 border-t border-gray-3/50 pt-4">
                  <div className="flex flex-wrap gap-2 border-b border-gray-3/40 pb-2">
                    <button
                      type="button"
                      onClick={() => setInputMode("scan")}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                        inputMode === "scan"
                          ? "bg-[#3C50E0] text-white"
                          : "text-[#6C6F93] hover:bg-[#F7F9FC]"
                      }`}
                    >
                      Quét từng mã
                    </button>
                    <button
                      type="button"
                      onClick={() => setInputMode("bulk")}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                        inputMode === "bulk"
                          ? "bg-[#ff9f1a] text-white"
                          : "text-[#6C6F93] hover:bg-[#F7F9FC]"
                      }`}
                    >
                      Nhập danh sách / Excel
                    </button>
                  </div>

                  {inputMode === "scan" ? (
                    <>
                  <div className="grid grid-cols-1 lg:grid-cols-[1fr_200px] gap-3">
                    <div>
                      <label className="text-xs font-semibold text-[#6C6F93]">
                        Quét Serial / IMEI (hàng nguyên vẹn)
                      </label>
                      <input
                        ref={scanInputRef}
                        value={scanCode}
                        onChange={(e) => {
                          setScanCode(e.target.value);
                          setScanResult(null);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") void handleValidateAndReceive();
                        }}
                        placeholder="Quét tem serial/IMEI..."
                        className="mt-1 w-full px-4 py-3 border-2 border-[#3C50E0]/30 rounded-lg text-sm font-mono focus:border-[#3C50E0] outline-none"
                        autoComplete="off"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-[#6C6F93]">
                        Vị trí kệ đặt hàng
                      </label>
                      <input
                        value={shelfLocation}
                        onChange={(e) => setShelfLocation(e.target.value)}
                        placeholder="Kệ A1-02"
                        className="mt-1 w-full px-3 py-3 border border-gray-3 rounded-lg text-sm"
                      />
                    </div>
                  </div>

                  {scanResult && (
                    <p
                      className={`text-sm font-medium ${
                        scanResult.valid ? "text-green" : "text-red"
                      }`}
                    >
                      {scanResult.message}
                    </p>
                  )}

                  <PrimaryButton
                    type="button"
                    disabled={submitting}
                    onClick={() => void handleValidateAndReceive()}
                  >
                    {submitting ? "Đang xử lý..." : "Xác nhận quét & nhập kho"}
                  </PrimaryButton>
                    </>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex flex-wrap items-center gap-3">
                        <input
                          ref={excelInputRef}
                          type="file"
                          accept=".xlsx,.xls,.csv"
                          className="hidden"
                          onChange={(e) => {
                            const f = e.target.files?.[0];
                            if (f) void handleExcelFile(f);
                            e.target.value = "";
                          }}
                        />
                        <button
                          type="button"
                          disabled={submitting || excelParsing}
                          onClick={() => excelInputRef.current?.click()}
                          className="px-4 py-2 rounded-lg text-sm font-semibold border border-[#ff9f1a] text-[#e65100] bg-[#fff8ef] hover:bg-[#ffedd5] disabled:opacity-60 inline-flex items-center gap-2"
                        >
                          {excelParsing ? (
                            "Đang đọc file..."
                          ) : (
                            <>
                              <IconUpload size={16} className="shrink-0" />
                              Upload Excel
                            </>
                          )}
                        </button>
                        <button
                          type="button"
                          disabled={submitting || bulkSerialText.length === 0}
                          onClick={() => {
                            setBulkSerialText("");
                            setLastExcelMeta(null);
                          }}
                          className="text-sm font-semibold text-red hover:underline disabled:opacity-40"
                        >
                          Xóa danh sách
                        </button>
                        {lastExcelMeta && (
                          <span className="text-xs text-[#8D93A5]">{lastExcelMeta}</span>
                        )}
                      </div>
                      <p className="text-xs text-[#8D93A5]">
                        File chỉ đọc trên trình duyệt — không upload lên server. Cột tiêu đề: Serial
                        hoặc IMEI.
                      </p>
                      <textarea
                        rows={8}
                        value={bulkSerialText}
                        onChange={(e) => setBulkSerialText(e.target.value)}
                        placeholder={`SN-F2LDN3K4N741\nSN-H8K9M2P5Q123\nSN-J3L6N9R2T456`}
                        className="w-full px-3 py-2 border border-gray-3 rounded-xl font-mono text-sm bg-[#fafafa]"
                      />
                      {parsedSerials.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          <span className="px-2.5 py-1 rounded-full text-xs border border-[#3C50E0]/30 text-[#3C50E0]">
                            Tổng dòng: {parsedSerials.length}
                          </span>
                          <span className="px-2.5 py-1 rounded-full text-xs border border-green/30 text-green">
                            Unique: {uniqueSerials.length}
                          </span>
                          {hasBulkDuplicates && (
                            <span className="px-2.5 py-1 rounded-full text-xs border border-amber-400/50 text-amber-800 bg-amber-50">
                              Trùng lặp: {parsedSerials.length - uniqueSerials.length}
                            </span>
                          )}
                        </div>
                      )}
                      {hasBulkDuplicates && (
                        <p className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                          Có Serial trùng trong danh sách — hệ thống chỉ gửi{" "}
                          <strong>{uniqueSerials.length}</strong> mã duy nhất.
                        </p>
                      )}
                      {parsedSerials.length > 0 && (
                        <div className="max-h-48 overflow-y-auto space-y-1 rounded-lg border border-gray-3/50 p-2 bg-[#F7F9FC]">
                          {parsedSerials.map((serial, index) => {
                            const isDup = parsedSerials.indexOf(serial) !== index;
                            return (
                              <div
                                key={`${serial}-${index}`}
                                className={`flex items-center gap-2 px-2 py-1 rounded text-xs font-mono ${
                                  isDup
                                    ? "bg-[#fef9c3] text-[#92400e]"
                                    : "bg-green-light-6/50 text-[#166534]"
                                }`}
                              >
                                <span className="text-[#8D93A5] w-6">#{index + 1}</span>
                                <span className="flex-1">{serial}</span>
                                {isDup && (
                                  <span className="text-[10px] font-bold text-amber-700">Trùng</span>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                      <PrimaryButton
                        type="button"
                        disabled={
                          submitting ||
                          uniqueSerials.length === 0 ||
                          exceedsLineLimit
                        }
                        onClick={() => void handleBulkSerialSubmit()}
                        className="inline-flex items-center gap-2"
                      >
                        {submitting ? (
                          "Đang nhập..."
                        ) : (
                          <>
                            <IconImport size={16} className="shrink-0" />
                            Nhập {uniqueSerials.length}/{line.remaining} còn lại
                          </>
                        )}
                      </PrimaryButton>
                      {exceedsLineLimit && (
                        <p className="text-xs text-red">
                          Vượt quá SL còn lại trên dòng này ({line.remaining}).
                        </p>
                      )}
                    </div>
                  )}

                  <div className="rounded-lg bg-[#F7F9FC] border border-gray-3/50 p-4 space-y-3">
                    <p className="text-xs font-bold text-[#6C6F93] uppercase">
                      Hàng phụ kiện / không serial
                    </p>
                    <div className="flex flex-wrap items-end gap-3">
                      <label className="text-sm">
                        <span className="text-[#8D93A5] text-xs">Số lượng</span>
                        <input
                          type="number"
                          min={1}
                          max={line.remaining}
                          value={bulkQty}
                          onChange={(e) => setBulkQty(e.target.value)}
                          className="mt-1 block w-28 border border-gray-3 rounded-lg px-2 py-1.5 text-sm"
                        />
                      </label>
                      <button
                        type="button"
                        disabled={submitting}
                        onClick={() => void handleBulkReceive()}
                        className="px-4 py-2 rounded-lg text-sm font-semibold border border-[#3C50E0] text-[#3C50E0] hover:bg-[#EEF2FF]"
                      >
                        Nhập SL ({line.remaining} còn lại)
                      </button>
                    </div>
                  </div>

                  <button
                    type="button"
                    disabled={submitting}
                    onClick={openDamagedModal}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-bold text-[#DC2626] border-2 border-[#FCA5A5] bg-[#FEF2F2] hover:bg-[#FEE2E2] w-full sm:w-auto justify-center"
                  >
                    <IconX size={16} className="shrink-0" aria-hidden />
                    Báo cáo hàng lỗi / vỡ (Damaged)
                  </button>
                </div>
              )}

              {(line.receivedSerials.length > 0 || line.damagedSerials.length > 0) && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {line.receivedSerials.map((s) => (
                    <span
                      key={`ok-${s}`}
                      className="px-2 py-1 bg-green-light-6 text-green text-xs font-mono rounded inline-flex items-center gap-1"
                    >
                      <IconCheck size={12} className="shrink-0" />
                      {s}
                    </span>
                  ))}
                  {line.damagedSerials.map((s) => (
                    <span
                      key={`bad-${s}`}
                      className="px-2 py-1 bg-[#FEE2E2] text-[#DC2626] text-xs font-mono rounded inline-flex items-center gap-1"
                    >
                      <IconX size={12} className="shrink-0" />
                      {s}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {detail.rawStatus === "COMPLETED" && (
        <div className="bg-green-light-6 border border-green-light-5 rounded-xl p-6 text-center">
          <p className="font-semibold text-green">PO đã khóa — hoàn tất kiểm đếm</p>
          <p className="text-sm text-[#6C6F93] mt-1">
            OK {progress.totalReceived} · Lỗi {progress.totalDamaged} / {progress.totalOrdered}
          </p>
        </div>
      )}

      {detail.canLockOrder && (
        <div className="bg-[#FFF7ED] border-2 border-[#FDBA74] rounded-xl p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <p className="font-bold text-[#C2410C]">Hoàn tất đợt kiểm đếm & Khóa đơn</p>
              <p className="text-sm text-[#9A3412] mt-1">
                Tổng kết: {progress.totalReceived} nguyên vẹn, {progress.totalDamaged} lỗi
                {progress.totalRemaining > 0
                  ? `, còn thiếu ${progress.totalRemaining} — cần lý do sai lệch`
                  : " — đủ số lượng, có thể khóa PO"}
              </p>
            </div>
            <button
              type="button"
              disabled={submitting}
              onClick={() => {
                setDiscrepancyNote("");
                setLockOpen(true);
              }}
              className="px-6 py-3 rounded-lg text-sm font-bold text-white bg-[#F97316] hover:bg-[#EA580C] disabled:opacity-60 shadow-md"
            >
              Hoàn tất kiểm đếm & Khóa đơn
            </button>
          </div>
        </div>
      )}

      <Modal
        open={damagedOpen}
        onClose={() => !submitting && setDamagedOpen(false)}
        title="Báo cáo hàng lỗi / vỡ"
        subtitle={activeLine?.productName}
        footer={
          <div className="flex gap-2 justify-end w-full">
            <button
              type="button"
              disabled={submitting}
              onClick={() => setDamagedOpen(false)}
              className="px-4 py-2 rounded-lg border border-gray-3 text-sm"
            >
              Hủy
            </button>
            <button
              type="button"
              disabled={submitting}
              onClick={() => void handleReportDamaged()}
              className="px-4 py-2 rounded-lg text-sm font-bold text-white bg-[#DC2626] hover:bg-[#B91C1C] disabled:opacity-60"
            >
              {submitting ? "Đang lưu..." : "Ghi nhận hàng lỗi"}
            </button>
          </div>
        }
      >
        <div className="space-y-4 text-sm">
          <label className="block">
            <span className="font-medium">Serial thiết bị lỗi (nếu có)</span>
            <input
              value={damagedSerial}
              onChange={(e) => setDamagedSerial(e.target.value)}
              placeholder="Quét serial máy lỗi..."
              className="mt-1 w-full border border-gray-3 rounded-lg px-3 py-2 font-mono text-sm"
            />
          </label>
          {!damagedSerial.trim() && (
            <label className="block">
              <span className="font-medium">Số lượng lỗi (phụ kiện)</span>
              <input
                type="number"
                min={1}
                value={damagedQty}
                onChange={(e) => setDamagedQty(e.target.value)}
                className="mt-1 w-28 border border-gray-3 rounded-lg px-2 py-1.5"
              />
            </label>
          )}
          <label className="block">
            <span className="font-medium text-dark">
              Lý do / mô tả tổn thất <span className="text-red">*</span>
            </span>
            <textarea
              value={damagedReason}
              onChange={(e) => setDamagedReason(e.target.value)}
              placeholder="Vỡ màn hình, móp hộp, thiếu phụ kiện..."
              className="mt-1 w-full border border-gray-3 rounded-lg px-3 py-2 min-h-[80px]"
            />
          </label>
          <label className="block">
            <span className="font-medium">Ảnh minh chứng tại trận</span>
            <input
              type="file"
              accept="image/*"
              capture="environment"
              onChange={(e) => handleEvidenceChange(e.target.files?.[0] ?? null)}
              className="mt-1 block w-full text-sm"
            />
            {evidencePreview && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={evidencePreview}
                alt="Minh chứng"
                className="mt-2 max-h-40 rounded-lg border border-gray-3"
              />
            )}
          </label>
        </div>
      </Modal>

      <Modal
        open={lockOpen}
        onClose={() => !submitting && setLockOpen(false)}
        title="Xác nhận khóa đơn PO"
        subtitle={detail.code}
        footer={
          <div className="flex gap-2 justify-end w-full">
            <button
              type="button"
              disabled={submitting}
              onClick={() => setLockOpen(false)}
              className="px-4 py-2 rounded-lg border border-gray-3 text-sm"
            >
              Hủy
            </button>
            <button
              type="button"
              disabled={submitting}
              onClick={() => void handleLockOrder()}
              className="px-5 py-2 rounded-lg text-sm font-bold text-white bg-[#F97316] hover:bg-[#EA580C] disabled:opacity-60"
            >
              {submitting ? "Đang khóa..." : "Khóa đơn vĩnh viễn"}
            </button>
          </div>
        }
      >
        <div className="space-y-3 text-sm">
          <div className="rounded-lg bg-[#F7F9FC] p-4 grid grid-cols-2 gap-2">
            <p>
              <span className="text-[#8D93A5]">SL đặt:</span>{" "}
              <strong>{progress.totalOrdered}</strong>
            </p>
            <p>
              <span className="text-[#8D93A5]">Nhập OK:</span>{" "}
              <strong className="text-green">{progress.totalReceived}</strong>
            </p>
            <p>
              <span className="text-[#8D93A5]">Hàng lỗi:</span>{" "}
              <strong className="text-[#DC2626]">{progress.totalDamaged}</strong>
            </p>
            <p>
              <span className="text-[#8D93A5]">Còn thiếu:</span>{" "}
              <strong>{progress.totalRemaining}</strong>
            </p>
          </div>
          {progress.totalRemaining > 0 && (
            <label className="block">
              <span className="font-medium text-dark">
                Lý do sai lệch (bắt buộc) <span className="text-red">*</span>
              </span>
              <textarea
                value={discrepancyNote}
                onChange={(e) => setDiscrepancyNote(e.target.value)}
                placeholder="NCC giao thiếu, tài xế không giao đủ..."
                className="mt-1 w-full border border-gray-3 rounded-lg px-3 py-2 min-h-[80px]"
              />
            </label>
          )}
          <p className="text-xs text-[#8D93A5]">
            Sau khi khóa, PO chuyển sang COMPLETED và không thể quét thêm.
          </p>
        </div>
      </Modal>
    </div>
  );
}
