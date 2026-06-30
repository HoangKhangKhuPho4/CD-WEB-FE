"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import PrimaryButton from "@/components/Admin/shared/PrimaryButton";
import {
  IconAlertTriangle,
  IconCheck,
  IconCheckCircle,
  IconPrint,
  IconSave,
  StatusDot,
  IconX,
} from "@/components/Admin/icons/AdminIcons";
import { purchaseOrderReceiveApi } from "@/utils/purchaseOrderReceiveApi";
import {
  printDefectLabel,
  returnInspectionApi,
  type ReturnInspectionDetail,
} from "@/utils/returnInspectionApi";

type Judgment = "GOOD" | "DEFECTIVE";
type DefectCause = "SHIPPING" | "MANUFACTURER";

function applyDetailToForm(
  data: ReturnInspectionDetail,
  setters: {
    setScannedSerial: (v: string) => void;
    setJudgment: (v: Judgment) => void;
    setDefectCause: (v: DefectCause) => void;
    setDetailReason: (v: string) => void;
    setWarehouseNote: (v: string) => void;
    setEvidenceUrl: (v: string) => void;
  }
) {
  if (data.draftScannedSerial) setters.setScannedSerial(data.draftScannedSerial);
  if (data.judgment === "GOOD" || data.judgment === "DEFECTIVE") {
    setters.setJudgment(data.judgment);
  }
  if (data.defectCause === "SHIPPING" || data.defectCause === "MANUFACTURER") {
    setters.setDefectCause(data.defectCause);
  }
  if (data.detailReason) setters.setDetailReason(data.detailReason);
  if (data.warehouseNote) setters.setWarehouseNote(data.warehouseNote);
  if (data.evidenceUrl) setters.setEvidenceUrl(data.evidenceUrl);
}

export default function ReturnInspectionProcessPanel({ sheetId }: { sheetId: number }) {
  const router = useRouter();
  const scanRef = useRef<HTMLInputElement>(null);
  const evidenceInputRef = useRef<HTMLInputElement>(null);
  const [detail, setDetail] = useState<ReturnInspectionDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingEvidence, setUploadingEvidence] = useState(false);
  const [scannedSerial, setScannedSerial] = useState("");
  const [judgment, setJudgment] = useState<Judgment>("GOOD");
  const [defectCause, setDefectCause] = useState<DefectCause>("SHIPPING");
  const [detailReason, setDetailReason] = useState("");
  const [warehouseNote, setWarehouseNote] = useState("");
  const [evidenceUrl, setEvidenceUrl] = useState("");
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await returnInspectionApi.detail(sheetId);
      if (res.data.success) {
        const data = res.data.data;
        setDetail(data);
        applyDetailToForm(data, {
          setScannedSerial,
          setJudgment,
          setDefectCause,
          setDetailReason,
          setWarehouseNote,
          setEvidenceUrl,
        });
      }
    } catch {
      toast.error("Không tải được phiếu hoàn");
    } finally {
      setLoading(false);
    }
  }, [sheetId]);

  useEffect(() => {
    void load();
  }, [load]);

  const isEditable = detail?.status === "pending" || detail?.status === "draft";

  useEffect(() => {
    if (isEditable) scanRef.current?.focus();
  }, [isEditable, detail?.id]);

  const serialMatch =
    !scannedSerial.trim() ||
    !detail?.serialCode ||
    scannedSerial.trim().toUpperCase() === detail.serialCode.trim().toUpperCase();

  const draftBody = () => ({
    scannedSerial: scannedSerial.trim() || undefined,
    judgment,
    defectCause: judgment === "DEFECTIVE" ? defectCause : undefined,
    detailReason: detailReason.trim() || undefined,
    warehouseNote: warehouseNote.trim() || undefined,
    evidenceUrl: evidenceUrl || undefined,
  });

  const handleEvidenceChange = async (file: File | null) => {
    if (!file) return;
    setUploadingEvidence(true);
    try {
      const url = await purchaseOrderReceiveApi.uploadEvidence(file);
      setEvidenceUrl(url);
      toast.success("Đã tải ảnh minh chứng");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Upload ảnh thất bại";
      toast.error(msg);
    } finally {
      setUploadingEvidence(false);
      if (evidenceInputRef.current) evidenceInputRef.current.value = "";
    }
  };

  const handlePrintLabel = async () => {
    if (isEditable && judgment === "DEFECTIVE" && detail) {
      printDefectLabel({
        sheetCode: detail.sheetCode,
        serialCode: detail.serialCode,
        productName: detail.productName,
        variantName: detail.variantName,
        skuCode: detail.skuCode,
        orderCode: detail.orderCode,
        defectCause,
        detailReason: detailReason.trim() || undefined,
        processedAt: new Date().toLocaleString("vi-VN"),
        zoneLabel:
          defectCause === "SHIPPING"
            ? "KHU CÁCH LY — LỖI VẬN CHUYỂN"
            : "KHU CÁCH LY — LỖI SẢN XUẤT",
      });
      return;
    }
    try {
      const res = await returnInspectionApi.defectLabel(sheetId);
      if (res.data.success) {
        printDefectLabel(res.data.data);
      }
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        "Không tạo được nhãn in";
      toast.error(msg);
    }
  };

  const handleSaveDraft = async () => {
    if (!detail || !isEditable) return;
    setSubmitting(true);
    try {
      const res = await returnInspectionApi.saveDraft(sheetId, draftBody());
      if (res.data.success) {
        toast.success("Đã lưu tạm — có thể tiếp tục sau");
        router.push("/admin/return");
      }
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        "Lưu tạm thất bại";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = async () => {
    if (!cancelReason.trim()) {
      toast.error("Nhập lý do hủy phiếu");
      return;
    }
    setSubmitting(true);
    try {
      const res = await returnInspectionApi.cancel(sheetId, cancelReason.trim());
      if (res.data.success) {
        toast.success("Đã hủy phiếu hoàn");
        router.push("/admin/return");
      }
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        "Hủy phiếu thất bại";
      toast.error(msg);
    } finally {
      setSubmitting(false);
      setShowCancelModal(false);
    }
  };

  const handleRejectMismatch = async () => {
    if (!detail) return;
    setSubmitting(true);
    try {
      const res = await returnInspectionApi.process(sheetId, {
        scannedSerial: scannedSerial.trim(),
        judgment: "DEFECTIVE",
        rejectMismatch: true,
        rejectReason: `IMEI không khớp — hệ thống: ${detail.serialCode}, quét: ${scannedSerial.trim()}`,
      });
      if (res.data.success) {
        toast.error("Đã từ chối nhận hàng — IMEI không khớp");
        router.push("/admin/return");
      }
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        "Từ chối thất bại";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirm = async () => {
    if (!detail || !isEditable) return;
    if (!scannedSerial.trim()) {
      toast.error("Quét lại Serial trên thiết bị để đối chiếu");
      return;
    }
    if (!serialMatch) {
      toast.error("IMEI không khớp — dùng nút Từ chối nhận hàng");
      return;
    }
    if (judgment === "DEFECTIVE" && !detailReason.trim()) {
      toast.error("Mô tả tình trạng hàng lỗi/hư hỏng");
      return;
    }
    if (judgment === "DEFECTIVE" && !evidenceUrl) {
      toast.error("Hàng lỗi — bắt buộc tải ảnh minh chứng");
      return;
    }

    setSubmitting(true);
    try {
      const res = await returnInspectionApi.process(sheetId, {
        scannedSerial: scannedSerial.trim(),
        judgment,
        defectCause: judgment === "DEFECTIVE" ? defectCause : undefined,
        detailReason: detailReason.trim() || undefined,
        warehouseNote: warehouseNote.trim() || undefined,
        evidenceUrl: judgment === "DEFECTIVE" ? evidenceUrl : undefined,
      });
      if (res.data.success) {
        toast.success(
          judgment === "GOOD"
            ? "Đã hoàn kho — hàng nguyên vẹn, tồn bán +1"
            : "Đã cách ly DEFECTIVE — không tăng tồn bán"
        );
        if (judgment === "DEFECTIVE") {
          try {
            const labelRes = await returnInspectionApi.defectLabel(sheetId);
            if (labelRes.data.success) printDefectLabel(labelRes.data.data);
          } catch {
            toast.error("Xử lý xong nhưng in nhãn thất bại — dùng nút In nhãn trên phiếu");
          }
        }
        router.push("/admin/return");
      }
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        "Xác nhận thất bại";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !detail) {
    return (
      <div className="rounded-xl border border-gray-3/50 bg-white p-10 text-center text-sm text-[#8D93A5]">
        Đang tải phiếu kiểm định...
      </div>
    );
  }

  const statusBadge: Record<string, string> = {
    pending: "bg-[#FEF3C7] text-yellow-dark-2",
    draft: "bg-[#DBEAFE] text-[#1D4ED8]",
    processed: "bg-green-light-6 text-green",
    rejected: "bg-red-light-6 text-red",
    cancelled: "bg-gray-3 text-[#6C6F93]",
  };

  const statusText: Record<string, string> = {
    pending: "Chờ kiểm định",
    draft: "Lưu tạm",
    processed: "Đã xử lý",
    rejected: "Từ chối",
    cancelled: "Đã hủy",
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link href="/admin/return" className="text-sm text-[#3C50E0] hover:underline">
            ← Danh sách phiếu hoàn
          </Link>
          <h2 className="text-xl font-bold text-dark mt-2 flex items-center gap-2 flex-wrap">
            {detail.sheetCode}
            <span
              className={`text-xs px-2.5 py-1 rounded-full font-bold uppercase ${
                statusBadge[detail.status] ?? "bg-gray-3 text-[#6C6F93]"
              }`}
            >
              {statusText[detail.status] ?? detail.status}
            </span>
          </h2>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {detail.orderWarehouseConfirmed && (
            <span className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-green-light-6 text-green inline-flex items-center gap-1.5">
              <IconCheck size={14} className="shrink-0" />
              Kho đã xác nhận đủ serial đơn — Kế toán có thể hoàn tiền
            </span>
          )}
          {isEditable && (
            <>
              <button
                type="button"
                disabled={submitting}
                onClick={() => void handleSaveDraft()}
                className="px-4 py-2 rounded-xl border border-[#3C50E0] text-[#3C50E0] text-sm font-bold hover:bg-[#3C50E0]/5 inline-flex items-center gap-2"
              >
                <IconSave size={16} className="shrink-0" />
                Lưu tạm
              </button>
              <button
                type="button"
                disabled={submitting}
                onClick={() => setShowCancelModal(true)}
                className="px-4 py-2 rounded-xl border border-gray-3 text-[#6C6F93] text-sm font-semibold hover:bg-gray-1"
              >
                Hủy phiếu
              </button>
            </>
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-3/50 p-6">
        <h3 className="font-bold text-dark mb-4">Thông tin truy vết (đối chiếu vật lý)</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
          <div>
            <p className="text-xs text-[#8D93A5] uppercase font-bold">Mã đơn gốc</p>
            <p className="font-semibold text-dark mt-0.5">{detail.orderCode ?? "—"}</p>
          </div>
          <div>
            <p className="text-xs text-[#8D93A5] uppercase font-bold">Khách hàng</p>
            <p className="font-semibold text-dark mt-0.5">{detail.customerName ?? "—"}</p>
            <p className="text-[#6C6F93]">{detail.customerPhone ?? ""}</p>
          </div>
          <div>
            <p className="text-xs text-[#8D93A5] uppercase font-bold">Vận đơn</p>
            <p className="font-mono font-semibold mt-0.5">{detail.trackingCode ?? "—"}</p>
          </div>
          <div className="sm:col-span-2">
            <p className="text-xs text-[#8D93A5] uppercase font-bold">Sản phẩm</p>
            <p className="font-semibold text-dark mt-0.5">{detail.productName ?? "—"}</p>
            <p className="text-[#6C6F93]">
              {detail.variantName} · SKU {detail.skuCode}
            </p>
          </div>
          <div>
            <p className="text-xs text-[#8D93A5] uppercase font-bold">Serial / IMEI (hệ thống)</p>
            <p className="font-mono text-lg font-bold text-[#DC2626] mt-0.5">
              {detail.serialCode ?? "—"}
            </p>
          </div>
        </div>
      </div>

      {isEditable ? (
        <>
          <div className="bg-[#FFFBEB] border border-amber-200 rounded-xl p-4 text-sm text-amber-900">
            So sánh IMEI trên màn hình với tem trên máy. Nếu không khớp →{" "}
            <strong>khách có thể tráo hàng</strong> — từ chối nhận ngay.
            {detail.status === "draft" && (
              <span className="block mt-2 text-[#1D4ED8] font-semibold">
                Phiếu đang lưu tạm — tiếp tục quét và xác nhận khi sẵn sàng.
              </span>
            )}
          </div>

          <div className="bg-white rounded-2xl border border-gray-3/50 p-6 space-y-4">
            <label className="block text-sm">
              <span className="font-bold text-dark">Quét lại Serial trên thiết bị *</span>
              <input
                ref={scanRef}
                value={scannedSerial}
                onChange={(e) => setScannedSerial(e.target.value)}
                placeholder="Quét IMEI trên máy đang cầm..."
                className={`mt-2 w-full px-4 py-3 border-2 rounded-xl font-mono text-sm outline-none ${
                  scannedSerial && !serialMatch
                    ? "border-red bg-red-light-6/30"
                    : "border-[#3C50E0]/30 focus:border-[#3C50E0]"
                }`}
              />
              {scannedSerial && !serialMatch && (
                <p className="text-red text-xs font-semibold mt-2 inline-flex items-center gap-1.5">
                  <IconAlertTriangle size={14} className="shrink-0" />
                  IMEI không khớp hệ thống!
                </p>
              )}
            </label>

            {!serialMatch && scannedSerial.trim() && (
              <button
                type="button"
                disabled={submitting}
                onClick={() => void handleRejectMismatch()}
                className="w-full py-3 rounded-xl border-2 border-red text-red font-bold text-sm hover:bg-red-light-6/30 inline-flex items-center justify-center gap-2"
              >
                <IconX size={16} className="shrink-0" />
                Từ chối nhận hàng (IMEI không khớp)
              </button>
            )}
          </div>

          <div className="bg-white rounded-2xl border border-gray-3/50 p-6 space-y-4">
            <h3 className="font-bold text-dark">Đánh giá tình trạng hàng hóa *</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setJudgment("GOOD")}
                className={`text-left p-5 rounded-2xl border-2 transition-all ${
                  judgment === "GOOD"
                    ? "border-green bg-green-light-6/40 shadow-sm"
                    : "border-gray-3 hover:border-green/50"
                }`}
              >
                <p className="font-bold text-green text-base flex items-center gap-2">
                  <StatusDot color="green" />
                  Hàng còn nguyên vẹn / Boom hàng
                </p>
                <p className="text-xs text-[#6C6F93] mt-2">
                  Đưa lại kho bán — Serial AVAILABLE, tồn kho website +1.
                </p>
              </button>
              <button
                type="button"
                onClick={() => setJudgment("DEFECTIVE")}
                className={`text-left p-5 rounded-2xl border-2 transition-all ${
                  judgment === "DEFECTIVE"
                    ? "border-red bg-red-light-6/30 shadow-sm"
                    : "border-gray-3 hover:border-red/40"
                }`}
              >
                <p className="font-bold text-red text-base flex items-center gap-2">
                  <StatusDot color="red" />
                  Hàng đã khui / Lỗi / Hư hỏng
                </p>
                <p className="text-xs text-[#6C6F93] mt-2">
                  Cách ly DEFECTIVE — không tăng tồn kho bán.
                </p>
              </button>
            </div>

            {judgment === "DEFECTIVE" && (
              <>
                <div className="pl-1 space-y-2 border-l-4 border-red/40 ml-2">
                  <p className="text-xs font-bold text-red uppercase">Nguyên nhân lỗi *</p>
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input
                      type="radio"
                      name="defectCause"
                      checked={defectCause === "SHIPPING"}
                      onChange={() => setDefectCause("SHIPPING")}
                    />
                    Lỗi do Hãng vận chuyển (GHN/GHTK) — kiện đòi bồi thường
                  </label>
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input
                      type="radio"
                      name="defectCause"
                      checked={defectCause === "MANUFACTURER"}
                      onChange={() => setDefectCause("MANUFACTURER")}
                    />
                    Lỗi sản xuất / kỹ thuật từ nhà máy — xuất trả hãng
                  </label>
                </div>

                <div className="rounded-xl border border-red/30 bg-red-light-6/20 p-4 space-y-3">
                  <p className="text-sm font-bold text-red">Ảnh minh chứng hàng lỗi *</p>
                  <div className="flex flex-wrap items-center gap-3">
                    <input
                      ref={evidenceInputRef}
                      type="file"
                      accept="image/*"
                      disabled={uploadingEvidence}
                      onChange={(e) => void handleEvidenceChange(e.target.files?.[0] ?? null)}
                      className="text-sm"
                    />
                    {uploadingEvidence && (
                      <span className="text-xs text-[#8D93A5]">Đang tải lên...</span>
                    )}
                  </div>
                  {evidenceUrl && (
                    <div className="flex items-start gap-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={evidenceUrl}
                        alt="Minh chứng hàng lỗi"
                        className="h-24 w-24 object-cover rounded-lg border border-gray-3"
                      />
                      <button
                        type="button"
                        onClick={() => setEvidenceUrl("")}
                        className="text-xs text-red hover:underline"
                      >
                        Xóa ảnh
                      </button>
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => void handlePrintLabel()}
                    className="text-xs font-semibold text-[#3C50E0] hover:underline inline-flex items-center gap-1.5"
                  >
                    <IconPrint size={14} className="shrink-0" />
                    Xem trước / In nhãn cách ly
                  </button>
                </div>
              </>
            )}

            <textarea
              value={detailReason}
              onChange={(e) => setDetailReason(e.target.value)}
              rows={3}
              placeholder="Mô tả / lý do chi tiết (vd: Màn sọc, vỏ xước, boom hàng nguyên seal...)"
              className="w-full px-4 py-3 border border-gray-3 rounded-xl text-sm resize-none"
            />
            <textarea
              value={warehouseNote}
              onChange={(e) => setWarehouseNote(e.target.value)}
              rows={2}
              placeholder="Ghi chú kho (tùy chọn)"
              className="w-full px-4 py-3 border border-gray-3 rounded-xl text-sm resize-none"
            />

            <PrimaryButton
              type="button"
              disabled={submitting || !serialMatch || !scannedSerial.trim()}
              onClick={() => void handleConfirm()}
              className="inline-flex items-center gap-2"
            >
              {submitting ? (
                "Đang xử lý..."
              ) : (
                <>
                  <IconCheckCircle size={18} className="shrink-0" />
                  Xác nhận hoàn kho
                </>
              )}
            </PrimaryButton>
          </div>
        </>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-3/50 p-6 space-y-3 text-sm">
          <p>
            <span className="text-[#8D93A5]">Phán quyết:</span>{" "}
            <strong>{detail.judgment === "GOOD" ? "Nguyên vẹn" : "Lỗi / DEFECTIVE"}</strong>
          </p>
          {detail.defectCause && (
            <p>
              <span className="text-[#8D93A5]">Nguyên nhân:</span>{" "}
              {detail.defectCause === "SHIPPING" ? "Vận chuyển" : "Sản xuất"}
            </p>
          )}
          {detail.detailReason && (
            <p>
              <span className="text-[#8D93A5]">Mô tả:</span> {detail.detailReason}
            </p>
          )}
          {detail.evidenceUrl && (
            <div>
              <p className="text-[#8D93A5] mb-2">Ảnh minh chứng:</p>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={detail.evidenceUrl}
                alt="Minh chứng"
                className="max-h-48 rounded-lg border border-gray-3"
              />
            </div>
          )}
          {detail.rejectReason && (
            <p className="text-red">
              <span className="font-semibold">Từ chối:</span> {detail.rejectReason}
            </p>
          )}
          {detail.cancelReason && (
            <p className="text-[#6C6F93]">
              <span className="font-semibold">Lý do hủy:</span> {detail.cancelReason}
            </p>
          )}
          {detail.processedAt && (
            <p className="text-[#8D93A5]">Xử lý lúc: {detail.processedAt}</p>
          )}
          {detail.judgment === "DEFECTIVE" && detail.status === "processed" && (
            <button
              type="button"
              onClick={() => void handlePrintLabel()}
              className="mt-2 px-4 py-2 rounded-xl border-2 border-red text-red font-bold text-sm hover:bg-red-light-6/30 inline-flex items-center gap-2"
            >
              <IconPrint size={16} className="shrink-0" />
              In nhãn cách ly DEFECTIVE
            </button>
          )}
        </div>
      )}

      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 space-y-4">
            <h3 className="font-bold text-dark">Hủy phiếu kiểm định</h3>
            <p className="text-sm text-[#6C6F93]">
              Nhập lý do hủy (vd: nhầm kiện, trùng phiếu, khách không hoàn...).
            </p>
            <textarea
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              rows={3}
              className="w-full px-4 py-3 border border-gray-3 rounded-xl text-sm resize-none"
              placeholder="Lý do hủy *"
            />
            <div className="flex gap-3 justify-end">
              <button
                type="button"
                disabled={submitting}
                onClick={() => setShowCancelModal(false)}
                className="px-4 py-2 text-sm text-[#6C6F93]"
              >
                Đóng
              </button>
              <button
                type="button"
                disabled={submitting}
                onClick={() => void handleCancel()}
                className="px-4 py-2 rounded-xl bg-red text-white text-sm font-bold"
              >
                Xác nhận hủy
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
