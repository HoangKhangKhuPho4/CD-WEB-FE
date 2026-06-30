"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState, type DragEvent } from "react";
import toast from "react-hot-toast";
import PrimaryButton from "@/components/Admin/shared/PrimaryButton";
import {
  IconAlertTriangle,
  IconCheck,
  IconCheckCircle,
  IconSend,
  InventoryAuditStatusLabel,
  StatusDot,
} from "@/components/Admin/icons/AdminIcons";
import {
  adminCategoryApi,
  adminInventoryAuditApi,
  type CategoryItem,
  type InventoryAuditFeStatus,
  type InventoryAuditSheet,
  type InventoryAuditStats,
} from "@/utils/adminApi";
import { parseSerialsFromExcelFile } from "@/utils/parseSerialsFromExcelFile";

const STEPS = ["Tạo phiếu", "Quét đếm", "Báo cáo"] as const;

const statusMap: Record<InventoryAuditFeStatus, { label: string; className: string }> = {
  in_progress: { label: "Đang quét", className: "bg-blue-light-5 text-[#3C50E0]" },
  draft: { label: "Nháp", className: "bg-gray-3 text-[#6C6F93]" },
  reconciled: { label: "Đã đối chiếu", className: "bg-[#E0E7FF] text-[#4338CA]" },
  pending_approval: { label: "Chờ duyệt", className: "bg-[#FEF3C7] text-yellow-dark-2" },
  submitted: { label: "Chờ duyệt", className: "bg-[#FEF3C7] text-yellow-dark-2" },
  approved: { label: "Đã duyệt", className: "bg-green-light-6 text-green" },
  rejected: { label: "Từ chối", className: "bg-red-light-6 text-red" },
};

function parseBulkCodes(text: string): string[] {
  return text
    .split(/[\n\r,;\t]+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

export default function InventoryAuditPanel() {
  const [step, setStep] = useState(1);
  const [sheet, setSheet] = useState<InventoryAuditSheet | null>(null);
  const [recent, setRecent] = useState<InventoryAuditSheet[]>([]);
  const [stats, setStats] = useState<InventoryAuditStats | null>(null);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [productTypeId, setProductTypeId] = useState<number | "">("");
  const [scanInput, setScanInput] = useState("");
  const [shelfLocation, setShelfLocation] = useState("");
  const [pasteText, setPasteText] = useState("");
  const [reportNote, setReportNote] = useState("");
  const [progressLines, setProgressLines] = useState<
    InventoryAuditSheet["lines"]
  >([]);
  const [loading, setLoading] = useState(false);
  const [excelParsing, setExcelParsing] = useState(false);
  const [excelDragOver, setExcelDragOver] = useState(false);
  const [lastExcelMeta, setLastExcelMeta] = useState<string | null>(null);
  const scanRef = useRef<HTMLInputElement>(null);
  const excelInputRef = useRef<HTMLInputElement>(null);

  const loadMeta = useCallback(async () => {
    try {
      const [recentRes, statsRes, catRes] = await Promise.all([
        adminInventoryAuditApi.recent(),
        adminInventoryAuditApi.stats(),
        adminCategoryApi.listAll(),
      ]);
      setRecent(recentRes.data.data ?? []);
      setStats(statsRes.data.data ?? null);
      setCategories(catRes.data.data ?? []);
    } catch {
      toast.error("Không tải được dữ liệu kiểm kê");
    }
  }, []);

  const refreshSheet = useCallback(async (id: number) => {
    const res = await adminInventoryAuditApi.get(id);
    if (res.data.success) {
      setSheet(res.data.data);
      return res.data.data;
    }
    return null;
  }, []);

  const refreshProgress = useCallback(async (id: number) => {
    try {
      const res = await adminInventoryAuditApi.scanProgress(id);
      if (res.data.success) {
        setProgressLines(
          res.data.data.lines.map((l) => ({
            variantId: l.variantId,
            productName: l.productName,
            variantName: l.variantName,
            skuCode: l.skuCode,
            systemQty: 0,
            actualQty: l.actualQty,
            variance: 0,
            status: "SCANNED",
          }))
        );
      }
    } catch {
      /* optional */
    }
  }, []);

  useEffect(() => {
    void loadMeta();
  }, [loadMeta]);

  useEffect(() => {
    if (step === 2 && sheet?.id) {
      void refreshProgress(sheet.id);
      scanRef.current?.focus();
    }
  }, [step, sheet?.id, refreshProgress]);

  const resumeSheet = async (s: InventoryAuditSheet) => {
    setLoading(true);
    try {
      const full = await refreshSheet(s.id);
      if (!full) return;
      if (full.status === "in_progress" || full.status === "draft" || full.status === "rejected") {
        setStep(2);
      } else if (full.status === "reconciled") {
        setStep(3);
      } else {
        setStep(3);
      }
      setReportNote(full.note ?? "");
    } finally {
      setLoading(false);
    }
  };

  const startAudit = async () => {
    if (!productTypeId) {
      toast.error("Chọn danh mục kiểm kê");
      return;
    }
    setLoading(true);
    try {
      const res = await adminInventoryAuditApi.start({
        productTypeId: Number(productTypeId),
        retailLocked: true,
      });
      if (res.data.success) {
        setSheet(res.data.data);
        setStep(2);
        toast.success(`Bắt đầu kiểm kê ${res.data.data.code}`);
        await loadMeta();
      }
    } catch (err: unknown) {
      const msg =
        err && typeof err === "object" && "response" in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : null;
      toast.error(msg ?? "Không thể bắt đầu kiểm kê");
    } finally {
      setLoading(false);
    }
  };

  const handleScan = async () => {
    if (!sheet || !scanInput.trim()) return;
    try {
      const res = await adminInventoryAuditApi.scan(sheet.id, {
        code: scanInput.trim(),
        shelfLocation: shelfLocation.trim() || undefined,
      });
      if (res.data.success) {
        const r = res.data.data;
        if (r.resultType === "MATCHED" || r.resultType === "MISPLACED") {
          toast.success(r.message, {
            icon:
              r.resultType === "MISPLACED" ? (
                <IconAlertTriangle size={20} className="text-amber-600" />
              ) : (
                <IconCheckCircle size={20} className="text-green" />
              ),
          });
        } else if (r.resultType === "SURPLUS") {
          toast(r.message, {
            icon: <StatusDot color="yellow" />,
          });
        } else {
          toast(r.message);
        }
        setScanInput("");
        await refreshSheet(sheet.id);
        await refreshProgress(sheet.id);
        scanRef.current?.focus();
      }
    } catch {
      toast.error("Quét thất bại");
    }
  };

  const runBulkScan = async (codes: string[], sourceLabel?: string) => {
    if (!sheet || codes.length === 0) return;
    setLoading(true);
    try {
      const res = await adminInventoryAuditApi.bulkScan(sheet.id, { codes });
      if (res.data.success) {
        const b = res.data.data;
        toast.success(
          sourceLabel
            ? `${sourceLabel}: ${b.total} mã (khớp ${b.matched}, thừa ${b.surplus}, trùng ${b.duplicate})`
            : `Import xong: ${b.total} mã (khớp ${b.matched}, thừa ${b.surplus}, trùng ${b.duplicate})`
        );
        await refreshSheet(sheet.id);
        await refreshProgress(sheet.id);
      }
    } catch (err: unknown) {
      const msg =
        err && typeof err === "object" && "response" in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : null;
      toast.error(msg ?? "Import danh sách thất bại");
    } finally {
      setLoading(false);
    }
  };

  const handleBulkPaste = async () => {
    const codes = parseBulkCodes(pasteText);
    if (codes.length === 0) {
      toast.error("Chưa có mã hợp lệ");
      return;
    }
    await runBulkScan(codes);
    setPasteText("");
  };

  const handleExcelFile = async (file: File) => {
    if (!sheet) return;
    setExcelParsing(true);
    setLastExcelMeta(null);
    try {
      const parsed = await parseSerialsFromExcelFile(file);
      setLastExcelMeta(
        `${file.name} · sheet "${parsed.sheetName}" · cột "${parsed.columnLabel}" · ${parsed.codes.length} mã`
      );
      await runBulkScan(parsed.codes, `Excel ${file.name}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Không đọc được file Excel";
      toast.error(msg);
    } finally {
      setExcelParsing(false);
      if (excelInputRef.current) excelInputRef.current.value = "";
    }
  };

  const onExcelDrop = (e: DragEvent) => {
    e.preventDefault();
    setExcelDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) void handleExcelFile(file);
  };

  const handleComplete = async () => {
    if (!sheet) return;
    setLoading(true);
    try {
      const res = await adminInventoryAuditApi.complete(sheet.id);
      if (res.data.success) {
        toast.success(res.data.data.summary);
        setSheet(res.data.data.sheet);
        setStep(3);
      }
    } catch (err: unknown) {
      const msg =
        err && typeof err === "object" && "response" in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : null;
      toast.error(msg ?? "Hoàn tất kiểm đếm thất bại");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!sheet) return;
    setLoading(true);
    try {
      const res = await adminInventoryAuditApi.submit(sheet.id, { note: reportNote });
      if (res.data.success) {
        toast.success("Đã gửi báo cáo chênh lệch lên Admin");
        setSheet(res.data.data);
        await loadMeta();
      }
    } catch {
      toast.error("Gửi báo cáo thất bại");
    } finally {
      setLoading(false);
    }
  };

  const statCards = stats
    ? [
        { label: "Đang kiểm", value: stats.inProgressCount },
        { label: "Chờ duyệt", value: stats.pendingApprovalCount },
        { label: "Đã duyệt", value: stats.approvedCount },
      ]
    : [];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {statCards.map((c) => (
          <div key={c.label} className="bg-white rounded-xl border border-gray-3/50 p-5">
            <p className="text-xs font-bold text-[#8D93A5] uppercase">{c.label}</p>
            <p className="text-3xl font-bold text-[#3C50E0] mt-1">{c.value}</p>
          </div>
        ))}
      </div>

      {/* Stepper */}
      <div className="flex items-center justify-center gap-2 sm:gap-4">
        {STEPS.map((label, i) => {
          const n = i + 1;
          const active = step === n;
          const done = step > n;
          return (
            <div key={label} className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  active
                    ? "bg-[#3C50E0] text-white"
                    : done
                      ? "bg-green text-white"
                      : "bg-gray-3 text-[#6C6F93]"
                }`}
              >
                {done ? <IconCheck size={14} /> : n}
              </div>
              <span
                className={`text-sm font-semibold hidden sm:inline ${
                  active ? "text-[#3C50E0]" : "text-[#6C6F93]"
                }`}
              >
                {label}
              </span>
              {i < STEPS.length - 1 && (
                <div className="w-8 sm:w-16 h-0.5 bg-gray-3 mx-1" />
              )}
            </div>
          );
        })}
      </div>

      {step === 1 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl border border-gray-3/50 p-6 space-y-4">
            <h3 className="text-lg font-bold text-dark">Tạo phiếu kiểm kê</h3>
            <p className="text-sm text-[#6C6F93]">
              Chọn danh mục cần kiểm. Hệ thống chụp số tồn serial AVAILABLE và tạm khóa bán
              lẻ danh mục đó trong lúc kiểm.
            </p>
            <label className="block text-sm font-semibold text-dark">Danh mục / khu vực kho</label>
            <select
              value={productTypeId}
              onChange={(e) =>
                setProductTypeId(e.target.value ? Number(e.target.value) : "")
              }
              className="w-full px-4 py-2.5 border border-gray-3 rounded-lg text-sm"
            >
              <option value="">— Chọn danh mục —</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            <PrimaryButton
              type="button"
              className="w-full"
              onClick={() => void startAudit()}
              disabled={loading}
            >
              ▶ Bắt đầu kiểm kho
            </PrimaryButton>
          </div>

          <div className="bg-white rounded-xl border border-gray-3/50 p-6 space-y-3">
            <h3 className="text-lg font-bold text-dark">Phiếu gần đây</h3>
            {recent.length === 0 ? (
              <p className="text-sm text-[#8D93A5]">Chưa có phiếu kiểm kê</p>
            ) : (
              <div className="space-y-2">
                {recent.map((s) => {
                  const st = statusMap[s.status] ?? statusMap.in_progress;
                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => void resumeSheet(s)}
                      className="w-full text-left px-4 py-3 rounded-lg border border-gray-3/50 hover:bg-[#F7F9FC] transition-colors"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-semibold text-[#3C50E0]">{s.code}</span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${st.className}`}>
                          {st.label}
                        </span>
                      </div>
                      <p className="text-xs text-[#8D93A5] mt-1">
                        {s.categoryName ?? "—"} · {s.createdAt}
                      </p>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {step === 2 && sheet && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 bg-white rounded-xl border border-gray-3/50 p-5 space-y-4">
            <div>
              <h3 className="text-lg font-bold text-dark">Danh sách cần kiểm</h3>
              <p className="text-xs text-yellow-dark-2 mt-1 font-medium inline-flex items-center gap-1.5">
                <IconAlertTriangle size={14} className="shrink-0" />
                Số lượng hệ thống được ẩn — chỉ hiện tiến độ quét thực tế.
              </p>
              <p className="text-sm text-[#6C6F93] mt-2">
                Phiếu: <strong>{sheet.code}</strong> · {sheet.categoryName}
              </p>
              <div className="flex flex-wrap items-center gap-2 mt-2">
                <span className="inline-block px-3 py-1 rounded-full bg-[#E0E7FF] text-[#3C50E0] text-sm font-semibold">
                  Đã quét: {sheet.scanned} mã
                </span>
                {(statusMap[sheet.status] ?? statusMap.in_progress) && (
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      (statusMap[sheet.status] ?? statusMap.in_progress).className
                    }`}
                  >
                    {(statusMap[sheet.status] ?? statusMap.in_progress).label}
                  </span>
                )}
              </div>
            </div>
            <div className="border border-gray-3/50 rounded-lg overflow-hidden max-h-80 overflow-y-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-[#F7F9FC]">
                    <th className="text-left px-3 py-2 text-xs text-[#8D93A5]">Sản phẩm</th>
                    <th className="text-center px-3 py-2 text-xs text-[#8D93A5]">SL thực tế</th>
                  </tr>
                </thead>
                <tbody>
                  {progressLines.length === 0 ? (
                    <tr>
                      <td colSpan={2} className="px-3 py-6 text-center text-[#8D93A5] text-xs">
                        Chưa quét mã nào
                      </td>
                    </tr>
                  ) : (
                    progressLines.map((line, i) => (
                      <tr key={i} className="border-t border-gray-3/30">
                        <td className="px-3 py-2">
                          <p className="font-medium text-dark text-xs">{line.productName}</p>
                          <p className="text-[10px] text-[#8D93A5]">{line.skuCode}</p>
                        </td>
                        <td className="px-3 py-2 text-center">
                          <span
                            className={`px-2 py-0.5 rounded text-xs font-bold ${
                              line.actualQty > 0
                                ? "bg-green-light-6 text-green"
                                : "bg-gray-3 text-[#8D93A5]"
                            }`}
                          >
                            {line.actualQty}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="lg:col-span-7 bg-white rounded-xl border border-gray-3/50 p-5 space-y-5">
            <h3 className="text-lg font-bold text-dark">Quét mã vạch / Serial</h3>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-[#6C6F93]">Quét đơn lẻ</label>
              <div className="flex gap-2">
                <input
                  ref={scanRef}
                  value={scanInput}
                  onChange={(e) => setScanInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && void handleScan()}
                  placeholder="Chờ súng quét IMEI/Serial..."
                  className="flex-1 px-4 py-2.5 border border-gray-3 rounded-lg text-sm font-mono"
                  autoFocus
                />
                <PrimaryButton type="button" onClick={() => void handleScan()}>
                  Quét
                </PrimaryButton>
              </div>
              <input
                value={shelfLocation}
                onChange={(e) => setShelfLocation(e.target.value)}
                placeholder="Vị trí kệ thực tế (tuỳ chọn — phát hiện đặt sai)"
                className="w-full px-4 py-2 border border-gray-3 rounded-lg text-sm"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-[#6C6F93]">
                Upload file Excel (.xlsx) — đọc trên trình duyệt, không lưu cloud
              </label>
              <div
                role="button"
                tabIndex={0}
                onDragOver={(e) => {
                  e.preventDefault();
                  setExcelDragOver(true);
                }}
                onDragLeave={() => setExcelDragOver(false)}
                onDrop={onExcelDrop}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") excelInputRef.current?.click();
                }}
                className={`relative flex flex-col items-center justify-center gap-2 px-4 py-8 border-2 border-dashed rounded-xl text-center transition-colors cursor-pointer ${
                  excelDragOver
                    ? "border-[#7C3AED] bg-[#F5F3FF]"
                    : "border-gray-3 hover:border-[#7C3AED]/60 hover:bg-[#FAFAFC]"
                }`}
                onClick={() => excelInputRef.current?.click()}
              >
                <input
                  ref={excelInputRef}
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  className="hidden"
                  disabled={loading || excelParsing}
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) void handleExcelFile(f);
                  }}
                />
                {excelParsing ? (
                  <p className="text-sm font-semibold text-[#7C3AED]">Đang đọc file Excel...</p>
                ) : (
                  <>
                    <p className="text-sm font-semibold text-dark">
                      Kéo thả file Excel vào đây
                    </p>
                    <p className="text-xs text-[#8D93A5]">
                      hoặc bấm để chọn · cột tiêu đề Serial / IMEI · tối đa 5MB
                    </p>
                  </>
                )}
              </div>
              {lastExcelMeta && (
                <p className="text-xs text-[#6C6F93] font-medium">Lần import gần nhất: {lastExcelMeta}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-[#6C6F93]">
                Hoặc dán danh sách (Copy-Paste)
              </label>
              <textarea
                value={pasteText}
                onChange={(e) => setPasteText(e.target.value)}
                rows={5}
                placeholder="Dán cột Serial từ Excel..."
                className="w-full px-4 py-3 border border-dashed border-gray-3 rounded-lg text-sm font-mono resize-none"
              />
              <PrimaryButton
                type="button"
                className="bg-[#7C3AED] hover:bg-[#6D28D9] shadow-none"
                onClick={() => void handleBulkPaste()}
                disabled={loading || excelParsing || parseBulkCodes(pasteText).length === 0}
              >
                Import danh sách ({parseBulkCodes(pasteText).length} mã)
              </PrimaryButton>
            </div>

            <PrimaryButton
              type="button"
              className="w-full bg-[#7C3AED] hover:bg-[#6D28D9] shadow-none"
              onClick={() => void handleComplete()}
              disabled={loading || excelParsing || sheet.scanned === 0}
            >
              Hoàn tất kiểm đếm → Đối chiếu
            </PrimaryButton>
          </div>
        </div>
      )}

      {step === 3 && sheet && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-gray-3/50 p-5">
            <h3 className="text-lg font-bold text-dark mb-4">Báo cáo đối chiếu — {sheet.code}</h3>
            <div className="flex flex-wrap gap-3 mb-4 text-sm">
              <span className="px-3 py-1 rounded-full bg-green-light-6 text-green font-semibold">
                Khớp: {sheet.matched}
              </span>
              <span className="px-3 py-1 rounded-full bg-red-light-6 text-red font-semibold">
                Thiếu: {sheet.missing}
              </span>
              <span className="px-3 py-1 rounded-full bg-[#FFF7ED] text-orange-600 font-semibold">
                Thừa: {sheet.surplus}
              </span>
              <span className="px-3 py-1 rounded-full bg-[#F7F9FC] text-[#6C6F93]">
                Hệ thống: {sheet.expected} serial
              </span>
            </div>

            <div className="overflow-x-auto border border-gray-3/50 rounded-lg">
              <table className="w-full text-sm min-w-[600px]">
                <thead>
                  <tr className="bg-[#F7F9FC]">
                    <th className="text-left px-4 py-3 text-xs text-[#8D93A5]">Sản phẩm</th>
                    <th className="text-center px-4 py-3 text-xs text-[#8D93A5]">SL hệ thống</th>
                    <th className="text-center px-4 py-3 text-xs text-[#8D93A5]">SL thực tế</th>
                    <th className="text-center px-4 py-3 text-xs text-[#8D93A5]">Chênh lệch</th>
                    <th className="text-center px-4 py-3 text-xs text-[#8D93A5]">Trạng thái</th>
                  </tr>
                </thead>
                <tbody>
                  {(sheet.lines ?? []).map((line, i) => {
                    const rowBg =
                      line.variance === 0
                        ? "bg-[#f0fdf4]"
                        : line.variance < 0
                          ? "bg-[#fef2f2]"
                          : "bg-[#fff7ed]";
                    return (
                      <tr key={i} className={`border-t border-gray-3/30 ${rowBg}`}>
                        <td className="px-4 py-3">
                          <p className="font-semibold">{line.productName}</p>
                          <p className="text-xs text-[#8D93A5]">{line.skuCode}</p>
                        </td>
                        <td className="px-4 py-3 text-center font-medium">{line.systemQty}</td>
                        <td className="px-4 py-3 text-center font-medium">{line.actualQty}</td>
                        <td
                          className={`px-4 py-3 text-center font-bold ${
                            line.variance < 0
                              ? "text-red"
                              : line.variance > 0
                                ? "text-orange-600"
                                : "text-green"
                          }`}
                        >
                          {line.variance > 0 ? `+${line.variance}` : line.variance}
                        </td>
                        <td className="px-4 py-3 text-center text-xs font-semibold">
                          <InventoryAuditStatusLabel status={line.status} />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {(sheet.missingCodes?.length ?? 0) > 0 && (
            <div className="rounded-xl border border-red-200 bg-[#fef2f2] p-5">
              <h4 className="text-red font-bold mb-3">
                Serial hệ thống có nhưng không quét ra ({sheet.missingCodes?.length})
              </h4>
              <div className="flex flex-wrap gap-2">
                {sheet.missingCodes?.map((code) => (
                  <code
                    key={code}
                    className="px-2 py-1 bg-white rounded text-xs font-mono text-red border border-red-100"
                  >
                    {code}
                  </code>
                ))}
              </div>
            </div>
          )}

          {(sheet.discrepancies?.length ?? 0) > 0 && (
            <div className="bg-white rounded-xl border border-gray-3/50 overflow-hidden">
              <h4 className="px-5 py-3 font-bold text-dark border-b border-gray-3/50">
                Chi tiết mã lệch
              </h4>
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-[#F7F9FC]">
                    <th className="text-left px-4 py-2 text-xs">Serial</th>
                    <th className="text-left px-4 py-2 text-xs">Loại</th>
                    <th className="text-left px-4 py-2 text-xs">Sản phẩm</th>
                  </tr>
                </thead>
                <tbody>
                  {sheet.discrepancies?.map((d, i) => (
                    <tr key={i} className="border-t border-gray-3/30">
                      <td className="px-4 py-2 font-mono text-xs">{d.serial}</td>
                      <td className="px-4 py-2">
                        <span
                          className={`px-2 py-0.5 rounded text-xs font-semibold ${
                            d.type === "MISSING"
                              ? "bg-red-light-6 text-red"
                              : "bg-[#FFF7ED] text-orange-600"
                          }`}
                        >
                          {d.type === "MISSING" ? "Thiếu" : "Thừa/Lệch"}
                        </span>
                      </td>
                      <td className="px-4 py-2 text-xs">{d.productName ?? d.message}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {sheet.status === "reconciled" && (
            <div className="bg-white rounded-xl border border-gray-3/50 p-5 space-y-4">
              <label className="text-sm font-semibold text-dark">Ghi chú báo cáo</label>
              <textarea
                value={reportNote}
                onChange={(e) => setReportNote(e.target.value)}
                rows={3}
                placeholder="Giải trình chênh lệch (nếu có)..."
                className="w-full px-4 py-3 border border-gray-3 rounded-lg text-sm resize-none"
              />
              <PrimaryButton
                type="button"
                onClick={() => void handleSubmit()}
                disabled={loading}
                className="inline-flex items-center gap-2"
              >
                <IconSend size={16} className="shrink-0" />
                Gửi báo cáo chênh lệch lên Admin
              </PrimaryButton>
            </div>
          )}

          {sheet.status === "pending_approval" && (
            <div className="rounded-lg border border-[#FEF3C7] bg-[#FFFBEB] px-4 py-3 text-sm text-[#92400E]">
              Phiếu đã gửi báo cáo — đang chờ Admin duyệt tại{" "}
              <Link
                href="/admin/inventory-audit-approval"
                className="font-semibold text-[#3C50E0] hover:underline"
              >
                Duyệt phiếu kiểm kê
              </Link>
              .
            </div>
          )}

          {sheet.status === "rejected" && sheet.rejectReason && (
            <div className="rounded-lg border border-red-200 bg-[#fef2f2] px-4 py-3 text-sm text-red">
              <strong>Admin từ chối:</strong> {sheet.rejectReason}
            </div>
          )}

          {sheet.status === "approved" && (
            <p className="text-sm text-green font-semibold inline-flex items-center gap-1.5">
              <IconCheck size={16} className="shrink-0" />
              Phiếu đã duyệt
              {sheet.approvedByName ? ` bởi ${sheet.approvedByName}` : ""} — tồn kho đã được cân
              bằng.
            </p>
          )}

          <button
            type="button"
            onClick={() => {
              setStep(1);
              setSheet(null);
            }}
            className="text-sm text-[#3C50E0] font-semibold hover:underline"
          >
            ← Tạo phiếu kiểm kê mới
          </button>
        </div>
      )}
    </div>
  );
}
